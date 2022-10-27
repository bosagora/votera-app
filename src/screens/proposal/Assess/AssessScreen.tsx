import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
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
    onLayout: (h: number) => void;
    onSubmitAssess: (data: AssessResult[]) => Promise<void>;
}

function AssessScreen(props: Props): JSX.Element {
    const { proposal, assessResultData, onLayout, onSubmitAssess } = props;
    const dispatch = useAppDispatch();
    const { metamaskStatus, isGuest, signOut } = useContext(AuthContext);
    const [needEvaluation, setNeedEvaluation] = useState(false);

    useEffect(() => {
        setNeedEvaluation(!!assessResultData?.needEvaluation);
    }, [assessResultData?.needEvaluation]);

    const submitResponse = useCallback(
        async (data: AssessResult[]) => {
            if (!needEvaluation) {
                return;
            }
            try {
                await onSubmitAssess(data)
                setNeedEvaluation(false);
            } catch (err) {
                dispatch(showSnackBar(getString('평가 처리 중 오류가 발생헀습니다&#46;')));
                console.log(err);
            }
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
