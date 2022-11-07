import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ListRenderItemInfo, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import globalStyle from '~/styles/global';
import SearchInput from '~/components/input/SingleLineInput2';
import { Proposal, useGetProposalsLazyQuery } from '~/graphql/generated/generated';
import ProposalCard from '~/components/proposal/ProposalCard';
import LocalStorage from '~/utils/LocalStorage';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import { CancelIcon, ChevronLeftIcon, CloseIcon, SearchIcon } from '~/components/icons';

const LOCAL_SEARCH_HISTORY = 'local.search';

async function getLocalSearchHistory() {
    const searchHistory = await LocalStorage.getByKey<string[]>(LOCAL_SEARCH_HISTORY);
    return searchHistory || [];
}

async function saveLocalSearchHistory(history: string[]) {
    await LocalStorage.setByKey(LOCAL_SEARCH_HISTORY, history);
}

function Search({ navigation, route }: MainScreenProps<'Search'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const [searchValue, setSearchValue] = useState<string>('');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [width, setWidth] = useState(0);
    const [getProposals, { data: proposalsResponse, loading }] = useGetProposalsLazyQuery({
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true,
    });
    const [isSearched, setIsSearched] = useState<boolean>(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            getLocalSearchHistory()
                .then((values) => {
                    if (isMounted) {
                        setSearchHistory(values);
                    }
                })
                .catch((err) => {
                    console.log('getLocalSearchHistory error : ', err);
                });
            return () => {
                isMounted = false;
            };
        }, []),
    );

    useEffect(() => {
        if (proposalsResponse?.listProposal) {
            setProposals(proposalsResponse?.listProposal.values as Proposal[]);
        }
    }, [proposalsResponse]);

    const runSearch = useCallback(
        (keyword?: string) => {
            if (keyword) {
                getProposals({
                    variables: {
                        where: {
                            // eslint-disable-next-line camelcase
                            name_contains: keyword,
                        },
                    },
                }).catch(console.log);
                setIsSearched(true);

                const currentHistory = [...searchHistory];

                const foundHistoryIdx = currentHistory.findIndex((history) => history === keyword);
                if (foundHistoryIdx !== -1) {
                    currentHistory.splice(foundHistoryIdx, 1);
                }

                const valueLength = keyword.length;
                const splitChar = Array.from(keyword);
                const isNotEmptyStr = splitChar.some((char) => char !== ' ');

                if (valueLength > 0 && isNotEmptyStr) {
                    currentHistory.unshift(keyword);
                }
                if (currentHistory.length > 10) {
                    currentHistory.pop();
                }
                setSearchHistory(currentHistory);
                saveLocalSearchHistory(currentHistory).catch((err) => {
                    console.log('saveLocalSearchHistory error : ', err);
                });
            }
        },
        [getProposals, searchHistory],
    );

    const renderProposals = (info: ListRenderItemInfo<Proposal>): JSX.Element | null => {
        // FIXME: group에 deadline 프로퍼티 추가 해야함
        const { proposalId } = info.item;
        if (!proposalId) return null;

        return (
            <ProposalCard
                item={info.item}
                onPress={() => {
                    navigation.push('RootUser', { screen: 'ProposalDetail', params: { id: proposalId } });
                }}
            />
        );
    };

    function renderHistoryComponent() {
        return (
            <View style={{ paddingHorizontal: 23, paddingTop: 30, flexDirection: 'column' }}>
                <Text style={[globalStyle.rtext, { fontSize: 11, lineHeight: 19, color: themeContext.color.abstain }]}>
                    {getString('최근검색어')}
                </Text>
                <FlatList
                    style={{ paddingTop: 20 }}
                    keyExtractor={(item, index) => `searchHistory_${index}`}
                    scrollEnabled={false}
                    extraData={searchHistory}
                    data={searchHistory}
                    renderItem={({ index, item }) => {
                        return (
                            <View
                                style={[
                                    globalStyle.flexRowBetween,
                                    {
                                        paddingTop: 10,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => {
                                        setSearchValue(item);
                                        runSearch(item);
                                    }}
                                >
                                    <Text
                                        style={[
                                            globalStyle.rtext,
                                            { fontSize: 13, lineHeight: 33, color: themeContext.color.textBlack },
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                                <Button
                                    icon={<CloseIcon color={themeContext.color.textBlack} />}
                                    onPress={() => {
                                        const currentHistory = [...searchHistory];
                                        currentHistory.splice(index, 1);
                                        setSearchHistory(currentHistory);
                                        saveLocalSearchHistory(currentHistory).catch((err) => {
                                            console.log('saveLocalSearchHistory error : ', err);
                                        });
                                    }}
                                    type="clear"
                                />
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={globalStyle.flexRowCenter}>
                            <SearchIcon color={themeContext.color.disabled} />
                            <Text
                                style={[
                                    globalStyle.rtext,
                                    { fontSize: 13, lineHeight: 33, color: themeContext.color.disabled, marginLeft: 6 },
                                ]}
                            >
                                {getString('검색 내역이 없습니다')}
                            </Text>
                        </View>
                    }
                />
            </View>
        );
    }

    function renderSearchedComponent() {
        if (loading) {
            return (
                <View style={{ paddingTop: 30, height: 50 }}>
                    <ActivityIndicator />
                </View>
            );
        }
        return (
            <FlatList
                ListHeaderComponent={
                    <View style={{ paddingTop: 30, flexDirection: 'row' }}>
                        <Text
                            style={[
                                globalStyle.rtext,
                                { fontSize: 13, lineHeight: 23, color: themeContext.color.textBlack },
                            ]}
                        >
                            &apos;{searchValue}&apos; {getString('검색 결과')}{' '}
                        </Text>
                        <Text
                            style={[
                                globalStyle.ltext,
                                { fontSize: 13, lineHeight: 23, color: themeContext.color.primary, marginLeft: 19 },
                            ]}
                        >
                            {getString('#N 개').replace('#N', (proposals?.length || 0).toString())}
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => `proposal_${index}`}
                style={{ backgroundColor: 'white', paddingHorizontal: 23, paddingBottom: 160 }}
                data={proposals || []}
                renderItem={renderProposals}
                ListEmptyComponent={
                    <View style={globalStyle.flexRowCenter}>
                        <SearchIcon color={themeContext.color.disabled} />
                        <Text
                            style={[
                                globalStyle.rtext,
                                { fontSize: 13, lineHeight: 33, color: themeContext.color.disabled, marginLeft: 6 },
                            ]}
                        >
                            {getString('검색 결과가 없습니다&#46;')}
                        </Text>
                    </View>
                }
            />
        );
    }

    const headerTitle = useCallback(() => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={globalStyle.headerTitle}>{getString('검색')} </Text>
            </View>
        );
    }, []);

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
                icon={<ChevronLeftIcon color="black" />}
                type="clear"
            />
        );
    }, [navigation]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitleAlign: 'center',
            headerTitle,
            headerLeft,
            headerShown: true,
        });
    }, [navigation, headerTitle, headerLeft]);

    return (
        <View
            style={{ flex: 1, backgroundColor: themeContext.color.white }}
            onLayout={(event) => {
                setWidth(event.nativeEvent.layout.width);
            }}
        >
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <View style={{ paddingHorizontal: 23, paddingTop: 30 }}>
                <SearchInput
                    onChangeText={(text) => {
                        setSearchValue(text);
                        setIsSearched(false);
                        setProposals([]);
                    }}
                    searchValue={searchValue}
                    value={searchValue}
                    koreanInput
                    subComponent={
                        searchValue.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{
                                        width: 28,
                                        height: 28,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => runSearch(searchValue)}
                                    disabled={loading}
                                >
                                    <SearchIcon
                                        color={loading ? themeContext.color.disabled : themeContext.color.primary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSearchValue('');
                                        setIsSearched(false);
                                        setProposals([]);
                                    }}
                                >
                                    <CancelIcon
                                        color={loading ? themeContext.color.disabled : themeContext.color.primary}
                                        size={28}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                    onSubmitEditing={(e) => runSearch(e.nativeEvent.text)}
                    placeholderText={getString('검색어를 입력해주세요')}
                    inputStyle={{ width: width - 136 }}
                />
            </View>
            {!isSearched && renderHistoryComponent()}
            {isSearched && renderSearchedComponent()}
        </View>
    );
}

export default Search;
