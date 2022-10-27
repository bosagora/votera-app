import React, { useContext } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import CommonButton from '~/components/button/CommonButton';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface CompleteProps {
    onComplete: () => void;
}

function CompleteScreen(props: CompleteProps): JSX.Element {
    const { onComplete } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 30 }}>
            <View style={{ flex: 1.5 }}>
                <Text
                    style={[
                        globalStyle.btext,
                        { fontSize: 17, color: themeContext.color.primary, textAlign: 'center' },
                    ]}
                >
                    {getString(`노드 인증 및 계정 생성이\n모두 완료되었습니다!`)}
                </Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <CommonButton
                    title={getString('VOTERA 시작하기')}
                    buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 209 }}
                    filled
                    onPress={onComplete}
                    raised
                />
            </View>
        </View>
    );
}

export default CompleteScreen;
