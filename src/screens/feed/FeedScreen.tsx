import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Image, ListRenderItemInfo, ImageURISource, StyleSheet } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { Button, Icon, Text } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import FeedCard from '~/components/feed/FeedCard';
import {
    ComponentFeedCotentContent,
    ComponentNavigationNavigation,
    getFeed,
    getNavigationType,
} from '~/utils/feed/feedUtils';
import { Feeds, useGetFeedsLazyQuery } from '~/graphql/generated/generated';
// import { useNotificationsSubscription } from '~/graphql/hooks/Subscriptions';
import { useUpdateFeed } from '~/graphql/hooks/Feed';
import { FeedFilterType } from '~/types/filterType';
import FilterButton from '~/components/button/FilterButton';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { ChevronLeftIcon } from '~/components/icons';

enum EnumIconAsset {
    Logo = 0,
    Background,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/votera/voteraLogoWhite.png'), require('@assets/images/header/bg.png')];

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 15,
        top: 0,
    },
    headerTitle: { color: 'white', fontSize: 16, paddingLeft: 7 },
    listHeaderTitle: { fontSize: 13 },
    listHeaderValue: { fontSize: 13, paddingLeft: 10 },
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

function Feed({ navigation }: MainScreenProps<'Feed'>): JSX.Element {
    const insets = useSafeAreaInsets();
    const { user, refetchFeedCount, feedCount } = useContext(AuthContext);
    const [feeds, setFeeds] = useState<Feeds[]>([]);
    const [count, setCount] = useState(0);
    const [notReadCount, setNotReadCount] = useState(0);
    // filter 버튼을 통해 변경할 경우 , filter state 가 변경됩니다.
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
            headerTitle,
            headerLeft,
            headerBackground,
            headerShown: true,
        });
    });

    useEffect(() => {
        if (feedsData?.listFeeds) {
            setCount(feedsData.listFeeds.count ?? 0);
            setNotReadCount(feedsData.listFeeds.notReadCount ?? 0);
            setFeeds(feedsData.listFeeds.values as Feeds[]);
            setPullRefresh(false);
        }
    }, [feedsData]);

    useEffect(() => {
        if (filter && user?.userId) {
            const variables = getVariablesForQuery(user?.userId || '', filter);
            getFeeds({ variables }).catch(console.log);
        }
    }, [filter, getFeeds, user?.userId]);

    const decreaseCount = useCallback(() => {
        setNotReadCount(notReadCount > 0 ? notReadCount - 1 : 0);
        refetchFeedCount(feedCount > 0 ? feedCount - 1 : 0);
    }, [feedCount, notReadCount, refetchFeedCount]);

    const renderFeedCard = useCallback(
        (info: ListRenderItemInfo<Feeds>): JSX.Element => {
            const { id, type, isRead } = info.item;
            const { feedContent } = getFeed(type, (info.item.content as ComponentFeedCotentContent) || undefined);

            return (
                <FeedCard
                    id={id}
                    content={feedContent || getString('오류')}
                    date={new Date(info.item.createdAt as string)}
                    isRead={!!isRead}
                    onPress={() => {
                        if (!isRead) {
                            updateFeed(id).catch(console.log);
                            decreaseCount();
                        }
                        const stackAction = getNavigationType(
                            type,
                            (info.item.navigation as ComponentNavigationNavigation) || undefined,
                        );
                        if (stackAction) {
                            // linkTo(linkUrl);
                            navigation.dispatch(stackAction);
                        }
                    }}
                />
            );
        },
        [decreaseCount, navigation, updateFeed],
    );

    return (
        <KeyboardAwareFlatList
            enableResetScrollToCoords={false}
            style={styles.container}
            ListHeaderComponent={
                <View style={[globalStyle.flexRowBetween, { paddingBottom: 2, zIndex: 1 }]}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <Text style={[globalStyle.ltext, styles.listHeaderTitle]}>{getString('새알림')}</Text>
                        <Text style={[globalStyle.ltext, styles.listHeaderValue]}>
                            {notReadCount || 0}/{count || 0}
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
            }
            keyExtractor={(item: Feeds, index: number) => `feed_${item.id}`}
            data={feeds}
            renderItem={renderFeedCard}
            onEndReached={() => {
                if (loading) return;
                if (count < feeds.length) {
                    fetchMore({
                        variables: { limit: FETCH_MORE_LIMIT, start: feeds.length },
                    }).catch(console.log);
                }
            }}
            refreshing={pullRefresh}
            onRefresh={() => {
                setPullRefresh(true);
                const variables = getVariablesForQuery(user?.address || '', filter);
                client.cache.evict({
                    fieldName: 'listFeeds',
                    args: variables,
                    broadcast: false,
                });
                getFeeds({ variables }).catch(console.log);
            }}
        />
    );
}

export default Feed;
