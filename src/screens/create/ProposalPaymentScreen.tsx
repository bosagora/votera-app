import React, { useContext, useEffect, useCallback, useState } from 'react';
import { View, Image, ScrollView, ImageURISource, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { BigNumber } from 'ethers';
import { useIsFocused } from '@react-navigation/native';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
import {
    useGetProposalFeeLazyQuery,
    useCheckProposalFeeLazyQuery,
    Enum_Fee_Status as EnumFeeStatus,
    Enum_Proposal_Type as EnumProposalType,
    Proposal,
    ProposalFeePayload,
    useGetProposalByIdLazyQuery,
} from '~/graphql/generated/generated';
import { convertCreateRevertMessage, getRevertMessage } from '~/utils/votera/voterautil';
import { AuthContext } from '~/contexts/AuthContext';
import ShortButton from '~/components/button/ShortButton';
import PaymentInfo from '~/components/proposal/PaymentInfo';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import CommonsBudget from '~/utils/votera/CommonsBudget';
import { MainScreenProps } from '~/navigation/main/MainParams';
import { ChevronLeftIcon } from '~/components/icons';

enum EnumIconAsset {
    Background = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/header/bg.png')];

const styles = StyleSheet.create({
    container: { alignItems: 'center', backgroundColor: 'white', flex: 1 },
});

function ProposalPayment({ navigation, route }: MainScreenProps<'ProposalPayment'>): JSX.Element {
    const { id } = route.params;
    const { metamaskProvider, metamaskUpdateBalance } = useContext(AuthContext);
    const [proposal, setProposal] = useState<Proposal>();
    const [feeStatus, setFeeStatus] = useState<EnumFeeStatus>();
    const dispatch = useAppDispatch();
    const [assets] = useAssets(iconAssets);
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    const [getProposalDetail] = useGetProposalByIdLazyQuery({
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            if (data.proposalById) {
                setProposal(data.proposalById as Proposal);
            }
        },
    });
    const [getProposalFee, { data, refetch }] = useGetProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
        onCompleted: (proposalFeeData) => {
            if (proposalFeeData?.proposalFee) {
                const { status } = proposalFeeData.proposalFee;
                if (feeStatus === undefined && status) {
                    setFeeStatus(status);
                    return;
                }
                if (!isFocused || feeStatus === status) {
                    return;
                }
                if (status) {
                    setFeeStatus(status);
                }
                if (status === EnumFeeStatus.Paid) {
                    dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                    navigation.replace('RootUser', { screen: 'ProposalDetail', params: { id } });
                } else {
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
            if (!isFocused) {
                return;
            }

            if (checkProposalFeeData?.checkProposalFee) {
                const { status } = checkProposalFeeData.checkProposalFee;
                if (feeStatus === status) {
                    return;
                }
                if (status) {
                    setFeeStatus(status);
                }
                if (status === EnumFeeStatus.Paid) {
                    dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                    navigation.replace('RootUser', { screen: 'ProposalDetail', params: { id } });
                } else if (status !== EnumFeeStatus.Mining) {
                    dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                }
            }
        },
    });

    const fetchProposal = useCallback(
        (proposalId: string) => {
            getProposalDetail({ variables: { proposalId } }).catch((err) => {
                console.log('getProposalDetail error', err);
            });
        },
        [getProposalDetail],
    );

    const headerRight = useCallback(() => {
        return (
            <ShortButton
                title={getString('확인')}
                titleStyle={{ fontSize: 14, color: 'white' }}
                buttonStyle={{
                    backgroundColor: 'transparent',
                    width: 63,
                    height: 32,
                    padding: 0,
                    borderRadius: 47,
                    borderColor: 'white',
                    marginRight: 32,
                }}
                onPress={() => {
                    navigation.replace('RootUser', {
                        screen: 'ProposalDetail',
                        params: { id },
                    });
                }}
            />
        );
    }, [id, navigation]);

    const headerLeft = useCallback(() => {
        return <ChevronLeftIcon color="transparent" />;
    }, []);

    const headerBackground = useCallback(() => {
        return (
            <>
                {assets && (
                    <Image
                        style={{ height: TOP_NAV_HEIGHT + insets.top, width: '100%' }}
                        source={assets[EnumIconAsset.Background] as ImageURISource}
                    />
                )}
                <View style={globalStyle.headerBackground} />
            </>
        );
    }, [assets, insets.top]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: getString('수수료 납입'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerTitleAlign: 'center',
            headerLeft,
            headerRight,
            headerBackground,
            headerShown: true,
        });
    }, [headerBackground, headerLeft, headerRight, navigation]);

    useEffect(() => {
        if (id) {
            fetchProposal(id);
            getProposalFee({ variables: { proposalId: id } }).catch(console.log);
        }
    }, [fetchProposal, getProposalFee, id]);

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
        <View style={styles.container}>
            <FocusAwareStatusBar barStyle="light-content" />
            <View style={{ width: '100%' }}>
                <ScrollView style={{ paddingHorizontal: 20, backgroundColor: 'white', flex: 1 }}>
                    <PaymentInfo
                        proposal={proposal}
                        proposalFee={data?.proposalFee}
                        onCallBudget={() => {
                            callCommonsBudget(id, data?.proposalFee).catch(console.log);
                        }}
                        loading={loading}
                    />
                </ScrollView>
            </View>
        </View>
    );
}

export default ProposalPayment;
