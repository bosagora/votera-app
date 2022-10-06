import React, { useContext, useRef, useState, useCallback, useEffect } from 'react';
import { View, Animated, Dimensions, NativeScrollEvent } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { TabView, SceneRendererProps } from 'react-native-tab-view';
import TabBarContainer from '~/components/status/TabBar';
import { MainScreenProps } from '~/navigation/main/MainParams';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import globalStyle from '~/styles/global';
import ReactNativeParallaxHeader from '~/components/ui/RNParallax';
import Period from '~/components/status/Period';
import DdayMark from '~/components/status/DdayMark';
import { AuthContext } from '~/contexts/AuthContext';
import {
    Enum_Proposal_Type as EnumProposalType,
    Enum_Post_Type as EnumPostType,
    Enum_Proposal_Status as EnumProposalStatus,
    useAssessResultLazyQuery,
    AssessResultPayload,
    Post,
    PostStatus,
    useActivityPostsLazyQuery,
    useListAssessValidatorsLazyQuery,
    useListBallotValidatorsLazyQuery,
    Validator,
} from '~/graphql/generated/generated';
import { OpinionFilterType } from '~/types/filterType';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import Info from './Info';
import Discussion from './Discussion';
import styles, { HEADER_HEIGHT } from './styles';
import CreateScreen from './Create/CreateScreen';
import AssessScreen from './Assess/AssessScreen';
import VoteScreen from './Vote/VoteScreen';
import ValidatorScreen from './Validator/ValidatorScreen';
import isCloseToBottom from '~/utils';

const FETCH_INIT_LIMIT = 10;
const FETCH_MORE_LIMIT = 10;

const FETCH_VALIDATOR_INIT_LIMIT = 10;
const FETCH_VALIDATOR_MORE_LIMIT = 10;

type HeightType = string | number;

function selectRoute(status?: EnumProposalStatus) {
    let voteTitle = '';
    switch (status) {
        case EnumProposalStatus.Created:
            voteTitle = getString('입금하기');
            break;
        case EnumProposalStatus.PendingAssess:
        case EnumProposalStatus.Assess:
            voteTitle = getString('평가하기');
            break;
        case EnumProposalStatus.PendingVote:
        case EnumProposalStatus.Vote:
            voteTitle = getString('투표하기');
            break;
        default:
            voteTitle = getString('결과보기');
            break;
    }
    return [
        { key: 'info', title: getString('제안내용') },
        { key: 'discussion', title: getString('논의하기') },
        { key: 'vote', title: voteTitle },
        { key: 'validator', title: getString('검증자') },
    ];
}

function getActivityPostsVariables(id: string, filter?: OpinionFilterType, limit?: number) {
    if (limit) {
        return {
            id,
            type: EnumPostType.CommentOnActivity,
            sort: filter === OpinionFilterType.POPULATION ? 'likeCount:desc,createdAt:desc' : 'createdAt:desc',
            limit,
        };
    }
    return {
        id,
        type: EnumPostType.CommentOnActivity,
        sort: filter === OpinionFilterType.POPULATION ? 'likeCount:desc,createdAt:desc' : 'createdAt:desc',
    };
}

function getListValidatorVariables(proposalId: string) {
    return { proposalId, limit: FETCH_VALIDATOR_INIT_LIMIT };
}

function isAssessValidatorStatus(status?: EnumProposalStatus) {
    switch (status) {
        case EnumProposalStatus.PendingAssess:
        case EnumProposalStatus.Assess:
        case EnumProposalStatus.PendingVote:
        case EnumProposalStatus.Reject:
            return true;
        default:
            return false;
    }
}

function isBallotValidatorStatus(status?: EnumProposalStatus) {
    if (!status || status === EnumProposalStatus.Created) {
        return false;
    }
    switch (status) {
        case EnumProposalStatus.PendingAssess:
        case EnumProposalStatus.Assess:
        case EnumProposalStatus.PendingVote:
        case EnumProposalStatus.Reject:
            return false;
        default:
            return true;
    }
}

