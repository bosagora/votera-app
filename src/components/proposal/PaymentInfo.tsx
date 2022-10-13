import React, { useContext, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import {
    Proposal,
    ProposalFeePayload,
    Enum_Fee_Status as EnumFeeStatus,
    Enum_Proposal_Type as EnumProposalType,
} from '~/graphql/generated/generated';
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import { getCommonPeriodText } from '~/utils/time';
import CommonButton from '~/components/button/CommonButton';

const styles = StyleSheet.create({
    metaContainer: { alignSelf: 'center', borderRadius: 25 },
});

function LineComponent(): JSX.Element {
    return <View style={globalStyle.lineComponent} />;
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
    const { metamaskProvider } = useContext(AuthContext);
    const defaultStyle = { lineHeight: 25 };

    const renderButton = useCallback(() => {
        if (!proposalFee?.destination || !metamaskProvider) {
            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text>{getString('입금 정보 확인 중 오류가 발생했습니다&#46;')}</Text>
                </View>
            );
        }

        switch (proposalFee?.status) {
            case EnumFeeStatus.Wait:
                return (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        {loading && <ActivityIndicator />}
                        {!loading && (
                            <CommonButton
                                title={getString('메타마스크 호출')}
                                containerStyle={styles.metaContainer}
                                buttonStyle={globalStyle.metaButton}
                                filled
                                onPress={onCallBudget}
                                raised
                            />
                        )}
                    </View>
                );
            case EnumFeeStatus.Mining:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.primary, textAlign: 'center' },
                            ]}
                        >
                            {getString('생성 중')}
                        </Text>
                    </View>
                );
            case EnumFeeStatus.Paid:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.primary, textAlign: 'center' },
                            ]}
                        >
                            {getString('입금 확인')}
                        </Text>
                    </View>
                );
            case EnumFeeStatus.Irrelevant:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>{getString('입금 작업과 관련이 없습니다&#46;')}</Text>
                    </View>
                );
            default:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>{getString('입금 정보에 오류가 있습니다&#46;')}</Text>
                    </View>
                );
        }
    }, [
        loading,
        metamaskProvider,
        onCallBudget,
        proposalFee?.destination,
        proposalFee?.status,
        themeContext.color.primary,
    ]);

    return (
        <>
            {proposal?.type === EnumProposalType.Business && (
                <View style={{ marginTop: 30 }}>
                    <Text style={globalStyle.btext}>{getString('사전 평가 기간')}</Text>
                    <Text style={{ marginTop: 13 }}>{`${getCommonPeriodText(proposal?.assessPeriod)}`}</Text>
                </View>
            )}
            {proposal?.type === EnumProposalType.System && (
                <View style={{ marginTop: 30 }}>
                    <Text style={globalStyle.btext}>{getString('투표 기간')}</Text>
                    <Text style={{ marginTop: 13 }}>{`${getCommonPeriodText(proposal?.votePeriod)}`}</Text>
                </View>
            )}

            <LineComponent />

            {proposalFee?.status === EnumFeeStatus.Wait && (
                <>
                    <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>
                        {getString('주의사항')}
                    </Text>
                    <Text style={{ marginTop: 13, lineHeight: 23 }}>
                        {proposal?.type === EnumProposalType.Business
                            ? getString('제안 수수료를 입금해야 사전평가가 시작됩니다&#46;')
                            : getString('제안 수수료를 입금해야 투표가 시작될 수 있습니다&#46;')}
                    </Text>
                </>
            )}
            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>{getString('입금주소')} : </Text>
                <Text style={[globalStyle.ltext, defaultStyle, { marginLeft: 19, flex: 1 }]}>
                    {proposalFee?.destination || ''}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                <Text style={defaultStyle}>{getString('입금금액')} : </Text>
                <Text style={[globalStyle.btext, defaultStyle, { color: themeContext.color.primary, marginLeft: 19 }]}>
                    {StringWeiAmountFormat(proposalFee?.feeAmount)} BOA
                </Text>
            </View>
            {renderButton()}

            <LineComponent />

            <Text style={[globalStyle.btext, { marginTop: 12, marginBottom: 15 }]}>{getString('제안요약')}</Text>

            {proposal?.type === EnumProposalType.Business && (
                <View style={{ flexDirection: 'row' }}>
                    <Text style={[defaultStyle, { width: 80 }]}>{getString('요청비용')}</Text>
                    <Text style={[globalStyle.btext, defaultStyle, { color: themeContext.color.primary }]}>
                        {StringWeiAmountFormat(proposal?.fundingAmount)} BOA
                    </Text>
                </View>
            )}

            <View style={{ flexDirection: 'row' }}>
                <Text style={[defaultStyle, { width: 80 }]}>{getString('사업내용')}</Text>
                <Text style={[globalStyle.ltext, defaultStyle, { flex: 1 }]}>{proposal?.description}</Text>
            </View>
        </>
    );
}

export default PaymentInfo;

PaymentInfo.defaultProps = {
    proposal: undefined,
    proposalFee: undefined,
};
