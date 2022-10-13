import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BigNumber } from 'ethers';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import {
    Enum_Proposal_Status as EnumProposalStatus,
    useSubmitAssessMutation,
    AssessResultPayload,
} from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import VoteraVote from '~/utils/votera/VoteraVote';
import Evaluating, { AssessResult } from './evaluating';
import PendingAssess from './pendingAssess';
import EvaluationResult from './result';
import globalStyle from '~/styles/global';

interface Props {
    // proposalId: string;
    assessResultData: AssessResultPayload;
    onLayout: (h: number) => void;
    refetchAssess: () => void;
    onChangeStatus: () => void;
}

function AssessScreen(props: Props): JSX.Element {
    const { assessResultData, onLayout, refetchAssess, onChangeStatus } = props;
    const { proposal, isJoined, joinProposal, fetchProposal } = useContext(ProposalContext);
    const { metamaskStatus, metamaskProvider, signOut, metamaskConnect, metamaskSwitch } = useContext(AuthContext);
    const [needEvaluation, setNeedEvaluation] = useState(false);
    const [submitAssess] = useSubmitAssessMutation();

    useEffect(() => {
        setNeedEvaluation(!!assessResultData?.needEvaluation);
    }, [assessResultData?.needEvaluation]);

    useEffect(() => {
        let tm: NodeJS.Timer;
        if (!proposal) {
            onChangeStatus();
        } else if (
            proposal.status !== EnumProposalStatus.PendingAssess &&
            proposal.status !== EnumProposalStatus.Assess &&
            proposal.status !== EnumProposalStatus.Reject
        ) {
            onChangeStatus();
        } else {
            tm = setInterval(() => {
                const now = Date.now() / 1000;
                if (proposal.status === EnumProposalStatus.PendingAssess) {
                    if (proposal.assessStart && now > proposal.assessStart) {
                        fetchProposal(proposal.proposalId || '');
                    }
                } else if (proposal.assessEnd && now > proposal.assessEnd) {
                    fetchProposal(proposal.proposalId || '');
                }
            }, 10000);
        }
        return () => {
            if (tm !== undefined) {
                clearInterval(tm);
            }
        };
    }, [proposal, onChangeStatus, fetchProposal]);

    const submitResponse = useCallback(
        async (data: AssessResult[]) => {
            if (!needEvaluation || !proposal?.proposalId || !metamaskProvider) {
                return;
            }
            try {
                if (!isJoined) await joinProposal();
                const values = data.map((d) => BigNumber.from(d.value));
                const voteraVote = new VoteraVote(proposal?.voteraVoteAddress || '', metamaskProvider.getSigner());
                const tx = await voteraVote.submitAssess(proposal.proposalId, values, {});

                const content = data.map((d) => ({
                    __typename: 'ComponentPostScaleAnswer',
                    value: d.value,
                    sequence: d.sequence,
                }));

                await submitAssess({
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
                refetchAssess();
                setNeedEvaluation(false);
            } catch (e) {
                console.log('Create Assess error : ', e);
            }
        },
        [
            isJoined,
            joinProposal,
            metamaskProvider,
            needEvaluation,
            proposal?.proposalId,
            proposal?.voteraVoteAddress,
            refetchAssess,
            submitAssess,
        ],
    );

    if (proposal?.status === EnumProposalStatus.PendingAssess) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
                <PendingAssess />
            </View>
        );
    }

    if (metamaskStatus === MetamaskStatus.UNAVAILABLE) {
        // redirect to landing page for installing metamask
        signOut();
        return <ActivityIndicator />;
    }

    const renderOtherChain = () => {
        if (needEvaluation) {
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
        return <EvaluationResult assessResultData={assessResultData} />;
    };

    const renderConnected = () => {
        if (needEvaluation) {
            return (
                <Evaluating
                    onEvaluating={(data) => {
                        submitResponse(data).catch(console.log);
                    }}
                />
            );
        }
        return <EvaluationResult assessResultData={assessResultData} />;
    };

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

export default AssessScreen;
