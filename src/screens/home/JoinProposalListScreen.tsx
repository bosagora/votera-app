import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Image, FlatList, ListRenderItemInfo, ImageURISource, StyleSheet } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import FilterButton from '~/components/button/FilterButton';
import ProposalCard from '~/components/proposal/ProposalCard';
import { Proposal, useGetMemberRolesLazyQuery } from '~/graphql/generated/generated';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
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

const styles = StyleSheet.create({
    container: { flex: 1 },
    countBar: { paddingLeft: 21, paddingRight: 17, paddingTop: 30, zIndex: 1 },
    countLabel: { fontSize: 13, lineHeight: 21 },
    countNumber: { fontSize: 13, lineHeight: 21, marginLeft: 7 },
    item: { paddingLeft: 21, paddingRight: 23 },
});

function getJoinProposalVariables(filter: ProposalFilterType, memberId?: string) {
    return {
        limit: FETCH_INIT_LIMIT,
        sort: filter === ProposalFilterType.LATEST ? 'createdAt:desc' : 'memberCount:desc,createdAt:desc',
        // eslint-disable-next-line camelcase
        where: { scope: 'PROPOSAL', status_in: ['PENDING', 'NORMAL'], member: memberId },
    };
}

function JoinProposalListScreen({ navigation, route }: MainScreenProps<'JoinProposalList'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const [proposals, setProposals] = useState<Proposal[]>();
    const [proposalCount, setProposalCount] = useState<number>();
    const [filter, setFilter] = useState<ProposalFilterType>(ProposalFilterType.LATEST);
    const { fetchProposal } = useContext(ProposalContext);
    const { user } = useContext(AuthContext);
    const [pullRefresh, setPullRefresh] = useState(false);
    const [assets] = useAssets(iconAssets);

    const [getJoinProposals, { data: resMemberRolesData, fetchMore: joinFetchMore, loading: joinLoading, client }] =
        useGetMemberRolesLazyQuery({
            fetchPolicy: 'cache-and-network',
            onError: (error) => {
                console.log('getJoinProposals error: ', error);
                setPullRefresh(false);
            },
        });

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.pop();
                    } else {
                        navigation.dispatch(replaceToHome());
                    }
                }}
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
                        style={{ height: TOP_NAV_HEIGHT + insets.top, width: '100%' }}
                        source={assets[EnumIconAsset.Background] as ImageURISource}
                    />
                )}
                <View style={globalStyle.headerBackground} />
            </>
        );
    }, [assets, insets.top]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: getString('내가 참여한 제안'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerTitleAlign: 'center',
            headerLeft,
            headerBackground,
            headerShown: true,
        });
    }, [navigation, headerLeft, headerBackground]);

    useEffect(() => {
        const variables = getJoinProposalVariables(filter, user?.memberId);
        getJoinProposals({ variables }).catch(console.log);
    }, [filter, getJoinProposals, user?.memberId]);

    useEffect(() => {
        if (resMemberRolesData?.memberRolesConnection?.values) {
            setProposalCount(resMemberRolesData?.memberRolesConnection.aggregate?.count || 0);
            setProposals(
                resMemberRolesData?.memberRolesConnection.values.map((memberRole) => {
                    return memberRole?.proposal as Proposal;
                }),
            );
            setPullRefresh(false);
        }
    }, [resMemberRolesData]);

    const renderCountBar = useCallback(() => {
        return (
            <View style={[globalStyle.flexRowBetween, styles.countBar]}>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.ltext, styles.countLabel, { color: themeContext.color.textBlack }]}>
                        {getString('참여한 제안')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.countNumber, { color: themeContext.color.textBlack }]}>
                        {proposalCount?.toString() || '0'}
                    </Text>
                </View>
                <FilterButton
                    filterType={ProposalFilterType}
                    currentFilter={filter}
                    setFilter={(value) => {
                        setFilter(value as ProposalFilterType);
                    }}
                />
            </View>
        );
    }, [filter, proposalCount, themeContext.color.textBlack]);

    const renderProposals = ({ item }: ListRenderItemInfo<Proposal>) => {
        const { proposalId } = item;
        if (!proposalId) return null;

        return (
            <View style={styles.item}>
                <ProposalCard
                    item={item}
                    temp={false}
                    onPress={() => {
                        if (item.proposalId) {
                            fetchProposal(item.proposalId);
                            navigation.push('RootUser', { screen: 'ProposalDetail', params: { id: item.proposalId } });
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
            style={[styles.container, { backgroundColor: themeContext.color.white }]}
            data={proposals}
            renderItem={renderProposals}
            keyExtractor={(item) => item.id}
            onEndReached={(info) => {
                if (joinFetchMore && !joinLoading) {
                    joinFetchMore({
                        variables: {
                            limit: FETCH_MORE_LIMIT,
                            start: proposals?.length,
                        },
                    }).catch(console.log);
                }
            }}
            onEndReachedThreshold={0.5}
            onRefresh={() => {
                if (!joinLoading) {
                    setPullRefresh(true);
                    const variables = getJoinProposalVariables(filter, user?.memberId);
                    client.cache.evict({
                        fieldName: 'memberRolesConnection',
                        args: variables,
                        broadcast: false,
                    });
                    getJoinProposals({ variables }).catch(console.log);
                }
            }}
            refreshing={pullRefresh}
            ListHeaderComponent={renderCountBar}
            ListHeaderComponentStyle={{ zIndex: 1 }}
            ListFooterComponent={<ListFooterButton onPress={() => console.log('click')} />}
            ListEmptyComponent={
                <View style={[globalStyle.flexRowCenter, { height: 120 }]}>
                    <Text style={[globalStyle.rtext, { fontSize: 13, color: themeContext.color.disabled }]}>
                        {getString('참여한 제안이 없습니다&#46;')}
                    </Text>
                </View>
            }
        />
    );
}

export default JoinProposalListScreen;
