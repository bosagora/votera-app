import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { AuthContext } from '~/contexts/AuthContext';
import {
    Proposal,
    Enum_Proposal_Status as EnumProposalStatus,
    AssessResultPayload,
} from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import Evaluating, { AssessResult } from './evaluating';
import PendingAssess from './pendingAssess';
import EvaluationResult from './result';

interface Props {
    proposal: Proposal;
    assessResultData: AssessResultPayload;
    onSubmitAssess: (data: AssessResult[]) => Promise<void>;
}

function AssessScreen(props: Props): JSX.Element {
    const { proposal, assessResultData, onSubmitAssess } = props;
    const dispatch = useAppDispatch();
    const { isGuest } = useContext(AuthContext);
    const [needEvaluation, setNeedEvaluation] = useState(!!assessResultData?.needEvaluation);

    useEffect(() => {
        setNeedEvaluation(!!assessResultData?.needEvaluation);
    }, [assessResultData?.needEvaluation]);

    const submitResponse = useCallback(
        async (data: AssessResult[]) => {
            if (!needEvaluation) {
                return;
            }
            try {
                await onSubmitAssess(data);
                setNeedEvaluation(false);
            } catch (err) {
                dispatch(showSnackBar(getString('평가 처리 중 오류가 발생헀습니다&#46;')));
                console.log(err);
            }
        },
        [dispatch, needEvaluation, onSubmitAssess],
    );

    const renderAssessContent = useCallback(
        (item: Proposal | undefined, assessResult: AssessResultPayload) => {
            if (item?.status === EnumProposalStatus.PendingAssess) {
                return <PendingAssess proposal={proposal} />;
            }
            if (isGuest) {
                return <EvaluationResult assessResultData={assessResult} />;
            }
            if (needEvaluation) {
                return <Evaluating proposal={proposal} onEvaluating={submitResponse} />;
            }
            return <EvaluationResult assessResultData={assessResult} />;
        },
        [isGuest, needEvaluation, proposal, submitResponse],
    );

    return <View>{renderAssessContent(proposal, assessResultData)}</View>;
}

export default AssessScreen;
