/* eslint-disable react-native/no-raw-text */
import React, { useContext } from 'react';
import { View } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface AuthProps {
    address: string;
}

function NodeGuide(props: AuthProps): JSX.Element {
    const { address } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View style={{ flex: 1, paddingTop: 45 }}>
            <Text style={{ lineHeight: 23 }}>
                {getString(
                    `Votera 계정을 만들기 위해서는 최소 1개 이상의 유효한\nBOSAGORA 노드를 보유하고 계셔야 합니다&#46;`,
                )}
            </Text>

            <View style={{ flex: 1, paddingTop: 45, paddingHorizontal: 22 }}>
                <Text style={[globalStyle.btext, { color: 'black' }]}>
                    {getString('갱신 대상 노드')} : {address}
                </Text>
                <Text style={{ lineHeight: 23, marginTop: 63 }}>{getString(`유효한 노드 정보가 없습니다&#46;`)}</Text>
                <Text style={{ lineHeight: 23, marginTop: 13 }}>
                    {`- ${getString('각각의 노드는')}`}
                    <Text style={[globalStyle.btext, { color: themeContext.color.primary }]}>
                        {` 40,000 ${getString('보아')} `}
                    </Text>
                    {getString(
                        `이상 보유하고 있어야 합니다&#46;\n- 이미 인증된 노드라도, 해당 노드가 보유하고 있는 보아가`,
                    )}
                    <Text style={globalStyle.btext}>{` 40,000 ${getString('보아')} `}</Text>
                    {getString(`이하일 경우 재인증하여야 합니다&#46;`)}
                </Text>
            </View>
        </View>
    );
}

export default NodeGuide;
