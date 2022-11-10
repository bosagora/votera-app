import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Animated,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    useWindowDimensions,
    NativeScrollEvent,
} from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle, { isLargeScreen } from '~/styles/global';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import {
    Enum_Post_Type as EnumPostType,
    Enum_Proposal_Type as EnumProposalType,
    Post,
    PostStatus,
    Proposal,
    useActivityPostsQuery,
    useGetProposalByActivityLazyQuery,
} from '~/graphql/generated/generated';
import NoticeCard from '~/components/notice/NoticeCard';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import ListFooterButton from '~/components/button/ListFooterButton';
import ReactNativeParallaxHeader from '~/components/ui/RNParallax';
import Period from '~/components/status/Period';
import DdayMark from '~/components/status/DdayMark';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { isCloseToBottom } from '~/utils';
import { AddIcon, ChevronLeftIcon } from '~/components/icons';
import styles, { HEADER_HEIGHT } from '../proposal/styles';

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;

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
    const scroll = useRef(new Animated.Value(0)).current;
    const themeContext = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const { joinProposal } = useContext(ProposalContext);
    const [proposal, setProposal] = useState<Proposal>();
    const [isJoined, setIsJoined] = useState(false);
    const [noticeCount, setNoticeCount] = useState(0);
    const [noticeData, setNoticeData] = useState<Post[]>();
    const [noticeStatus, setNoticeStatus] = useState<PostStatus[]>();
    const [isCreator, setIsCreator] = useState(true);
    const [isStopFetchMore, setStopFetchMore] = useState(false);
    const [pullRefresh, setPullRefresh] = useState(false);
    const { width } = useWindowDimensions();
    const [numberOfLines, setNumberOfLines] = useState(3);

    const [getProposalByActivity] = useGetProposalByActivityLazyQuery({
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            if (data?.proposalByActivity) {
                setProposal(data.proposalByActivity as Proposal);
            }
            if (data?.proposalStatusByActivity) {
                setIsJoined(!!data.proposalStatusByActivity.isJoined);
            }
        },
    });
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

    useEffect(() => {
        getProposalByActivity({ variables: { activityId } }).catch(console.log);
        setNumberOfLines(3);
    }, [activityId, getProposalByActivity]);

    useEffect(() => {
        if (proposal) {
            setIsCreator(proposal.creator?.id === user?.memberId);
        }
    }, [proposal, user?.memberId]);

    const setJoined = useCallback(async () => {
        if (!isJoined) {
            setIsJoined(await joinProposal(proposal));
        }
    }, [isJoined, joinProposal, proposal]);

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
                isJoined={isJoined}
                setJoined={setJoined}
            />
        );
    };

    const title = useCallback(
        (scrollValue: Animated.Value) => {
            const opacity = scrollValue.interpolate({
                inputRange: [-20, 0, 250 - HEADER_HEIGHT],
                outputRange: [1, 1, 0],
                extrapolate: 'clamp',
            });
            const pos = scrollValue.interpolate({
                inputRange: [-20, 0, 250 - HEADER_HEIGHT],
                outputRange: [22, 22, 0],
                extrapolate: 'clamp',
            });
            return (
                <View style={styles.titleContainer}>
                    {proposal?.type !== undefined && (
                        <Animated.View style={[styles.typeBox, { opacity }, { top: pos }]}>
                            <Text style={[globalStyle.mtext, styles.typeText]}>
                                {proposal?.type === EnumProposalType.Business
                                    ? getString('사업제안')
                                    : getString('시스템제안')}
                            </Text>
                        </Animated.View>
                    )}
                    <Text style={[globalStyle.btext, styles.titleText]} numberOfLines={numberOfLines}>
                        {proposal?.name}
                    </Text>
                    <Animated.View style={[styles.dateBox, { opacity }, { bottom: pos }]}>
                        {proposal?.type === EnumProposalType.Business && (
                            <Period
                                type={getString('평가 기간')}
                                typeStyle={styles.periodText}
                                periodStyle={styles.period}
                                top
                                created={proposal?.assessPeriod?.begin as string}
                                deadline={proposal?.assessPeriod?.end as string}
                            />
                        )}
                        {proposal?.votePeriod && (
                            <Period
                                type={getString('투표 기간')}
                                typeStyle={styles.periodText}
                                periodStyle={styles.period}
                                top
                                created={proposal?.votePeriod?.begin as string}
                                deadline={proposal?.votePeriod?.end as string}
                            />
                        )}
                    </Animated.View>
                </View>
            );
        },
        [numberOfLines, proposal],
    );

    const renderNavBar = () => {
        const opacity = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={{ paddingHorizontal: 20, marginTop: 0 }}>
                <View style={styles.statusBar} />
                <View style={styles.navBar}>
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

                    <Animated.View style={{ opacity: isLargeScreen(width) ? 1 : opacity }}>
                        <DdayMark
                            top
                            deadline={proposal?.votePeriod?.end as string}
                            type={proposal?.type}
                            status={proposal?.status}
                        />
                    </Animated.View>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'rgb(242,244,250)' }}>
            <FocusAwareStatusBar barStyle="light-content" />
            <ReactNativeParallaxHeader
                headerMinHeight={HEADER_HEIGHT}
                headerMaxHeight={250}
                extraScrollHeight={20}
                title={title(scroll)}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, import/extensions
                backgroundImage={require('@assets/images/header/proposalBg.png')}
                backgroundImageScale={1.2}
                renderNavBar={renderNavBar}
                renderContent={() => {
                    return (
                        <FlatList
                            data={noticeData}
                            renderItem={renderNotices}
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
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: 22,
                                        marginTop: 36,
                                    }}
                                >
                                    <Text
                                        style={[
                                            globalStyle.ltext,
                                            { fontSize: 13, lineHeight: 21, color: themeContext.color.textBlack },
                                        ]}
                                    >
                                        {getString('공지글 #N').replace('#N', noticeCount.toString())}
                                    </Text>
                                    {isCreator ? (
                                        <Button
                                            onPress={() => {
                                                navigation.push('RootUser', {
                                                    screen: 'CreateNotice',
                                                    params: { id: route.params.id },
                                                });
                                            }}
                                            icon={<AddIcon color="black" />}
                                            type="clear"
                                        />
                                    ) : null}
                                </View>
                            }
                            ListFooterComponent={loading ? <ActivityIndicator /> : null}
                        />
                    );
                }}
                scrollViewProps={{
                    removeClippedSubviews: false,
                    onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
                        useNativeDriver: false,
                        listener: (event) => {
                            const ne = event.nativeEvent as NativeScrollEvent;
                            if (isCloseToBottom(ne) && !isStopFetchMore && !loading) {
                                const currentLength = noticeData?.length || 0;
                                if (fetchMore) {
                                    fetchMore({
                                        variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                                    }).catch(console.log);
                                }
                            }
                            const { y } = ne.contentOffset;
                            if (y < 90) {
                                setNumberOfLines(3);
                            } else if (y < 160) {
                                setNumberOfLines(2);
                            } else {
                                setNumberOfLines(1);
                            }
                        },
                    }),
                }}
            />
        </View>
    );
}

export default NoticeScreen;
