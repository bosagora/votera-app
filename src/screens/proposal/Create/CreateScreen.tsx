import React, { useContext, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { BigNumber } from 'ethers';
import { useIsFocused } from '@react-navigation/native';
import {
    useGetProposalFeeLazyQuery,
    useCheckProposalFeeLazyQuery,
    Enum_Fee_Status as EnumFeeStatus,
    Enum_Proposal_Type as EnumProposalType,
    Proposal,
    ProposalFeePayload,
} from '~/graphql/generated/generated';
import { convertCreateRevertMessage, getRevertMessage } from '~/utils/votera/voterautil';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import PaymentInfo from '~/components/proposal/PaymentInfo';

interface Props {
    proposal: Proposal;
    onLayout: (h: number) => void;
    onChangeStatus: () => void;
}

function CreateScreen(props: Props): JSX.Element {
    const { proposal, onChangeStatus, onLayout } = props;
    const { metamaskProvider, isGuest, metamaskUpdateBalance } = useContext(AuthContext);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [feeStatus, setFeeStatus] = useState<EnumFeeStatus>();
    const isFocused = useIsFocused();

    const [getProposalFee, { data, refetch }] = useGetProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
        onCompleted: (proposalFeeData) => {
            if (proposalFeeData?.proposalFee) {
                const { status } = proposalFeeData.proposalFee;
                if (feeStatus === undefined && status) {
                    setFeeStatus(status);
                    return;
                }
                if (feeStatus === status) {
                    return;
                }
                if (status) {
                    setFeeStatus(status);
                }
                if (status === EnumFeeStatus.Paid) {
                    if (isFocused) {
                        dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                    }
                    onChangeStatus();
                } else {
                    if (!isFocused) {
                        return;
                    }
                    switch (status) {
                        case EnumFeeStatus.Invalid:
                        case EnumFeeStatus.Irrelevant:
                            dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                            break;
                        case EnumFeeStatus.Expired:
                            dispatch(showSnackBar(getString('입금 유효 기간이 지났습니다&#46;')));
                            break;
                        default:
                            break;
                    }
                }
            }
        },
    });
    const [checkProposalFee] = useCheckProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
        onCompleted: (checkProposalFeeData) => {
            if (checkProposalFeeData?.checkProposalFee) {
                const { status } = checkProposalFeeData.checkProposalFee;
                if (feeStatus === status) {
                    return;
                }
                if (status) {
                    setFeeStatus(status);
                }
                if (status === EnumFeeStatus.Paid) {
                    if (isFocused) {
                        dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                    }
                    onChangeStatus();
                } else if (status !== EnumFeeStatus.Mining) {
                    if (isFocused) {
                        dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                    }
                }
            }
        },
    });

    useEffect(() => {
        if (proposal.proposalId) {
            getProposalFee({ variables: { proposalId: proposal.proposalId || '' } }).catch(console.log);
        }
    }, [proposal.proposalId, getProposalFee]);

    const callCommonsBudget = useCallback(
        async (proposalId: string, proposalFee: ProposalFeePayload | null | undefined) => {
            if (!proposalFee?.destination || !metamaskProvider) {
                return;
            }
            try {
                setLoading(true);

                let tx;
                const commonsBudget = new CommonsBudget(proposalFee.destination || '', metamaskProvider.getSigner());
                if (proposalFee.type === EnumProposalType.Business) {
                    const fundInput = {
                        start: proposalFee?.start || 0,
                        end: proposalFee?.end || 0,
                        startAssess: proposalFee?.startAssess || 0,
                        endAssess: proposalFee?.endAssess || 0,
                        amount: BigNumber.from(proposalFee?.amount || '0'),
                        docHash: proposalFee?.docHash || '',
                        title: proposalFee?.title || '',
                    };
                    tx = await commonsBudget.createFundProposal(proposalId, fundInput, proposalFee?.signature || '', {
                        value: BigNumber.from(proposalFee?.feeAmount || '0'),
                    });
                } else {
                    const systemInput = {
                        start: proposalFee?.start || 0,
                        end: proposalFee?.end || 0,
                        startAssess: 0,
                        endAssess: 0,
                        amount: 0,
                        docHash: proposalFee?.docHash || '',
                        title: proposalFee?.title || '',
                    };
                    tx = await commonsBudget.createSystemProposal(
                        proposalId,
                        systemInput,
                        proposalFee?.signature || '',
                        {
                            value: BigNumber.from(proposalFee?.feeAmount || '0'),
                        },
                    );
                }

                await checkProposalFee({
                    variables: {
                        proposalId,
                        transactionHash: tx.hash,
                    },
                });
                await refetch();
                setLoading(false);

                metamaskProvider
                    .waitForTransaction(tx.hash, 1)
                    .then((value) => {
                        metamaskUpdateBalance();
                        return refetch();
                    })
                    .catch(console.log);
            } catch (err) {
                const revertMessage = getRevertMessage(err);
                if (revertMessage) {
                    // AlreadyExistProposal
                    // InvalidFee
                    // NotEnoughBudget
                    // NotAuthorized
                    // InvalidInput
                    // NotReady
                    // E000
                    // E001
                    dispatch(showSnackBar(convertCreateRevertMessage(revertMessage)));
                } else {
                    console.log('callCommonsBudget call error = ', err);
                    dispatch(showSnackBar(getString('메타마스크 실행 중 오류가 발생했습니다&#46;')));
                }
                setLoading(false);
            }
        },
        [checkProposalFee, dispatch, metamaskProvider, metamaskUpdateBalance, refetch],
    );

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
            <View style={{ paddingHorizontal: 20, backgroundColor: 'white', flex: 1 }}>
                <PaymentInfo
                    proposal={proposal}
                    proposalFee={data?.proposalFee}
                    onCallBudget={() => {
                        if (isGuest) {
                            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                        } else {
                            callCommonsBudget(proposal?.proposalId || '', data?.proposalFee).catch(console.log);
                        }
                    }}
                    loading={loading}
                />
            </View>
        </View>
    );
}

export default CreateScreen;
