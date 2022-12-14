import React, { useContext } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { getCommonPeriodText } from '~/utils/time';
import { Proposal } from '~/graphql/generated/generated';

interface Props {
    proposal: Proposal | undefined;
}

function PendingAssess(props: Props): JSX.Element {
    const { proposal } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[globalStyle.btext, { fontSize: 18, lineHeight: 28, color: themeContext.color.primary }]}>
                    {getString('사전 평가 준비')}
                </Text>
                <Text
                    style={[
                        globalStyle.ltext,
                        {
                            textAlign: 'center',
                            fontSize: 13,
                            lineHeight: 23,
                            marginTop: 12,
                            color: themeContext.color.black,
                        },
                    ]}
                >
                    {getString('본 제안을 평가해주세요&#46;\n평가된 평균점수가 ')}
                    <Text style={{ color: themeContext.color.primary }}>{getString('7점 이상일 경우')}</Text>
                    {getString('에 한해\n정식제안으로 오픈됩니다&#46;')}
                </Text>
            </View>

            <View style={{ marginTop: 28 }}>
                <Text style={[globalStyle.btext, { fontSize: 13, lineHeight: 24, color: themeContext.color.black }]}>
                    {getString('평가기간')}
                </Text>
                <Text
                    style={[globalStyle.rtext, { fontSize: 13, lineHeight: 24, color: themeContext.color.textBlack }]}
                >
                    {getCommonPeriodText(proposal?.assessPeriod)}
                </Text>
            </View>
        </View>
    );
}

export default PendingAssess;
