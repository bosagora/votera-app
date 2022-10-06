import React, { useContext } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import { getCommonPeriodText } from '~/utils/time';

function LineComponent(): JSX.Element {
    return <View style={globalStyle.lineComponent} />;
}

function PendingAssess(): JSX.Element {
    const { proposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);

    const defaultStyle = { lineHeight: 25 };

    return (
        <View>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[globalStyle.btext, { fontSize: 20, color: themeContext.color.primary }]}>
                    {getString('사전 평가 준비')}
                </Text>
                {/* <LText style={{ textAlign: 'center', lineHeight: 25, marginTop: 11.5 }}>{`해당 제안을 평가해주세요.\n평가된 평균점수가`}<MText style={{ color: themeContext.color.main }}>70점 이상일 경우</MText>{`에 한해\n정식제안으로 오픈됩니다.`}</LText> */}
            </View>

            <View style={{ marginTop: 30 }}>
                <Text style={globalStyle.btext}>{getString('사전 평가 기간')}</Text>
                <Text style={{ marginTop: 13 }}>{`${getCommonPeriodText(proposal?.assessPeriod)}`}</Text>
            </View>

            <LineComponent />

            <Text style={[globalStyle.btext, { marginTop: 12, marginBottom: 15 }]}>{getString('제안요약')}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>Proposal ID</Text>
                <Text style={[globalStyle.ltext, defaultStyle, { marginLeft: 19 }]}>{`${
                    proposal?.proposalId || ''
                }`}</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>{getString('요청비용')}</Text>
                <Text style={[globalStyle.btext, defaultStyle, { color: themeContext.color.primary, marginLeft: 19 }]}>
                    {StringWeiAmountFormat(proposal?.fundingAmount)} BOA
                </Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>{getString('사업내용')}</Text>
                <Text style={[globalStyle.ltext, defaultStyle, { marginLeft: 19, flex: 1 }]}>
                    {proposal?.description}
                </Text>
            </View>
        </View>
    );
}

export default PendingAssess;
