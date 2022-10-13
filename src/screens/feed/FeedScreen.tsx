import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Image, ListRenderItemInfo, ImageURISource, StyleSheet } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { Button, Icon, Text } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { useLinkTo } from '@react-navigation/native';
import globalStyle from '~/styles/global';
import { MainScreenProps } from '~/navigation/main/MainParams';
import FeedCard from '~/components/feed/FeedCard';
import { getFeed, getNavigationType } from '~/utils/feed/feedUtils';
import { Feeds, useGetFeedsLazyQuery } from '~/graphql/generated/generated';
// import { useNotificationsSubscription } from '~/graphql/hooks/Subscriptions';
import { useUpdateFeed } from '~/graphql/hooks/Feed';
import { FeedFilterType } from '~/types/filterType';
import FilterButton from '~/components/button/FilterButton';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';

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
        paddingHorizontal: 23,
        paddingVertical: 29,
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

function Feed({ route, navigation }: MainScreenProps<'Feed'>): JSX.Element {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [feeds, setFeeds] = useState<Feeds[]>([]);
    const [feedCount, setFeedCount] = useState(0);
    const [feedTotalCount, setFeedTotalCount] = useState(0);
    // filter 버튼을 통해 변경할 경우 , filter state 가 변경됩니다.
    const [filter, setFilter] = useState<FeedFilterType>(FeedFilterType.LATEST);
    const [assets] = useAssets(iconAssets);
    const [pullRefresh, setPullRefresh] = useState(false);
    const linkTo = useLinkTo();
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
                        navigation.goBack();
                    } else {
                        linkTo('/home');
                    }
                }}
                icon={<Icon name="chevron-left" color="white" tvParallaxProperties={undefined} />}
                type="clear"
            />
        );
    }, [navigation]);

    const headerBackground = useCallback(() => {
        if (!assets) return null;
        return (
            <Image
                style={{
                    height: 55 + insets.top,
                    width: '100%',
                }}
                source={assets[EnumIconAsset.Background] as ImageURISource}
            />
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
            setFeedTotalCount(feedsData.listFeeds.count ?? 0);
            setFeedCount(feedsData.listFeeds.notReadCount ?? 0);
            setFeeds(feedsData.listFeeds.values as Feeds[]);
            setPullRefresh(false);
        }
    }, [feedsData]);

    useEffect(() => {
        if (filter && user?.address) {
            const variables = getVariablesForQuery(user?.address || '', filter);
            getFeeds({ variables }).catch(console.log);
        }
    }, [filter, getFeeds, user?.address]);

    const renderFeedCard = (info: ListRenderItemInfo<Feeds>): JSX.Element => {
        const { id, type, content, navigation: navigationParams, isRead } = info.item;
        const { feedContent } = getFeed(type, content || undefined);

        return (
            <FeedCard
                id={id}
                content={feedContent || getString('오류')}
                date={new Date(info.item.createdAt as string)}
                isRead={!!isRead}
                onPress={() => {
                    if (!isRead) {
                        updateFeed(id).catch(console.log);
                        setFeedCount(feedCount > 0 ? feedCount - 1 : 0);
                    }
                    const linkUrl = getNavigationType(type, navigationParams || undefined);
                    if (linkUrl) {
                        linkTo(linkUrl);
                    }
                }}
            />
        );
    };

    return (
        <KeyboardAwareFlatList
            enableResetScrollToCoords={false}
            style={styles.container}
            ListHeaderComponent={
                <View style={[globalStyle.flexRowBetween, { paddingBottom: 2, zIndex: 1 }]}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <Text style={[globalStyle.ltext, styles.listHeaderTitle]}>{getString('새알림')}</Text>
                        <Text style={[globalStyle.ltext, styles.listHeaderValue]}>
                            {feedCount || 0}/{feedTotalCount || 0}
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
                if (feedTotalCount < feeds.length) {
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
