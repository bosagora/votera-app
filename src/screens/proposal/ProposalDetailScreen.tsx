import React, { useContext, useRef, useState, useCallback, useEffect } from 'react';
import { View, Animated, Dimensions, useWindowDimensions, NativeScrollEvent } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { TabView, SceneRendererProps } from 'react-native-tab-view';
import { BigNumber } from 'ethers';
import { useIsFocused } from '@react-navigation/native';
import TabBarContainer from '~/components/status/TabBar';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import globalStyle, { isLargeScreen } from '~/styles/global';
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
    Proposal,
    useActivityPostsLazyQuery,
    useListAssessValidatorsLazyQuery,
    useListBallotValidatorsLazyQuery,
    useSubmitAssessMutation,
    useRecordBallotMutation,
    useSubmitBallotMutation,
    useUpdateReceiptMutation,
    Validator,
    useGetProposalByIdLazyQuery,
    useNoticeStatusLazyQuery,
} from '~/graphql/generated/generated';
import { OpinionFilterType } from '~/types/filterType';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import isCloseToBottom from '~/utils';
import VoteraVote from '~/utils/votera/VoteraVote';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { useProposalChangedSubscription } from '~/graphql/hooks/Subscriptions';
import { getProposalStatusString } from '~/components/status/ProgressMark';
import { ChevronLeftIcon } from '~/components/icons';
import Info from './Info';
import Discussion from './Discussion';
import styles, { HEADER_HEIGHT } from './styles';
import CreateScreen from './Create/CreateScreen';
import AssessScreen from './Assess/AssessScreen';
import VoteScreen from './Vote/VoteScreen';
import ValidatorScreen from './Validator/ValidatorScreen';
import { AssessResult } from './Assess/evaluating';

const FETCH_INIT_LIMIT = 10;
const FETCH_MORE_LIMIT = 10;

const FETCH_VALIDATOR_INIT_LIMIT = 10;
const FETCH_VALIDATOR_MORE_LIMIT = 10;

type HeightType = string | number;

