import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import CommonButton from '~/components/button/CommonButton';
import { convertWithdrawRevertMessage, getRevertMessage, VOTE_SELECT } from '~/utils/votera/voterautil';
import {
    Enum_Proposal_Status as EnumProposalStatus,
    Enum_Vote_Proposal_State as EnumVoteProposalState,
    useRecordBallotMutation,
    useSubmitBallotMutation,
    useVoteStatusLazyQuery,
} from '~/graphql/generated/generated';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { showLoadingAniModal, hideLoadingAniModal } from '~/state/features/loadingAniModal';
import VoteraVote from '~/utils/votera/VoteraVote';
import Voting from './voting';
import VoteResult from './result';
import PendingVote from './pendingVote';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import globalStyle from '~/styles/global';

interface Props {
    onLayout: (h: number) => void;
    onRefresh: () => void;
}

function VoteScreen(props: Props): JSX.Element {
    const { onLayout, onRefresh } = props;
    const dispatch = useAppDispatch();
    const { proposal, isJoined, joinProposal, fetchProposal } = useContext(ProposalContext);
    const {
        user,
        isGuest,
        metamaskStatus,
        metamaskProvider,
        signOut,
        metamaskConnect,
        metamaskSwitch,
        metamaskUpdateBalance,
    } = useContext(AuthContext);
    const [isValidator, setIsValidator] = useState(false);
    const [needVote, setNeedVote] = useState(false);
    const [runningTx, setRunningTx] = useState(false);
    const [voteProposalState, setVoteProposalState] = useState<EnumVoteProposalState>();

    const [getVoteStatus, { data: voteStatusData, refetch: refetchVoteStatus, loading }] = useVoteStatusLazyQuery({
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });
    const [submitBallot] = useSubmitBallotMutation();
    const [recordBallot] = useRecordBallotMutation();

    useEffect(() => {
        if (proposal?.proposalId) {
            setVoteProposalState(undefined);
            getVoteStatus({
                variables: {
                    proposalId: proposal.proposalId,
                    actor: user?.memberId || '',
                },
            }).catch(console.log);
        }
    }, [proposal?.proposalId, user?.memberId, getVoteStatus]);

    useEffect(() => {
        let tm: NodeJS.Timer;
        if (proposal?.status === EnumProposalStatus.PendingVote || proposal?.status === EnumProposalStatus.Vote) {
            tm = setInterval(() => {
                const now = Date.now() / 1000;
                if (proposal.status === EnumProposalStatus.PendingVote) {
                    if (proposal.vote_start && now > proposal.vote_start) {
                        fetchProposal(proposal.proposalId || '');
                        refetchVoteStatus().catch(console.log);
                    }
                } else if (proposal.vote_end && now > proposal.vote_end) {
                    fetchProposal(proposal.proposalId || '');
                    refetchVoteStatus().catch(console.log);
                }
            }, 10000);
        }
        return () => {
            if (tm !== undefined) {
                clearInterval(tm);
            }
        };
    }, [
        proposal?.status,
        proposal?.vote_end,
        proposal?.vote_start,
        proposal?.proposalId,
        fetchProposal,
        refetchVoteStatus,
    ]);

    useEffect(() => {
        if (voteStatusData?.voteStatus) {
            setIsValidator(!!voteStatusData.voteStatus.isValidVoter);
            setNeedVote(!!voteStatusData.voteStatus.needVote);
            if (voteStatusData.voteStatus.voteProposalState) {
                setVoteProposalState(voteStatusData.voteStatus.voteProposalState);
            } else {
                setVoteProposalState(EnumVoteProposalState.None);
            }
        }
    }, [voteStatusData]);

    const runVote = useCallback(
        async (vote: VOTE_SELECT): Promise<boolean> => {
            try {
                if (isGuest || !metamaskProvider) {
                    return false;
                }

                if (!proposal?.proposalId) {
                    dispatch(showSnackBar(getString('Proposal 정보가 잘못 입력되었습니다&#46;')));
                    return false;
                }

                dispatch(showLoadingAniModal());

                if (!isJoined) await joinProposal();
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
                    dispatch(hideLoadingAniModal());
                    dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                    return false;
                }
                const { signature, commitment } = submitResult.data.submitBallot;
                if (!signature || !commitment) {
                    dispatch(hideLoadingAniModal());
                    dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                    return false;
                }

                setRunningTx(true);

                const voteraVote = new VoteraVote(proposal?.voteraVoteAddress || '', metamaskProvider.getSigner());
                const tx = await voteraVote.submitBallot(proposal.proposalId, commitment, signature, {});

                await recordBallot({
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

                tx.wait()
                    .catch(console.log)
                    .finally(() => {
                        setRunningTx(false);
                    });

                metamaskUpdateBalance();
                setNeedVote(false);
                dispatch(hideLoadingAniModal());
                onRefresh();
                return true;
            } catch (err) {
                setRunningTx(false);
                console.log('runVote catch exception: ', err);
                dispatch(hideLoadingAniModal());
                dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                return false;
            }
        },
        [
            dispatch,
            isGuest,
            isJoined,
            joinProposal,
            metamaskProvider,
            metamaskUpdateBalance,
            proposal?.proposalId,
            proposal?.voteraVoteAddress,
            onRefresh,
            recordBallot,
            submitBallot,
            user?.address,
        ],
    );

    const runWithdraw = useCallback(async () => {
        if (isGuest || !voteStatusData?.voteStatus || !proposal?.proposalId || !metamaskProvider) {
            return getString('현재 상태 오류로 실행할 수 없는 상태입니다&#46;');
        }

        switch (voteStatusData.voteStatus.voteProposalState) {
            case EnumVoteProposalState.Approved:
                break;
            case EnumVoteProposalState.Withdrawn:
                return getString('펀딩자금이 이미 지급되었습니다&#46;');
            case EnumVoteProposalState.Rejected:
            case EnumVoteProposalState.InvalidQuorum:
                return getString('제안이 정족수 부족으로 무효화되거나 찬성표 부족으로 부결되었습니다&#46;');
            case EnumVoteProposalState.AssessmentFailed:
                return getString('사전평가에서 거부되었습니다&#46;');
            default:
                return getString('개표가 완료되지 않았습니다&#46;');
        }

        try {
            setRunningTx(true);
            const commonsBudget = new CommonsBudget(
                voteStatusData.voteStatus.destination || '',
                metamaskProvider.getSigner(),
            );
            const tx = await commonsBudget.withdraw(proposal.proposalId, {});
            const receipt = await tx.wait();
            metamaskUpdateBalance();
            if (receipt.status) {
                refetchVoteStatus().catch(console.log);
                return '';
            }
            return getString('자금인출 시 알 수 없는 오류가 발생헀습니다&#46;');
        } catch (err) {
            console.log('withdraw error = ', err);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const revertMsg = getRevertMessage(err);
            return convertWithdrawRevertMessage(revertMsg);
        } finally {
            setRunningTx(false);
        }
    }, [
        isGuest,
        metamaskProvider,
        metamaskUpdateBalance,
        proposal?.proposalId,
        refetchVoteStatus,
        voteStatusData?.voteStatus,
    ]);

    if (proposal?.status === EnumProposalStatus.PendingVote) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
                <PendingVote />
            </View>
        );
    }

    if (metamaskStatus === MetamaskStatus.UNAVAILABLE) {
        // redirect to landing page for installing metamassk
        signOut();
        return <ActivityIndicator />;
    }

    const renderOtherChain = () => {
        if (needVote) {
            return (
                <View style={globalStyle.center}>
                    <CommonButton
                        title={getString('메타마스크 체인 변경')}
                        buttonStyle={globalStyle.metaButton}
                        filled
                        onPress={metamaskSwitch}
                        raised
                    />
                </View>
            );
        }
        if (loading || voteProposalState === undefined) {
            return <ActivityIndicator />;
        }
        if (voteProposalState === EnumVoteProposalState.None) {
            return <PendingVote />;
        }
        if (voteProposalState === EnumVoteProposalState.Running) {
            return <Voting runVote={runVote} canVote={false} needVote={needVote} />;
        }
        return (
            <VoteResult
                data={voteStatusData?.voteStatus}
                runWithdraw={() => {
                    return Promise.resolve(getString('메타마스크 네트워크를 변경해주세요&#46;'));
                }}
            />
        );
    };

    const renderConnected = () => {
        if (loading || voteProposalState === undefined) {
            return <ActivityIndicator />;
        }
        if (voteProposalState === EnumVoteProposalState.None) {
            return <PendingVote />;
        }
        if (voteProposalState === EnumVoteProposalState.Running) {
            return <Voting runVote={runVote} canVote={isValidator} needVote={needVote} />;
        }
        return <VoteResult data={voteStatusData?.voteStatus} runWithdraw={runWithdraw} />;
    };

    if (isGuest) {
        return <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>{renderConnected()}</View>;
    }

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            {metamaskStatus === MetamaskStatus.INITIALIZING && <ActivityIndicator size="large" />}
            {metamaskStatus === MetamaskStatus.NOT_CONNECTED && (
                <View style={globalStyle.center}>
                    <CommonButton
                        title={getString('메타마스크 연결하기')}
                        buttonStyle={globalStyle.metaButton}
                        filled
                        onPress={metamaskConnect}
                        raised
                    />
                </View>
            )}
            {metamaskStatus === MetamaskStatus.CONNECTING && <ActivityIndicator size="large" />}
            {metamaskStatus === MetamaskStatus.OTHER_CHAIN && renderOtherChain()}
            {metamaskStatus === MetamaskStatus.CONNECTED && renderConnected()}
        </View>
    );
}

export default VoteScreen;
