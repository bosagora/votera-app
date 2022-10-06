import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Image, FlatList, ListRenderItemInfo, ImageURISource } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import ProposalCard from '~/components/proposal/ProposalCard';
import { Proposal, useGetProposalsLazyQuery } from '~/graphql/generated/generated';
import { MainScreenProps } from '~/navigation/main/MainParams';
import globalStyle from '~/styles/global';
import { ProposalFilterType } from '~/types/filterType';
import { ProposalContext } from '~/contexts/ProposalContext';
import ListFooterButton from '~/components/button/ListFooterButton';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { AuthContext } from '~/contexts/AuthContext';

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;

enum EnumIconAsset {
    Background = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/header/bg.png')];

function getMyProposalVariables(filter: ProposalFilterType, memberId?: string) {
    return {
        limit: FETCH_INIT_LIMIT,
        sort: filter === ProposalFilterType.LATEST ? 'createdAt:desc' : 'memberCount:desc,createdAt:desc',
        where: { creator: memberId },
    };
}

function MyProposalListScreen({ navigation, route }: MainScreenProps<'MyProposalList'>): JSX.Element {
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const [proposals, setProposals] = useState<Proposal[]>();
    const [proposalCount, setProposalCount] = useState<number>();
    const [filter, setFilter] = useState<ProposalFilterType>(ProposalFilterType.LATEST);
    const { fetchProposal } = useContext(ProposalContext);
    const { user } = useContext(AuthContext);
    const [pullRefresh, setPullRefresh] = useState(false);
    const [assets] = useAssets(iconAssets);

    const [getMyProposals, { data: resProposalsConnectionData, fetchMore: myFetchMore, loading: myLoading, client }] =
        useGetProposalsLazyQuery({
            fetchPolicy: 'cache-and-network',
            onError: (error) => {
                console.log('getMyProposals error: ', error);
                setPullRefresh(false);
            },
        });

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => navigation.goBack()}
                icon={<Icon name="chevron-left" color="white" tvParallaxProperties={undefined} />}
                type="clear"
            />
        );
    }, [navigation]);

    const headerBackground = useCallback(() => {
        return (
            <>
                {assets && (
                    <Image
                        style={{ height: 65 + insets.top, width: '100%' }}
                        source={assets[EnumIconAsset.Background] as ImageURISource}
                    />
                )}
                <View style={globalStyle.headerBackground} />
            </>
        );
    }, [assets, insets.top]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: getString('내가 작성한 제안'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerLeft,
            headerBackground,
        });
    }, [navigation, headerLeft, headerBackground]);

    useEffect(() => {
        const variables = getMyProposalVariables(filter, user?.memberId);
        getMyProposals({ variables }).catch(console.log);
    }, [filter, getMyProposals, user?.memberId]);

    useEffect(() => {
        if (resProposalsConnectionData?.listProposal) {
            setProposals(resProposalsConnectionData.listProposal.values as Proposal[]);
            setProposalCount(resProposalsConnectionData.listProposal.count || 0);
            setPullRefresh(false);
        }
    }, [resProposalsConnectionData]);

    const renderCountBar = useCallback(() => {
        return (
            <View style={{ paddingHorizontal: 20, paddingTop: 30, backgroundColor: 'white' }}>
                <Text style={[globalStyle.ltext, { fontSize: 10 }]}>
                    {getString('작성완료 제안 #N').replace('#N', proposalCount?.toString() || '0')}
                </Text>
            </View>
        );
    }, [proposalCount]);

    const renderProposals = ({ item }: ListRenderItemInfo<Proposal>) => {
        const { proposalId } = item;
        if (!proposalId) return null;

        return (
            <View style={{ paddingHorizontal: 22, backgroundColor: 'white' }}>
                <ProposalCard
                    item={item}
                    temp={false}
                    onPress={() => {
                        if (item.proposalId) {
                            fetchProposal(item.proposalId);
                            navigation.navigate('ProposalDetail', { id: item.proposalId });
                        } else {
                            dispatch(showSnackBar(getString('제안서 정보가 올바르지 않습니다')));
                        }
                    }}
                />
            </View>
        );
    };

    return (
        <FlatList
            style={{ flex: 1 }}
            data={proposals}
            renderItem={renderProposals}
            keyExtractor={(item) => item.id}
            onEndReached={(info) => {
                if (myFetchMore && !myLoading) {
                    myFetchMore({
                        variables: {
                            limit: FETCH_MORE_LIMIT,
                            start: proposals?.length,
                        },
                    }).catch(console.log);
                }
            }}
            onEndReachedThreshold={0.5}
            onRefresh={() => {
                if (!myLoading) {
                    setPullRefresh(true);
                    const variables = getMyProposalVariables(filter, user?.memberId);
                    client.cache.evict({
                        fieldName: 'listProposal',
                        args: variables,
                        broadcast: false,
                    });
                    getMyProposals({ variables }).catch(console.log);
                }
            }}
            refreshing={pullRefresh}
            ListHeaderComponent={renderCountBar}
            ListFooterComponent={<ListFooterButton onPress={() => console.log('click')} />}
        />
    );
}

export default MyProposalListScreen;