function ProposalDetailScreen({ navigation, route }: MainScreenProps<'ProposalDetail'>): JSX.Element {
    const { id } = route.params;
    const scroll = useRef(new Animated.Value(0)).current;
    const [discussionAId, setDiscussionAId] = useState('');
    const [noticeAId, setNoticeAId] = useState('');
    const { proposal, fetchProposal, createActivityComment } = useContext(ProposalContext);
    const { user, isGuest } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState(selectRoute(proposal?.status));
    const [commentsCount, setCommentsCount] = useState(0);
    const [commentsData, setCommentsData] = useState<Post[]>([]);
    const [commentsStatus, setCommentsStatus] = useState<PostStatus[]>([]);
    const [filter, setFilter] = useState<OpinionFilterType>(OpinionFilterType.LATEST);
    const [total, setTotal] = useState(0);
    const [participated, setParticipated] = useState(0);
    const [validators, setValidators] = useState<Validator[]>([]);

    const [sceneHeight, setSceneHeight] = useState<HeightType>('auto');
    const [tab0Height, setTab0Height] = useState<HeightType>('auto');
    const [tab1Height, setTab1Height] = useState<HeightType>('auto');
    const [tab2Height, setTab2Height] = useState<HeightType>('auto');
    const [tab3Height, setTab3Height] = useState<HeightType>('auto');

    const [getAssessResult, { data: assessResultData, refetch: refetchAssess, client }] = useAssessResultLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [getActivityPosts, { data: activityPosts, fetchMore }] = useActivityPostsLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [getAssessValidator, { data: assessValidatorData, fetchMore: assessFetchMore, loading: assessLoading }] =
        useListAssessValidatorsLazyQuery({
            fetchPolicy: 'cache-and-network',
            notifyOnNetworkStatusChange: true,
        });
    const [getBallotValidator, { data: ballotValidatorData, fetchMore: ballotFetchMore, loading: ballotLoading }] =
        useListBallotValidatorsLazyQuery({
            fetchPolicy: 'cache-and-network',
            notifyOnNetworkStatusChange: true,
        });

    useEffect(() => {
        if (!proposal) {
            fetchProposal(id);
        }
    }, [id, proposal, fetchProposal]);

    useEffect(() => {
        setRoutes(selectRoute(proposal?.status));
    }, [proposal?.status]);

    const getValidators = useCallback(() => {
        if (!proposal?.status || proposal?.status === EnumProposalStatus.Created) {
            setTotal(0);
            setParticipated(0);
            setValidators([]);
            return;
        }
        if (isAssessValidatorStatus(proposal.status)) {
            const variables = getListValidatorVariables(proposal?.proposalId || '');
            client.cache.evict({
                fieldName: 'listAssessValidators',
                args: variables,
                broadcast: false,
            });
            getAssessValidator({ variables }).catch(console.log);
        } else {
            const variables = getListValidatorVariables(proposal?.proposalId || '');
            client.cache.evict({
                fieldName: 'listBallotValidators',
                args: variables,
                broadcast: false,
            });
            getBallotValidator({ variables }).catch(console.log);
        }
    }, [proposal?.status, proposal?.proposalId, client.cache, getAssessValidator, getBallotValidator]);

    const fetchMoreValidators = useCallback(
        (length: number) => {
            if (proposal?.status && proposal.status !== EnumProposalStatus.Created) {
                if (isAssessValidatorStatus(proposal?.status)) {
                    assessFetchMore({
                        variables: {
                            limit: FETCH_VALIDATOR_MORE_LIMIT,
                            start: length,
                        },
                    }).catch(console.log);
                } else {
                    ballotFetchMore({
                        variables: {
                            limit: FETCH_VALIDATOR_MORE_LIMIT,
                            start: length,
                        },
                    }).catch(console.log);
                }
            }
        },
        [proposal?.status, assessFetchMore, ballotFetchMore],
    );

    useEffect(() => {
        if (proposal) {
            proposal.activities?.forEach((activity) => {
                const boardType = activity?.name.split('_').pop();
                if (!activity || !activity?.id) return;

                if (boardType === 'DISCUSSION') {
                    setDiscussionAId(activity?.id);
                } else if (boardType === 'NOTICE') {
                    setNoticeAId(activity.id);
                }
            });
            if (proposal.type === EnumProposalType.Business) {
                getAssessResult({
                    variables: {
                        proposalId: proposal.proposalId || '',
                        actor: user && !isGuest ? user.memberId : '',
                    },
                }).catch(console.log);
            }

            getValidators();
        }
    }, [getAssessResult, getValidators, isGuest, proposal, user]);

    useEffect(() => {
        if (discussionAId) {
            getActivityPosts({
                variables: getActivityPostsVariables(discussionAId, filter, FETCH_INIT_LIMIT),
            }).catch(console.log);
        }
    }, [discussionAId, filter, getActivityPosts]);

    useEffect(() => {
        if (activityPosts?.activityPosts) {
            setCommentsCount(activityPosts.activityPosts.count || 0);
            setCommentsData(activityPosts.activityPosts.values as Post[]);
            setCommentsStatus(activityPosts.activityPosts.statuses as PostStatus[]);
        }
    }, [activityPosts]);

    useEffect(() => {
        if (isAssessValidatorStatus(proposal?.status)) {
            if (assessValidatorData?.voteCount) {
                setTotal(assessValidatorData.voteCount.validatorCount || 0);
                setParticipated(assessValidatorData.voteCount.assessCount || 0);
            }
            if (assessValidatorData?.listAssessValidators) {
                setValidators(assessValidatorData.listAssessValidators as Validator[]);
            }
        }
    }, [proposal?.status, assessValidatorData]);

    useEffect(() => {
        if (isBallotValidatorStatus(proposal?.status)) {
            if (ballotValidatorData?.voteCount) {
                setTotal(ballotValidatorData.voteCount.validatorCount || 0);
                setParticipated(ballotValidatorData.voteCount.ballotCount || 0);
            }
            if (ballotValidatorData?.listBallotValidators) {
                setValidators(ballotValidatorData.listBallotValidators as Validator[]);
            }
        }
    }, [proposal?.status, ballotValidatorData]);

    const onChangeStatus = useCallback(() => {
        if (fetchProposal) {
            fetchProposal(proposal?.proposalId || '');
        }
        setIndex(0);
        setTab2Height('auto');
        setTab3Height('auto');
    }, [proposal, fetchProposal]);

    const setCurrentTabHeight = (newHeight: HeightType) => {
        const deviceHeight = Dimensions.get('window').height;
        const tabHeight = newHeight !== 'auto' && newHeight < deviceHeight ? deviceHeight : newHeight;
        if (sceneHeight !== tabHeight) {
            setSceneHeight(tabHeight);
        }
    };

    const onTabChange = (i: number) => {
        switch (i) {
            case 0:
                setCurrentTabHeight(tab0Height);
                break;
            case 1:
                setCurrentTabHeight(tab1Height);
                break;
            case 2:
                setCurrentTabHeight(tab2Height);
                break;
            case 3:
                setCurrentTabHeight(tab3Height);
                break;
            default:
                break;
        }
    };

    const title = () => {
        const opacity = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={{ justifyContent: 'space-around', flex: 1 }}>
                <Animated.View
                    style={{
                        borderWidth: 1,
                        borderColor: 'white',
                        borderRadius: 6,
                        alignSelf: 'center',
                        paddingHorizontal: 7,
                        paddingVertical: 5,
                        opacity,
                    }}
                >
                    <Text style={[globalStyle.mtext, { fontSize: 11, color: 'white' }]}>
                        {proposal?.type === EnumProposalType.Business ? getString('사업제안') : getString('시스템제안')}
                    </Text>
                </Animated.View>
                <Text style={[globalStyle.btext, { color: 'white', fontSize: 20, maxWidth: 220, textAlign: 'center' }]}>
                    {proposal?.name}
                </Text>
                <Animated.View style={{ alignItems: 'center', opacity }}>
                    {proposal?.type === EnumProposalType.Business && (
                        <Period
                            type={getString('제안기간')}
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={proposal?.assessPeriod?.begin as string}
                            deadline={proposal?.assessPeriod?.end as string}
                        />
                    )}

                    <Period
                        type={getString('투표 기간')}
                        typeStyle={{ fontSize: 14 }}
                        periodStyle={{ fontSize: 13 }}
                        color="white"
                        created={proposal?.votePeriod?.begin as string}
                        deadline={proposal?.votePeriod?.end as string}
                    />
                </Animated.View>
            </View>
        );
    };

    const renderNavBar = () => {
        const offset = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [0, 0, -5],
            extrapolate: 'clamp',
        });
        return (
            <Animated.View style={{ paddingHorizontal: 20, marginTop: offset }}>
                <View style={styles.statusBar} />
                <View style={styles.navBar}>
                    <Button
                        onPress={() => navigation.goBack()}
                        icon={<Icon name="chevron-left" color="white" tvParallaxProperties={undefined} />}
                        type="clear"
                    />

                    <DdayMark color="white" deadline={proposal?.votePeriod?.end as string} type={proposal?.type} />
                </View>
            </Animated.View>
        );
    };

    const renderScene = ({ route: tabRoute }: SceneRendererProps & { route: { key: string; title: string } }) => {
        switch (tabRoute.key) {
            case 'info':
                return (
                    <Info
                        previewData={undefined}
                        isPreview={false}
                        assessResultData={assessResultData?.assessResult as AssessResultPayload}
                        onLayout={(height) => {
                            setTab0Height(height);
                        }}
                    />
                );
            case 'discussion':
                if (discussionAId) {
                    return (
                        <Discussion
                            id={discussionAId}
                            commentsCount={commentsCount}
                            commentsData={commentsData}
                            commentsStatus={commentsStatus}
                            filter={filter}
                            setFilter={(value) => {
                                setFilter(value);
                            }}
                            createActivityComment={async (value) => {
                                await createActivityComment(
                                    discussionAId,
                                    value,
                                    getActivityPostsVariables(discussionAId, filter),
                                );
                            }}
                            refetch={() => {
                                const variables = getActivityPostsVariables(discussionAId, filter, FETCH_INIT_LIMIT);
                                client.cache.evict({
                                    fieldName: 'activityPosts',
                                    args: variables,
                                    broadcast: false,
                                });
                                getActivityPosts({ variables }).catch(console.log);
                            }}
                            fetchMore={() => {
                                const currentLength = commentsData?.length || 0;
                                fetchMore({
                                    variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                                }).catch(console.log);
                            }}
                            onLayout={(height) => {
                                setTab1Height(height);
                            }}
                            moveToNotice={() => navigation.navigate('Notice', { id: noticeAId })}
                        />
                    );
                }
                return null;
            case 'vote':
                if (proposal?.status === EnumProposalStatus.Created && proposal.id) {
                    return (
                        <CreateScreen
                            onLayout={(value) => {
                                setTab2Height(value);
                            }}
                            onChangeStatus={onChangeStatus}
                        />
                    );
                }
                if (
                    (proposal?.status === EnumProposalStatus.Assess ||
                        proposal?.status === EnumProposalStatus.PendingAssess ||
                        proposal?.status === EnumProposalStatus.Reject) &&
                    proposal.id
                ) {
                    return (
                        <AssessScreen
                            assessResultData={assessResultData?.assessResult as AssessResultPayload}
                            onLayout={(value) => {
                                setTab2Height(value);
                            }}
                            onChangeStatus={onChangeStatus}
                            refetchAssess={() => {
                                if (refetchAssess) {
                                    refetchAssess().catch(console.log);
                                }
                                getValidators();
                            }}
                        />
                    );
                }
                return (
                    <VoteScreen
                        onLayout={(value) => {
                            setTab2Height(value);
                        }}
                        onRefresh={() => {
                            getValidators();
                        }}
                    />
                );
            case 'validator':
                return (
                    <ValidatorScreen
                        proposal={proposal}
                        total={total}
                        participated={participated}
                        validators={validators}
                        onLayout={(value) => {
                            setTab3Height(value);
                        }}
                        onRefresh={() => {
                            console.log('ValidatorScreen.onRefresh');
                            getValidators();
                        }}
                        loading={assessLoading || ballotLoading}
                    />
                );
            default:
                break;
        }
        return null;
    };

    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <ReactNativeParallaxHeader
                headerMinHeight={HEADER_HEIGHT}
                headerMaxHeight={250}
                extraScrollHeight={20}
                title={title()}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, import/extensions
                backgroundImage={require('@assets/images/header/proposalBg.png')}
                backgroundImageScale={1.2}
                renderNavBar={renderNavBar}
                renderContent={() => {
                    return (
                        <TabView
                            swipeEnabled
                            sceneContainerStyle={{
                                paddingHorizontal: 22,
                                paddingTop: 25,
                                marginBottom: 60,
                                height: sceneHeight,
                            }}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={(i) => {
                                setIndex(i);
                                onTabChange(i);
                            }}
                            lazy
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            renderTabBar={(props) => <TabBarContainer {...props} />}
                        />
                    );
                }}
                scrollViewProps={{
                    removeClippedSubviews: false,
                    onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
                        useNativeDriver: false,
                        listener: (event) => {
                            if (isCloseToBottom(event.nativeEvent as NativeScrollEvent)) {
                                if (index === 3 && !assessLoading && !ballotLoading) {
                                    if (total > validators.length) {
                                        fetchMoreValidators(validators.length);
                                    }
                                }
                            }
                        },
                    }),
                }}
            />
        </>
    );
}

export default ProposalDetailScreen;
