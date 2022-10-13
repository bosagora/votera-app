import React, { useContext, useCallback, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BigNumber } from 'ethers';
import CommonButton from '~/components/button/CommonButton';
import {
    useGetProposalFeeLazyQuery,
    useCheckProposalFeeLazyQuery,
    Enum_Fee_Status as EnumFeeStatus,
    Enum_Proposal_Type as EnumProposalType,
} from '~/graphql/generated/generated';
import { convertCreateRevertMessage, getRevertMessage } from '~/utils/votera/voterautil';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import PaymentInfo from '~/components/proposal/PaymentInfo';
import globalStyle from '~/styles/global';

interface Props {
    onLayout: (h: number) => void;
    onChangeStatus: () => void;
}

function CreateScreen(props: Props): JSX.Element {
    const { onChangeStatus, onLayout } = props;
    const { proposal } = useContext(ProposalContext);
    const { metamaskStatus, metamaskProvider, signOut, metamaskConnect, metamaskSwitch, metamaskUpdateBalance } =
        useContext(AuthContext);
    const dispatch = useAppDispatch();

    const [getProposalFee, { data, refetch }] = useGetProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [checkProposalFee, { data: checkProposalFeeData, refetch: refetchCheckProposalFee, loading }] =
        useCheckProposalFeeLazyQuery({
            fetchPolicy: 'cache-and-network',
            notifyOnNetworkStatusChange: true,
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

                checkProposalFee({
                    variables: {
                        proposalId,
                        transactionHash: tx.hash,
                    },
                }).catch((err) => {
                    console.log('checkProposalFee call error = ', err);
                    dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                });
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
            }
        },
        [checkProposalFee, data, dispatch, metamaskProvider],
    );

    useEffect(() => {
        if (checkProposalFeeData?.checkProposalFee) {
            if (checkProposalFeeData.checkProposalFee.status === EnumFeeStatus.Paid) {
                dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                refetch().catch(console.log);
                onChangeStatus();
            } else {
                if (checkProposalFeeData.checkProposalFee.status === EnumFeeStatus.Mining) {
                    setTimeout(() => {
                        refetchCheckProposalFee().catch((err) => {
                            console.log('refetchCheckProposalFee error ', err);
                            dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                        });
                    }, 1000);
                } else {
                    dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                }

                refetch().catch((err) => {
                    console.log('refetch error : ', err);
                    dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                });
            }
            metamaskUpdateBalance();
        }
    }, [checkProposalFeeData, dispatch, metamaskUpdateBalance, onChangeStatus, refetch, refetchCheckProposalFee]);

    if (metamaskStatus === MetamaskStatus.UNAVAILABLE) {
        // redirect to landing page for installing metamask
        signOut();
        return <ActivityIndicator />;
    }

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
            {metamaskStatus === MetamaskStatus.INITIALIZING && <ActivityIndicator />}
            {metamaskStatus === MetamaskStatus.NOT_CONNECTED && (
                <CommonButton
                    title={getString('메타마스크 연결하기')}
                    buttonStyle={globalStyle.metaButton}
                    filled
                    onPress={metamaskConnect}
                    raised
                />
            )}
            {metamaskStatus === MetamaskStatus.CONNECTING && <ActivityIndicator />}
            {metamaskStatus === MetamaskStatus.OTHER_CHAIN && (
                <CommonButton
                    title={getString('메타마스크 체인 변경')}
                    buttonStyle={globalStyle.metaButton}
                    filled
                    onPress={metamaskSwitch}
                    raised
                />
            )}
            {metamaskStatus === MetamaskStatus.CONNECTED && (
                <View style={{ paddingHorizontal: 20, backgroundColor: 'white', flex: 1 }}>
                    <PaymentInfo
                        proposal={proposal}
                        proposalFee={data?.proposalFee}
                        onCallBudget={() => {
                            callCommonsBudget(proposal?.proposalId || '').catch(console.log);
                        }}
                        loading={loading}
                    />
                </View>
            )}
        </View>
    );
}

export default CreateScreen;
