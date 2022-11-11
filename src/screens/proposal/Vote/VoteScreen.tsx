import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { convertWithdrawRevertMessage, getRevertMessage, VOTE_SELECT } from '~/utils/votera/voterautil';
import {
    Proposal,
    Enum_Proposal_Status as EnumProposalStatus,
    Enum_Vote_Proposal_State as EnumVoteProposalState,
    useVoteStatusLazyQuery,
    VoteStatusPayload,
} from '~/graphql/generated/generated';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import Voting from './voting';
import VoteResult from './result';
import PendingVote from './pendingVote';

interface Props {
    proposal: Proposal | undefined;
    onSubmitBallot: (vote: VOTE_SELECT) => Promise<boolean>;
}

function VoteScreen(props: Props): JSX.Element {
    const { proposal, onSubmitBallot } = props;
    const { user, isGuest, metamaskStatus, metamaskProvider, metamaskUpdateBalance } = useContext(AuthContext);
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
        if (voteStatusData?.voteStatus) {
            setIsValidator(!!voteStatusData.voteStatus.isValidVoter);
            setNeedVote(!!voteStatusData.voteStatus.needVote);
            if (voteStatusData.voteStatus.voteProposalState) {
                setVoteProposalState(voteStatusData.voteStatus.voteProposalState);
            } else {
                setVoteProposalState(EnumVoteProposalState.None);
            }
        }
    }, [voteStatusData?.voteStatus]);

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

    const runWithdraw = useCallback(
        async (proposalId: string | null | undefined, voteStatus: VoteStatusPayload | null | undefined) => {
            if (isGuest || !voteStatus || !proposalId || !metamaskProvider) {
                return getString('현재 상태 오류로 실행할 수 없는 상태입니다&#46;');
            }

            switch (voteStatus.voteProposalState) {
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
                const commonsBudget = new CommonsBudget(voteStatus.destination || '', metamaskProvider.getSigner());
                const tx = await commonsBudget.withdraw(proposalId, {});
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
        },
        [isGuest, metamaskProvider, metamaskUpdateBalance, refetchVoteStatus],
    );

    const renderVoteContent = useCallback(
        (item: Proposal | undefined, voteStatus: VoteStatusPayload | null | undefined) => {
            if (loading) {
                return <ActivityIndicator />;
            }
            if (voteProposalState === undefined) {
                return null;
            }
            switch (voteProposalState) {
                case EnumVoteProposalState.None:
                    return <PendingVote proposal={item} />;
                case EnumVoteProposalState.Running:
                    if (item?.status === EnumProposalStatus.PendingVote || !isValidator || isGuest) {
                        return <PendingVote proposal={item} />;
                    }
                    return <Voting runVote={runVote} canVote={isValidator && !isGuest} needVote={needVote} />;
                default:
                    return (
                        <VoteResult
                            proposal={item}
                            data={voteStatus}
                            runWithdraw={async () => {
                                if (metamaskStatus === MetamaskStatus.OTHER_CHAIN) {
                                    return getString('메타마스크 네트워크를 변경해주세요&#46;');
                                }
                                if (metamaskStatus !== MetamaskStatus.CONNECTED) {
                                    return getString('메타마스크와 연결되지 않았습니다&#46;');
                                }
                                return runWithdraw(item?.proposalId, voteStatus);
                            }}
                        />
                    );
            }
        },
        [isGuest, isValidator, loading, metamaskStatus, needVote, runVote, runWithdraw, voteProposalState],
    );

    return <View>{renderVoteContent(proposal, voteStatusData?.voteStatus)}</View>;
}

export default VoteScreen;
