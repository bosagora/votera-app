import React, { useContext, useState, useCallback } from 'react';
import { View, Image, FlatList, Alert, ListRenderItemInfo, ImageURISource, Platform, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAssets } from 'expo-asset';
import ProposalCard from '~/components/proposal/ProposalCard';
import {
    Enum_Proposal_Status as EnumProposalStatus,
    Enum_Proposal_Type as EnumProposalType,
    Proposal,
} from '~/graphql/generated/generated';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
import LocalStorage from '~/utils/LocalStorage';
import ListFooterButton from '~/components/button/ListFooterButton';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { ChevronLeftIcon } from '~/components/icons';

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

function TempProposalListScreen({ navigation, route }: MainScreenProps<'TempProposalList'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const [proposals, setProposals] = useState<Proposal[]>();
    const [proposalCount, setProposalCount] = useState<number>();
    const [assets] = useAssets(iconAssets);

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
                icon={<ChevronLeftIcon color="white" />}
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
            headerShown: true,
            title: getString('임시저장 제안'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerTitleAlign: 'center',
            headerLeft,
            headerBackground,
        });
    }, [navigation, headerLeft, headerBackground]);

    useFocusEffect(
        useCallback(() => {
            console.log('TempProposalListScren.focusEffect');
            let isMounted = true;
            LocalStorage.allTemporaryProposals()
                .then((tempDatas) => {
                    const parsing = tempDatas.map((temp) => {
                        console.log(`read proposal id=${temp.id || ''} name=${temp.name}`);
                        const item: Proposal = {
                            id: temp.id || '',
                            name: temp.name,
                            description: temp.description,
                            type: temp.type as EnumProposalType,
                            status: EnumProposalStatus.Created,
                            fundingAmount: temp.fundingAmount,
                            votePeriod: {
                                id: 'testVotePeriod',
                                begin: temp.startDate ? new Date(temp.startDate) : undefined,
                                end: temp.endDate ? new Date(temp.endDate) : undefined,
                            },
                            createdAt: temp.timestamp,
                            updatedAt: Date.now(),
                            likeCount: 0,
                            memberCount: 0,
                        };
                        return item;
                    });
                    if (isMounted) {
                        setProposals(parsing);
                        setProposalCount(parsing.length);
                    }
                })
                .catch(console.log);
            return () => {
                isMounted = false;
            };
        }, []),
    );

    const renderCountBar = useCallback(() => {
        return (
            <View style={[globalStyle.flexRowBetween, styles.countBar]}>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.ltext, styles.countLabel, { color: themeContext.color.textBlack }]}>
                        {getString('작성중인 제안')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.countNumber, { color: themeContext.color.textBlack }]}>
                        {proposalCount?.toString() || '0'}
                    </Text>
                </View>
            </View>
        );
    }, [proposalCount, themeContext.color.textBlack]);

    const renderProposals = ({ item }: ListRenderItemInfo<Proposal>) => {
        return (
            <View style={styles.item}>
                <ProposalCard
                    item={item}
                    temp
                    savedTime={item.createdAt as number}
                    onPress={() => {
                        navigation.push('RootUser', { screen: 'CreateProposal', params: { tempId: item.id }});
                    }}
                    onDelete={() => {
                        console.log(`onDelete id=${item.id}`);
                        if (Platform.OS === 'web') {
                            if (window.confirm(getString(`작성중인 제안서를 삭제하시겠습니까`))) {
                                try {
                                    LocalStorage.deleteTemporaryProposal(item.id).catch(console.log);
                                    const filtered = proposals?.filter((proposal) => proposal.id !== item.id);
                                    setProposals(filtered);
                                    setProposalCount(filtered?.length);
                                } catch (err) {
                                    console.log('catch exception while delete : ', err);
                                    dispatch(showSnackBar(getString('삭제하는 중에 오류가 발생했습니다')));
                                }
                            }
                        } else {
                            Alert.alert(getString('임시제안 삭제'), getString(`작성중인 제안서를 삭제하시겠습니까`), [
                                {
                                    text: 'Cancel',
                                    onPress: () => {
                                        console.log('cancel pressed');
                                    },
                                    style: 'cancel',
                                },
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        try {
                                            LocalStorage.deleteTemporaryProposal(item.id).catch(console.log);
                                            const filtered = proposals?.filter((proposal) => proposal.id !== item.id);
                                            setProposals(filtered);
                                            setProposalCount(filtered?.length);
                                        } catch (err) {
                                            console.log('catch exception while delete : ', err);
                                            dispatch(showSnackBar(getString('삭제하는 중에 오류가 발생했습니다')));
                                        }
                                    },
                                },
                            ]);
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
            ListHeaderComponent={renderCountBar}
            ListFooterComponent={<ListFooterButton onPress={() => console.log('click')} />}
        />
    );
}

export default TempProposalListScreen;
