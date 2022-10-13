import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Image, FlatList, RefreshControl, ImageURISource, ActivityIndicator } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { useLinkTo } from '@react-navigation/native';
import globalStyle from '~/styles/global';
import { MainScreenProps } from '~/navigation/main/MainParams';
import { Enum_Post_Type as EnumPostType, Post, PostStatus, useActivityPostsQuery } from '~/graphql/generated/generated';
import NoticeCard from '~/components/notice/NoticeCard';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import ListFooterButton from '~/components/button/ListFooterButton';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { isCloseToBottom } from '~/utils';

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;
// const HEADER_BG_WIDTH = Dimensions.get('window').width;

enum EnumIconAsset {
    Background = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/header/bg.png')];

function getActivityPostsVariables(id: string) {
    return {
        id,
        type: EnumPostType.BoardArticle,
        sort: 'createdAt:desc',
        limit: FETCH_INIT_LIMIT,
    };
}

function NoticeScreen({ navigation, route }: MainScreenProps<'Notice'>): JSX.Element {
    const { id: activityId } = route.params;
    const insets = useSafeAreaInsets();
    const { proposal } = useContext(ProposalContext);
    const { user } = useContext(AuthContext);
    const [noticeCount, setNoticeCount] = useState(0);
    const [noticeData, setNoticeData] = useState<Post[]>();
    const [noticeStatus, setNoticeStatus] = useState<PostStatus[]>();
    const [isCreator, setIsCreator] = useState(true);
    const [isStopFetchMore, setStopFetchMore] = useState(false);
    const [pullRefresh, setPullRefresh] = useState(false);
    const scrollViewRef = useRef<FlatList<any>>(null);
    const [assets] = useAssets(iconAssets);
    const linkTo = useLinkTo();

    const {
        data: noticeQueryData,
        fetchMore,
        refetch,
        loading,
        client,
    } = useActivityPostsQuery({
        variables: getActivityPostsVariables(activityId),
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
        onError: (err) => {
            console.log('activityPosts error=', err);
            setPullRefresh(false);
        },
    });

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
    }, [navigation, linkTo]);

    const headerRight = useCallback(() => {
        return isCreator ? (
            <Button
                onPress={() => linkTo(`/createnotice/${route.params.id}`)}
                icon={<Icon name="add" color="white" tvParallaxProperties={undefined} />}
                type="clear"
            />
        ) : null;
    }, [isCreator, linkTo, route.params.id]);

    const headerBackground = useCallback(() => {
        if (!assets) return null;
        return (
            <Image
                style={{ height: 55 + insets.top, width: '100%' }}
                source={assets[EnumIconAsset.Background] as ImageURISource}
            />
        );
    }, [assets, insets.top]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: getString('공지사항'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerLeft,
            headerRight,
            headerBackground,
        });
    }, [headerBackground, headerLeft, headerRight, navigation]);

    useEffect(() => {
        if (proposal) {
            setIsCreator(proposal.creator?.id === user?.memberId);
        }
    }, [proposal, user?.memberId]);

    useEffect(() => {
        if (noticeQueryData?.activityPosts) {
            setNoticeCount(noticeQueryData.activityPosts.count || 0);
            setNoticeData(noticeQueryData.activityPosts.values as Post[]);
            setNoticeStatus(noticeQueryData.activityPosts.statuses as PostStatus[]);

            setPullRefresh(false);
            setStopFetchMore(noticeQueryData.activityPosts.count === noticeQueryData.activityPosts.values?.length);
        }
    }, [noticeQueryData]);

    const renderNotices = ({ item, index }: { item: Post; index: number }) => {
        return (
            <NoticeCard
                noticeAId={activityId}
                noticeData={item}
                noticeStatus={noticeStatus ? noticeStatus[index] : undefined}
            />
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'rgb(242,244,250)' }}>
            <FocusAwareStatusBar barStyle="light-content" />

            <FlatList
                ref={scrollViewRef}
                data={noticeData}
                renderItem={renderNotices}
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent) && !isStopFetchMore && !loading) {
                        const currentLength = noticeData?.length || 0;

                        if (fetchMore) {
                            fetchMore({
                                variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                            }).catch(console.log);
                        }
                    }
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={pullRefresh}
                        onRefresh={() => {
                            setPullRefresh(true);
                            const variables = getActivityPostsVariables(activityId);
                            client.cache.evict({
                                fieldName: 'activityPosts',
                                args: variables,
                                broadcast: false,
                            });
                            refetch(variables).catch(console.log);
                        }}
                    />
                }
                contentContainerStyle={{ paddingBottom: 86 }}
                ListHeaderComponent={
                    <View
                        style={{
                            height: 53,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,
                            justifyContent: 'center',
                            paddingHorizontal: 22,
                        }}
                    >
                        <Text style={globalStyle.ltext}>
                            {getString('공지글 #N').replace('#N', noticeCount.toString())}
                        </Text>
                    </View>
                }
                ListFooterComponent={loading ? <ActivityIndicator /> : null}
            />
        </View>
    );
}

export default NoticeScreen;
