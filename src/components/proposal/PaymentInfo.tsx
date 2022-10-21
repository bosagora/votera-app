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
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import CommonButton from '~/components/button/CommonButton';

const styles = StyleSheet.create({
    metaContainer: { alignSelf: 'center', borderRadius: 25 },
});

function LineComponent(): JSX.Element {
    return <View style={globalStyle.lineComponent} />;
}

const MAX_HEIGHT = 200;
const COLUMN_WIDTH = 70;

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
    const [maxWidth, setMaxWidth] = useState(0);
    const [clientSize, setClientSize] = useState([0, 0]);
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        if (clientSize[0] > maxWidth) {
            setHidden(false);
        } else if (clientSize[1] > MAX_HEIGHT) {
            setHidden(false);
        } else {
            setHidden(true);
        }
    }, [maxWidth, clientSize]);

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
        <View
            style={{ width: '100%' }}
            onLayout={(event) => {
                setMaxWidth(event.nativeEvent.layout.width - COLUMN_WIDTH);
            }}
        >
            {proposalFee?.status === EnumFeeStatus.Wait && (
                <View style={{ marginTop: 45 }}>
                    <Text
                        style={[
                            globalStyle.btext,
                            { fontSize: 13, lineHeight: 17, color: themeContext.color.disagree },
                        ]}
                    >
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
            )}
            <View style={{ flexDirection: 'row', marginTop: 45 }}>
                <Text
                    style={[
                        globalStyle.rtext,
                        { fontSize: 13, lineHeight: 24, width: COLUMN_WIDTH, color: themeContext.color.black },
                    ]}
                >
                    {getString('입금주소')}
                </Text>
                <Text
                    style={[
                        globalStyle.ltext,
                        { fontSize: 13, lineHeight: 24, maxWidth, color: themeContext.color.black },
                    ]}
                >
                    {proposalFee?.destination || ''}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                <Text
                    style={[
                        globalStyle.rtext,
                        { fontSize: 13, lineHeight: 24, width: COLUMN_WIDTH, color: themeContext.color.black },
                    ]}
                >
                    {getString('입금금액')}
                </Text>
                <Text
                    style={[
                        globalStyle.btext,
                        { fontSize: 13, lineHeight: 24, flex: 1, color: themeContext.color.primary },
                    ]}
                >
                    {StringWeiAmountFormat(proposalFee?.feeAmount)} BOA
                </Text>
            </View>

            {renderButton()}

            <LineComponent />

            <Text
                style={[
                    globalStyle.btext,
                    { fontSize: 13, lineHeight: 17, marginBottom: 15, color: themeContext.color.black },
                ]}
            >
                {getString('제안요약')}
            </Text>

            {proposal?.type === EnumProposalType.Business && (
                <View style={{ flexDirection: 'row' }}>
                    <Text
                        style={[
                            globalStyle.rtext,
                            { fontSize: 13, lineHeight: 24, width: COLUMN_WIDTH, color: themeContext.color.black },
                        ]}
                    >
                        {getString('요청금액')}
                    </Text>
                    <Text
                        style={[
                            globalStyle.btext,
                            { fontSize: 13, lineHeight: 24, flex: 1, color: themeContext.color.primary },
                        ]}
                    >
                        {StringWeiAmountFormat(proposal?.fundingAmount)} BOA
                    </Text>
                </View>
            )}

            <View style={{ flexDirection: 'row' }}>
                <Text
                    style={[
                        globalStyle.rtext,
                        { fontSize: 13, lineHeight: 24, width: COLUMN_WIDTH, color: themeContext.color.black },
                    ]}
                >
                    {getString('사업내용')}
                </Text>
                <View style={{ overflow: hidden ? 'hidden' : 'scroll', maxHeight: MAX_HEIGHT, maxWidth }}>
                    <Text
                        style={[
                            globalStyle.ltext,
                            {
                                fontSize: 13,
                                lineHeight: 24,
                                color: themeContext.color.textBlack,
                            },
                        ]}
                        onLayout={(event) => {
                            if (event.nativeEvent?.layout) {
                                const { width, height } = event.nativeEvent.layout;
                                setClientSize([width, height]);
                            }
                        }}
                    >
                        {proposal?.description}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default PaymentInfo;

PaymentInfo.defaultProps = {
    proposal: undefined,
    proposalFee: undefined,
};
