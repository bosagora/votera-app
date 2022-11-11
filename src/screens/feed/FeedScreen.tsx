import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Image, FlatList, ListRenderItemInfo, ImageURISource, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { Reference } from '@apollo/client';
import { Modifiers } from '@apollo/client/cache/core/types/common';
import stringify from 'fast-json-stable-stringify';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import FeedCard from '~/components/feed/FeedCard';
import { ComponentNavigationNavigation, getNavigationType } from '~/utils/feed/feedUtils';
import { Feeds, useGetFeedsLazyQuery } from '~/graphql/generated/generated';
// import { useNotificationsSubscription } from '~/graphql/hooks/Subscriptions';
import { useUpdateFeed } from '~/graphql/hooks/Feed';
import { FeedFilterType } from '~/types/filterType';
import FilterButton from '~/components/button/FilterButton';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { ChevronLeftIcon } from '~/components/icons';
import ListFooterButton from '~/components/button/ListFooterButton';

enum EnumIconAsset {
    Logo = 0,
    Background,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/votera/voteraLogoWhite.png'), require('@assets/images/header/bg.png')];

const styles = StyleSheet.create({
    container: { flex: 1 },
    countBar: { paddingLeft: 21, paddingRight: 17, paddingTop: 30 },
    countLabel: { fontSize: 13, lineHeight: 21 },
    countNumber: { fontSize: 13, lineHeight: 21, marginLeft: 7 },
    headerTitle: { color: 'white', fontSize: 16, paddingLeft: 7 },
    item: { paddingLeft: 21, paddingRight: 23, zIndex: 0 },
});

const FETCH_INIT_LIMIT = 10;
const FETCH_MORE_LIMIT = 10;

function getVariablesForQuery(target: string, filter: FeedFilterType) {
    let where;
    switch (filter) {
        case FeedFilterType.READ:
            where = { target, isRead: true };
            break;
        case FeedFilterType.NO_READ:
            where = { target, isRead: false };
            break;
        default:
            where = { target };
            break;
    }
    return {
        limit: FETCH_INIT_LIMIT,
        sort: 'createdAt:desc',
        where,
    };
}

interface ListFeedsPayloadObject {
    __typename?: string;
    count?: number;
    notReadCount?: number;
    values?: Reference[] | undefined;
}

function Feed({ navigation }: MainScreenProps<'Feed'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const { user, refetchFeedCount, feedCount } = useContext(AuthContext);
    const [feeds, setFeeds] = useState<Feeds[]>([]);
    const [count, setCount] = useState(0);
    const [notReadCount, setNotReadCount] = useState(0);
    const [filter, setFilter] = useState<FeedFilterType>(FeedFilterType.LATEST);
    const [assets] = useAssets(iconAssets);
    const [pullRefresh, setPullRefresh] = useState(false);
    const updateFeed = useUpdateFeed();
    const [getFeeds, { data: feedsData, fetchMore, loading, client }] = useGetFeedsLazyQuery({
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
        onError: (error) => {
            setPullRefresh(false);
        },
    });
    // const { loading, error, data: subResponse } = useNotificationsSubscription({
    //     variables: {
    //         input: {
    //             berId: feedAddress,
    //         },
    //     },
    // });

    const headerTitle = useCallback(() => {
        return (
            <View style={globalStyle.flexRowAlignCenter}>
                {assets && <Image source={assets[EnumIconAsset.Logo] as ImageURISource} />}
                <Text style={[globalStyle.btext, styles.headerTitle]}>{getString('알림')}</Text>
            </View>
        );
    }, [assets]);

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
            headerTitleAlign: 'center',
            title: getString('알림'),
            headerTitle,
            headerLeft,
            headerBackground,
            headerShown: true,
        });
    }, [headerBackground, headerLeft, headerTitle, navigation]);

    useEffect(() => {
        if (feedsData?.listFeeds) {
            const values = feedsData.listFeeds.values as Feeds[];
            const valueCount = feedsData.listFeeds.count ?? 0;

            setCount(valueCount);
            setNotReadCount(feedsData.listFeeds.notReadCount ?? 0);
            setFeeds(values.length > valueCount ? values.slice(0, valueCount) : values);
            setPullRefresh(false);
        }
    }, [feedsData]);

    useEffect(() => {
        if (filter && user?.userId) {
            const variables = getVariablesForQuery(user?.userId || '', filter);
            client.cache.evict({
                fieldName: 'listFeeds',
                args: variables,
                broadcast: false,
            });
            getFeeds({ variables }).catch(console.log);
        }
    }, [client.cache, filter, getFeeds, user?.userId]);

    const decreaseCount = useCallback(() => {
        setNotReadCount(notReadCount > 0 ? notReadCount - 1 : 0);
        refetchFeedCount(feedCount > 0 ? feedCount - 1 : 0);
    }, [feedCount, notReadCount, refetchFeedCount]);

    const renderCountBar = useCallback(() => {
        return (
            <View style={[globalStyle.flexRowBetween, styles.countBar]}>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.ltext, styles.countLabel, { color: themeContext.color.textBlack }]}>
                        {getString('새알림')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.countNumber, { color: themeContext.color.textBlack }]}>
                        {filter === FeedFilterType.READ ? 0 : notReadCount || 0}/{count || 0}
                    </Text>
                </View>
                <FilterButton
                    filterType={FeedFilterType}
                    currentFilter={filter}
                    setFilter={(value) => {
                        setFilter(value as FeedFilterType);
                    }}
                    style={{ width: 140 }}
                />
            </View>
        );
    }, [count, filter, notReadCount, themeContext.color.textBlack]);

    const modifyCache = useCallback(
        (id: string) => {
            const { limit, ...variables } = getVariablesForQuery(user?.userId || '', FeedFilterType.NO_READ);
            const targetFieldName = `listFeeds:${stringify(variables)}`;
            const fields: Modifiers = {};
            fields[targetFieldName] = (existingRef: ListFeedsPayloadObject, { readField }) => {
                const foundIndex = existingRef.values?.findIndex((feedsRef) => id === readField('id', feedsRef));
                if (foundIndex === undefined || foundIndex === -1) {
                    return existingRef;
                }
                const response = { ...existingRef };
                response.values = response.values?.filter((_, index) => index !== foundIndex);
                response.count = (existingRef.count ?? 1) - 1;
                response.notReadCount = (existingRef.notReadCount ?? 1) - 1;
                return response;
            };
            client.cache.modify({ id: 'ROOT_QUERY', fields });
        },
        [client.cache, user?.userId],
    );

    const renderFeedCard = useCallback(
        (info: ListRenderItemInfo<Feeds>): JSX.Element => {
            const { id, type, isRead } = info.item;

            return (
                <View style={styles.item}>
                    <FeedCard
                        item={info.item}
                        onPress={() => {
                            if (!isRead) {
                                updateFeed(id)
                                    .then((value) => {
                                        modifyCache(id);
                                        decreaseCount();
                                    })
                                    .catch(console.log);
                            }
                            const stackAction = getNavigationType(
                                type,
                                (info.item.navigation as ComponentNavigationNavigation) || undefined,
                            );
                            if (stackAction) {
                                navigation.dispatch(stackAction);
                            }
                        }}
                    />
                </View>
            );
        },
        [decreaseCount, modifyCache, navigation, updateFeed],
    );

    return (
        <FlatList
            style={[styles.container, { backgroundColor: themeContext.color.white }]}
            data={feeds}
            renderItem={renderFeedCard}
            keyExtractor={(item) => item.id}
            onEndReached={(info) => {
                if (fetchMore && !loading) {
                    fetchMore({
                        variables: {
                            limit: FETCH_MORE_LIMIT,
                            start: feeds?.length,
                        },
                    }).catch(console.log);
                }
            }}
            onEndReachedThreshold={0.5}
            onRefresh={() => {
                if (!loading) {
                    setPullRefresh(true);
                    const variables = getVariablesForQuery(user?.userId || '', filter);
                    client.cache.evict({
                        fieldName: 'listFeeds',
                        args: variables,
                        broadcast: false,
                    });
                    getFeeds({ variables }).catch(console.log);
                }
            }}
            refreshing={pullRefresh}
            ListHeaderComponent={renderCountBar}
            ListHeaderComponentStyle={{ zIndex: 1 }}
            ListFooterComponent={<ListFooterButton onPress={() => console.log('click ListFooter')} />}
        />
    );
}

export default Feed;
