import React, { useContext, useEffect, useCallback, useState } from 'react';
import { View, Image, ActivityIndicator, ScrollView, ImageURISource, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from 'expo-asset';
import { BigNumber } from 'ethers';
import { useIsFocused } from '@react-navigation/native';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
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
    const { metamaskStatus, metamaskProvider, signOut, metamaskUpdateBalance } = useContext(AuthContext);
    const { proposal, fetchProposal } = useContext(ProposalContext);
    const dispatch = useAppDispatch();
    const [assets] = useAssets(iconAssets);
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    const [getProposalFee, { data, refetch }] = useGetProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [checkProposalFee, { data: checkProposalFeeData }] = useCheckProposalFeeLazyQuery({
        fetchPolicy: 'cache-and-network',
    });

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
                    fetchProposal(id);
                    navigation.replace('RootUser', {
                        screen: 'ProposalDetail',
                        params: { id },
                    });
                }}
            />
        );
    }, [fetchProposal, id, navigation]);

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
        if (isFocused) {
            if (checkProposalFeeData?.checkProposalFee) {
                if (checkProposalFeeData.checkProposalFee.status === EnumFeeStatus.Paid) {
                    dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
                    navigation.replace('RootUser', { screen: 'ProposalDetail', params: { id } });
                } else if (checkProposalFeeData.checkProposalFee.status !== EnumFeeStatus.Mining) {
                    dispatch(showSnackBar(getString('입금 정보 확인 중 오류가 발생했습니다&#46;')));
                }
            }
        }
    }, [checkProposalFeeData, dispatch, id, isFocused, navigation]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (data?.proposalFee?.status === EnumFeeStatus.Paid) {
            dispatch(showSnackBar(getString('입금이 확인되었습니다&#46;')));
            navigation.replace('RootUser', { screen: 'ProposalDetail', params: { id } });
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
    }, [data, dispatch, id, isFocused, navigation]);

    if (metamaskStatus === MetamaskStatus.UNAVAILABLE) {
        // redirect to landing page for installing metamask
        signOut();
        return <ActivityIndicator />;
    }

    return (
        <View style={styles.container}>
            <FocusAwareStatusBar barStyle="light-content" />
            <View style={{ width: '100%' }}>
                <ScrollView style={{ paddingHorizontal: 20, backgroundColor: 'white', flex: 1 }}>
                    <PaymentInfo
                        proposal={proposal}
                        proposalFee={data?.proposalFee}
                        onCallBudget={() => {
                            callCommonsBudget(id).catch(console.log);
                        }}
                        loading={loading}
                    />
                </ScrollView>
            </View>
        </View>
    );
}

export default ProposalPayment;
