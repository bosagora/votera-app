import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import CommonButton from '~/components/button/CommonButton';
import { convertWithdrawRevertMessage, getRevertMessage, VOTE_SELECT } from '~/utils/votera/voterautil';
import {
    Enum_Proposal_Status as EnumProposalStatus,
    Enum_Vote_Proposal_State as EnumVoteProposalState,
    useVoteStatusLazyQuery,
} from '~/graphql/generated/generated';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import Voting from './voting';
import VoteResult from './result';
import PendingVote from './pendingVote';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import globalStyle from '~/styles/global';

interface Props {
    onLayout: (h: number) => void;
    onSubmitBallot: (vote: VOTE_SELECT) => Promise<boolean>;
}

function VoteScreen(props: Props): JSX.Element {
    const { onLayout, onSubmitBallot } = props;
    const { proposal, fetchProposal } = useContext(ProposalContext);
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
    const [voteProposalState, setVoteProposalState] = useState<EnumVoteProposalState>();

    const [getVoteStatus, { data: voteStatusData, refetch: refetchVoteStatus, loading }] = useVoteStatusLazyQuery({
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });

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
            if (isGuest) {
                return false;
            }
            const result = await onSubmitBallot(vote);
            if (result) {
                setNeedVote(false);
            }
            return result;
        },
        [isGuest, onSubmitBallot],
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
            const commonsBudget = new CommonsBudget(
                voteStatusData.voteStatus.destination || '',
                metamaskProvider.getSigner(),
            );
            const tx = await commonsBudget.withdraw(proposal.proposalId, {});
            const receipt = await tx.wait();
            metamaskUpdateBalance(tx.hash);
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