function selectRoute(status?: EnumProposalStatus) {
    let voteTitle = '';
    if (status !== undefined) {
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
    const dispatch = useAppDispatch();
    const [proposal, setProposal] = useState<Proposal>();
    const [isJoined, setIsJoined] = useState(false);
    const [discussionAId, setDiscussionAId] = useState('');
    const [noticeAId, setNoticeAId] = useState('');
    const { joinProposal, createActivityComment } = useContext(ProposalContext);
    const { user, isGuest, metamaskProvider, metamaskUpdateBalance } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState(selectRoute());
    const [commentsCount, setCommentsCount] = useState(0);
    const [commentsData, setCommentsData] = useState<Post[]>([]);
    const [commentsStatus, setCommentsStatus] = useState<PostStatus[]>([]);
    const [filter, setFilter] = useState<OpinionFilterType>(OpinionFilterType.LATEST);
    const [total, setTotal] = useState(0);
    const [participated, setParticipated] = useState(0);
    const [validators, setValidators] = useState<Validator[]>([]);
    const [numberOfLines, setNumberOfLines] = useState(3);
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();
    const [newNotice, setNewNotice] = useState(false);

    const [getProposalDetail, { loading }] = useGetProposalByIdLazyQuery({
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            if (data.proposalById) {
                setProposal(data.proposalById as Proposal);
            }
            if (data.proposalStatusById) {
                setIsJoined(!!data.proposalStatusById.isJoined);
            }
        },
    });
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
    const [getNoticeStatus, { data: noticeStatusData }] = useNoticeStatusLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [submitAssess] = useSubmitAssessMutation();
    const [submitBallot] = useSubmitBallotMutation();
    const [recordBallot] = useRecordBallotMutation();
    const [updateReceipt] = useUpdateReceiptMutation();
    const { data: subscriptionData } = useProposalChangedSubscription({
        variables: {
            proposalId: id,
        },
    });

    useEffect(() => {
        setNumberOfLines(3);
    }, [id]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
            title: proposal?.name || '',
        });
    }, [navigation, proposal?.name]);

    const fetchProposal = useCallback(
        (proposalId: string) => {
            getProposalDetail({ variables: { proposalId } }).catch((err) => {
                console.log('getProposalDetail error', err);
            });
        },
        [getProposalDetail],
    );

    const setJoined = useCallback(async () => {
        if (!isJoined) {
            setIsJoined(await joinProposal(proposal));
        }
    }, [isJoined, joinProposal, proposal]);

    useEffect(() => {
        if (!subscriptionData) {
            fetchProposal(id);
        } else if (subscriptionData?.proposalChanged?.proposalId === id) {
            fetchProposal(id);
            if (isFocused) {
                const status = getProposalStatusString(subscriptionData.proposalChanged.status);
                dispatch(showSnackBar(getString('#S 상태로 변경되었습니다&#46;').replace('#S', status)));
            }
        }
    }, [id, subscriptionData, dispatch, isFocused, fetchProposal]);

    useEffect(() => {
        setRoutes(selectRoute(proposal?.status));
    }, [proposal?.status]);

    useEffect(() => {
        if (proposal?.status === EnumProposalStatus.Created && !proposal.paidComplete) {
            if (proposal?.createTx) {
                metamaskProvider
                    ?.waitForTransaction(proposal.createTx, 1)
                    .then((value) => {
                        metamaskUpdateBalance();
                        fetchProposal(id);
                    })
                    .catch(console.log);
            }
        }
    }, [
        proposal?.status,
        proposal?.paidComplete,
        proposal?.createTx,
        metamaskProvider,
        metamaskUpdateBalance,
        fetchProposal,
        id,
    ]);

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
        if (proposal && isFocused) {
            proposal.activities?.forEach((activity) => {
                const boardType = activity?.name.split('_').pop();
                if (!activity || !activity?.id) return;

                if (boardType === 'DISCUSSION') {
                    setDiscussionAId(activity?.id);
                } else if (boardType === 'NOTICE') {
                    setNoticeAId(activity.id);
                    getNoticeStatus({ variables: { activityId: activity.id } }).catch(console.log);
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
    }, [getAssessResult, getNoticeStatus, getValidators, isFocused, isGuest, proposal, user]);

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

    useEffect(() => {
        if (noticeStatusData?.noticeStatus) {
            const lastUnread = noticeStatusData.noticeStatus.lastUnreadAt as string;
            const lastRead = noticeStatusData.noticeStatus.lastUpdateAt as string;
            if (!lastUnread) {
                setNewNotice(false);
            } else if (!lastRead) {
                setNewNotice(true);
            } else {
                setNewNotice(lastUnread > lastRead);
            }
        }
    }, [noticeStatusData]);

    const onChangeStatus = useCallback(() => {
        fetchProposal(id);
    }, [id, fetchProposal]);

    const onSubmitAssess = useCallback(
        async (data: AssessResult[]) => {
            if (!proposal?.proposalId || !metamaskProvider) {
                return;
            }

            await setJoined();

            const values = data.map((d) => BigNumber.from(d.value));
            const voteraVote = new VoteraVote(proposal?.voteraVoteAddress || '', metamaskProvider.getSigner());
            const tx = await voteraVote.submitAssess(proposal.proposalId, values, {});

            const content = data.map((d) => ({
                __typename: 'ComponentPostScaleAnswer',
                value: d.value,
                sequence: d.sequence,
            }));

            const submitResult = await submitAssess({
                variables: {
                    input: {
                        data: {
                            proposalId: proposal.proposalId || '',
                            content,
                            transactionHash: tx.hash,
                        },
                    },
                },
            });
            if (!submitResult.data?.submitAssess?.post) {
                throw new Error('invalid submitAssess result');
            }

            await refetchAssess();

            updateReceipt({
                variables: {
                    input: {
                        data: {
                            hash: tx.hash,
                        },
                    },
                },
            })
                .then((response) => {
                    if (response.data?.updateReceipt?.status !== 0) {
                        metamaskUpdateBalance();
                        getValidators();
                    }
                })
                .catch(console.log);
        },
        [
            getValidators,
            metamaskProvider,
            metamaskUpdateBalance,
            proposal,
            refetchAssess,
            setJoined,
            submitAssess,
            updateReceipt,
        ],
    );

    const onSubmitBallot = useCallback(
        async (vote: VOTE_SELECT): Promise<boolean> => {
            if (!proposal?.proposalId) {
                dispatch(showSnackBar(getString('Proposal 정보가 잘못 입력되었습니다&#46;')));
                return false;
            }
            if (!metamaskProvider) {
                dispatch(showSnackBar(getString('메타마스크와 연결되지 않았습니다&#46;')));
                return false;
            }

            await setJoined();

            const submitResult = await submitBallot({
                variables: {
                    input: {
                        data: {
                            proposalId: proposal.proposalId,
                            address: user?.address || '',
                            choice: vote,
                        },
                    },
                },
            });
            if (!submitResult?.data?.submitBallot) {
                dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                return false;
            }
            const { signature, commitment } = submitResult.data.submitBallot;
            if (!signature || !commitment) {
                dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                return false;
            }

            const voteraVote = new VoteraVote(proposal?.voteraVoteAddress || '', metamaskProvider.getSigner());
            const tx = await voteraVote.submitBallot(proposal.proposalId, commitment, signature, {});

            const recordResult = await recordBallot({
                variables: {
                    input: {
                        data: {
                            proposalId: proposal.proposalId,
                            commitment,
                            address: user?.address || '',
                            transactionHash: tx.hash,
                        },
                    },
                },
            });
            if (!recordResult.data?.recordBallot?.ballot) {
                dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                return false;
            }

            updateReceipt({
                variables: {
                    input: {
                        data: {
                            hash: tx.hash,
                        },
                    },
                },
            })
                .then((response) => {
                    if (response.data?.updateReceipt?.status !== 0) {
                        metamaskUpdateBalance();
                        getValidators();
                    }
                })
                .catch(console.log);

            return true;
        },
        [
            dispatch,
            getValidators,
            metamaskProvider,
            metamaskUpdateBalance,
            proposal,
            recordBallot,
            setJoined,
            submitBallot,
            updateReceipt,
            user?.address,
        ],
    );

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

    const renderScene = ({ route: tabRoute }: SceneRendererProps & { route: { key: string; title: string } }) => {
        switch (tabRoute.key) {
            case 'info':
                return (
                    <Info
                        proposal={proposal}
                        previewData={undefined}
                        isPreview={false}
                        assessResultData={assessResultData?.assessResult as AssessResultPayload}
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
                            newNotice={newNotice}
                            moveToNotice={() => {
                                navigation.push('RootUser', { screen: 'Notice', params: { id: noticeAId } });
                            }}
                            isJoined={isJoined}
                            setJoined={setJoined}
                            focused={index === 1}
                        />
                    );
                }
                return null;
            case 'vote':
                if (proposal?.status === EnumProposalStatus.Created && proposal.id) {
                    return <CreateScreen proposal={proposal} onChangeStatus={onChangeStatus} />;
                }
                if (
                    (proposal?.status === EnumProposalStatus.Assess ||
                        proposal?.status === EnumProposalStatus.PendingAssess ||
                        proposal?.status === EnumProposalStatus.Reject) &&
                    proposal.id
                ) {
                    return (
                        <AssessScreen
                            proposal={proposal}
                            assessResultData={assessResultData?.assessResult as AssessResultPayload}
                            onSubmitAssess={onSubmitAssess}
                        />
                    );
                }
                return <VoteScreen proposal={proposal} onSubmitBallot={onSubmitBallot} />;
            case 'validator':
                return index === 3 ? (
                    <ValidatorScreen
                        proposal={proposal}
                        total={total}
                        participated={participated}
                        validators={validators}
                        onRefresh={() => {
                            console.log('ValidatorScreen.onRefresh');
                            getValidators();
                        }}
                        loading={assessLoading || ballotLoading}
                    />
                ) : null;
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
                title={title(scroll)}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, import/extensions
                backgroundImage={require('@assets/images/header/proposalBg.png')}
                backgroundImageScale={1.2}
                renderNavBar={renderNavBar}
                renderContent={() => {
                    return (
                        <TabView
                            swipeEnabled={!isLargeScreen(width)}
                            sceneContainerStyle={{
                                paddingHorizontal: 22,
                                paddingTop: 25,
                                marginBottom: 60,
                            }}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
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
                            const ne = event.nativeEvent as NativeScrollEvent;
                            if (isCloseToBottom(ne)) {
                                if (index === 3 && !assessLoading && !ballotLoading) {
                                    if (total > validators.length) {
                                        fetchMoreValidators(validators.length);
                                    }
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
        </>
    );
}

export default ProposalDetailScreen;
