import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { Enum_Proposal_Status as EnumProposalStatus, AssessResultPayload } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import globalStyle from '~/styles/global';
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
    const { metamaskStatus, isGuest, signOut, metamaskConnect, metamaskSwitch } = useContext(AuthContext);
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
            return <Evaluating onEvaluating={submitResponse} />;
        }
        return <EvaluationResult assessResultData={assessResultData} />;
    };

    if (isGuest) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
                <EvaluationResult assessResultData={assessResultData} />
            </View>
        );
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

export default AssessScreen;
