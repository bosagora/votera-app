import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { Enum_Proposal_Status as EnumProposalStatus, AssessResultPayload } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import Evaluating, { AssessResult } from './evaluating';
import PendingAssess from './pendingAssess';
import EvaluationResult from './result';

interface Props {
    // proposalId: string;
    assessResultData: AssessResultPayload;
    onLayout: (h: number) => void;
    onSubmitAssess: (data: AssessResult[]) => Promise<void>;
    onChangeStatus: () => void;
}

function AssessScreen(props: Props): JSX.Element {
    const { assessResultData, onLayout, onSubmitAssess, onChangeStatus } = props;
    const dispatch = useAppDispatch();
    const { proposal, fetchProposal } = useContext(ProposalContext);
    const { metamaskStatus, isGuest, signOut } = useContext(AuthContext);
    const [needEvaluation, setNeedEvaluation] = useState(false);

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
        (data: AssessResult[]) => {
            if (!needEvaluation) {
                return;
            }
            onSubmitAssess(data)
                .then(() => {
                    setNeedEvaluation(false);
                })
                .catch((err) => {
                    dispatch(showSnackBar(getString('평가 처리 중 오류가 발생헀습니다&#46;')));
                    console.log(err);
                });
        },
        [dispatch, needEvaluation, onSubmitAssess],
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

    if (isGuest) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
                <EvaluationResult assessResultData={assessResultData} />
            </View>
        );
    }
    if (needEvaluation) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
                <Evaluating onEvaluating={submitResponse} />
            </View>
        );
    }
    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            <EvaluationResult assessResultData={assessResultData} />
        </View>
    );
}

export default AssessScreen;
