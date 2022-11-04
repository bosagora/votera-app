import React, { useContext, useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BigNumber } from 'ethers';
import { useIsFocused } from '@react-navigation/native';
import CommonButton from '~/components/button/CommonButton';
import {
    useGetProposalFeeLazyQuery,
    useCheckProposalFeeLazyQuery,
    Enum_Fee_Status as EnumFeeStatus,
    Enum_Proposal_Type as EnumProposalType,
    Proposal,
} from '~/graphql/generated/generated';
import { convertCreateRevertMessage, getRevertMessage } from '~/utils/votera/voterautil';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import PaymentInfo from '~/components/proposal/PaymentInfo';
import globalStyle from '~/styles/global';

interface Props {
    proposal: Proposal;
    onLayout: (h: number) => void;
    onChangeStatus: () => void;
}

function CreateScreen(props: Props): JSX.Element {
    const { proposal, onChangeStatus, onLayout } = props;
    const { metamaskStatus, metamaskProvider, isGuest, signOut, metamaskUpdateBalance } = useContext(AuthContext);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    const [getProposalFee, { data, refetch }] = useGetProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [checkProposalFee, { data: checkProposalFeeData }] = useCheckProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        if (proposal?.proposalId) {
            getProposalFee({ variables: { proposalId: proposal.proposalId || '' } }).catch(console.log);
        }
    }, [proposal?.proposalId, getProposalFee]);

    const callCommonsBudget = useCallback(
        async (proposalId: string) => {
            if (!data?.proposalFee?.destination || !metamaskProvider) {
                return;
            }
            const { proposalFee } = data;
            try {
                setLoading(true);

                let tx;
                const commonsBudget = new CommonsBudget(proposalFee.destination || '', metamaskProvider.getSigner());
                if (proposalFee.type === EnumProposalType.Business) {
                    const fundInput = {
                        start: data.proposalFee?.start || 0,
                        end: data.proposalFee?.end || 0,
                        startAssess: data.proposalFee?.startAssess || 0,
                        endAssess: data.proposalFee?.endAssess || 0,
                        amount: BigNumber.from(data.proposalFee?.amount || '0'),
                        docHash: data.proposalFee?.docHash || '',
                        title: data.proposalFee?.title || '',
                    };
                    tx = await commonsBudget.createFundProposal(
                        proposalId,
                        fundInput,
                        data.proposalFee?.signature || '',
                        {
                            value: BigNumber.from(data.proposalFee?.feeAmount || '0'),
                        },
                    );
                } else {
                    const systemInput = {
                        start: data.proposalFee?.start || 0,
                        end: data.proposalFee?.end || 0,
                        startAssess: 0,
                        endAssess: 0,
                        amount: 0,
                        docHash: data.proposalFee?.docHash || '',
                        title: data.proposalFee?.title || '',
                    };
                    tx = await commonsBudget.createSystemProposal(
                        proposalId,
                        systemInput,
                        data.proposalFee?.signature || '',
                        {
                            value: BigNumber.from(data.proposalFee?.feeAmount || '0'),
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
        [checkProposalFee, data, dispatch, metamaskProvider, metamaskUpdateBalance, refetch],
    );

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (checkProposalFeeData?.checkProposalFee) {
            if (checkProposalFeeData.checkProposalFee.status === EnumFeeStatus.Paid) {
                dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                refetch().catch(console.log);
                onChangeStatus();
            } else if (checkProposalFeeData.checkProposalFee.status !== EnumFeeStatus.Mining) {
                dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
            }
        }
    }, [checkProposalFeeData?.checkProposalFee, dispatch, isFocused, onChangeStatus, refetch]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (data?.proposalFee?.status === EnumFeeStatus.Paid) {
            dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
            onChangeStatus();
        } else {
            switch (data?.proposalFee?.status) {
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
    }, [data?.proposalFee?.status, dispatch, isFocused, onChangeStatus]);

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
                            callCommonsBudget(proposal?.proposalId || '').catch(console.log);
                        }
                    }}
                    loading={loading}
                />
            </View>
        </View>
    );
}

export default CreateScreen;
