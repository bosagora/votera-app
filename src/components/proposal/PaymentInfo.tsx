import React, { useContext, useCallback, useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import {
    Proposal,
    ProposalFeePayload,
    Enum_Fee_Status as EnumFeeStatus,
    Enum_Proposal_Type as EnumProposalType,
} from '~/graphql/generated/generated';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import CommonButton from '~/components/button/CommonButton';

const styles = StyleSheet.create({
    accountLabel: { fontSize: 13, lineHeight: 24 },
    metaContainer: { alignSelf: 'center', borderRadius: 25 },
});

function getColumnWidth() {
    return 70;
}

interface PaymentInfoProps {
    proposal?: Proposal | null;
    proposalFee?: ProposalFeePayload | null;
    onCallBudget: () => void;
    loading: boolean;
}

function PaymentInfo(props: PaymentInfoProps): JSX.Element {
    const { proposal, proposalFee, onCallBudget, loading } = props;
    const themeContext = useContext(ThemeContext);
    const { metamaskStatus, metamaskProvider, metamaskConnect, metamaskSwitch } = useContext(AuthContext);
    const [viewWidth, setViewWidth] = useState(0);

    const columnWidth = getColumnWidth();

    const renderButton = useCallback(() => {
        if (!proposalFee?.destination || !metamaskProvider) {
            return null;
        }

        switch (metamaskStatus) {
            case MetamaskStatus.INITIALIZING:
            case MetamaskStatus.CONNECTING:
                return (
                    <View style={[globalStyle.center, { height: 50 }]}>
                        <ActivityIndicator />
                    </View>
                );
            case MetamaskStatus.NOT_CONNECTED:
                return (
                    <View style={globalStyle.center}>
                        <CommonButton
                            title={getString('메타마스크 연결하기')}
                            containerStyle={styles.metaContainer}
                            buttonStyle={globalStyle.metaButton}
                            filled
                            onPress={metamaskConnect}
                            raised
                        />
                    </View>
                );
            case MetamaskStatus.OTHER_CHAIN:
                return (
                    <View style={globalStyle.center}>
                        <CommonButton
                            title={getString('메타마스크 체인 변경')}
                            containerStyle={styles.metaContainer}
                            buttonStyle={globalStyle.metaButton}
                            filled
                            onPress={metamaskSwitch}
                            raised
                        />
                    </View>
                );
            default:
                break;
        }

        switch (proposalFee?.status) {
            case EnumFeeStatus.Wait:
                if (loading) {
                    return (
                        <View style={[globalStyle.center, { height: 50 }]}>
                            <ActivityIndicator />
                        </View>
                    );
                }
                return (
                    <View style={globalStyle.center}>
                        <CommonButton
                            title={getString('메타마스크 호출')}
                            containerStyle={styles.metaContainer}
                            buttonStyle={globalStyle.metaButton}
                            filled
                            onPress={onCallBudget}
                            raised
                        />
                    </View>
                );
            case EnumFeeStatus.Mining:
                return (
                    <View style={globalStyle.center}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.primary, textAlign: 'center' },
                            ]}
                        >
                            {getString('입금 확인 중')}
                        </Text>
                    </View>
                );
            case EnumFeeStatus.Paid:
                return (
                    <View style={globalStyle.center}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.primary, textAlign: 'center' },
                            ]}
                        >
                            {getString('입금 완료')}
                        </Text>
                    </View>
                );
            case EnumFeeStatus.Irrelevant:
                return (
                    <View style={globalStyle.center}>
                        <Text>{getString('입금 작업과 관련이 없습니다&#46;')}</Text>
                    </View>
                );
            default:
                return (
                    <View style={globalStyle.center}>
                        <Text>{getString('입금 정보에 오류가 있습니다&#46;')}</Text>
                    </View>
                );
        }
    }, [
        loading,
        metamaskConnect,
        metamaskProvider,
        metamaskStatus,
        metamaskSwitch,
        onCallBudget,
        proposalFee?.destination,
        proposalFee?.status,
        themeContext.color.primary,
    ]);

    return (
        <View
            style={{ width: '100%' }}
            onLayout={(event) => {
                setViewWidth(event.nativeEvent.layout.width);
            }}
        >
            <View style={{ marginTop: 45 }}>
                <Text style={[globalStyle.btext, { fontSize: 13, lineHeight: 17, color: themeContext.color.disagree }]}>
                    {getString('주의사항')}
                </Text>
                <Text
                    style={[
                        globalStyle.rtext,
                        { fontSize: 13, lineHeight: 23, marginTop: 13, color: themeContext.color.textBlack },
                    ]}
                >
                    {proposal?.type === EnumProposalType.Business
                        ? getString('제안 수수료를 입금해야 사전평가가 시작됩니다&#46;')
                        : getString('제안 수수료를 입금해야 투표가 시작될 수 있습니다&#46;')}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 45 }}>
                <Text
                    style={[
                        globalStyle.rtext,
                        styles.accountLabel,
                        { width: columnWidth, color: themeContext.color.black },
                    ]}
                >
                    {getString('입금주소')}
                </Text>
                <Text
                    style={[
                        globalStyle.ltext,
                        styles.accountLabel,
                        { maxWidth: viewWidth - columnWidth, color: themeContext.color.black },
                    ]}
                >
                    {proposalFee?.destination || ''}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                <Text
                    style={[
                        globalStyle.rtext,
                        styles.accountLabel,
                        { width: columnWidth, color: themeContext.color.black },
                    ]}
                >
                    {getString('입금금액')}
                </Text>
                <Text
                    style={[
                        globalStyle.btext,
                        styles.accountLabel,
                        { maxWidth: viewWidth - columnWidth, color: themeContext.color.primary },
                    ]}
                >
                    {StringWeiAmountFormat(proposalFee?.feeAmount)} BOA
                </Text>
            </View>

            {renderButton()}
        </View>
    );
}

export default PaymentInfo;

PaymentInfo.defaultProps = {
    proposal: undefined,
    proposalFee: undefined,
};
