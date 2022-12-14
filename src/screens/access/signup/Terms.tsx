import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, CheckBox } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import CommonButton from '~/components/button/CommonButton';
import getString from '~/utils/locales/STRINGS';
import globalStyle from '~/styles/global';
import { CheckIcon } from '~/components/icons';
import { AccessNavigationProps } from '~/navigation/access/AccessParams';

interface TermsProps {
    onComplete: () => void;
}

function Terms(props: TermsProps): JSX.Element {
    const { color } = useContext(ThemeContext);
    const { onComplete } = props;
    const [congressTerm, setCongressTerm] = useState(false);
    const [privacyTerm, setPrivacyTerm] = useState(false);
    const [allCheck, setAllCheck] = useState(false);
    const navigation = useNavigation<AccessNavigationProps<'Signup'>>();

    useEffect(() => {
        setAllCheck(congressTerm && privacyTerm);
    }, [congressTerm, privacyTerm]);

    const checkboxIcon = (isActive: boolean) => (
        <View
            style={{
                width: 34,
                height: 35,
                borderWidth: 2,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? color.primary : color.white,
                borderColor: isActive ? color.primary : color.boxBorder,
            }}
        >
            <CheckIcon size={18} color={isActive ? color.white : color.boxBorder} />
        </View>
    );

    return (
        <View style={{ flex: 1, paddingBottom: 97, marginTop: 22 }}>
            <View style={{ flex: 1 }}>
                <Text style={{ lineHeight: 23 }}>
                    {getString('아래의 약관과 개인정보처리방침을\n확인해 보시고 동의해주세요')}
                </Text>

                <View style={[globalStyle.flexRowBetween, { marginTop: 32 }]}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <CheckBox
                            containerStyle={{ padding: 0, marginLeft: 0 }}
                            onPress={() => setCongressTerm(!congressTerm)}
                            checked={congressTerm}
                            checkedIcon={checkboxIcon(true)}
                            uncheckedIcon={checkboxIcon(false)}
                        />
                        <Text style={{ fontSize: 13, letterSpacing: -1 }}>{getString(`"BOSAGORA" 약관`)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.push('Common', { screen: 'UserService' })}>
                        <Text style={{ color: color.primary }}>{getString('내용보기')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[globalStyle.flexRowBetween, { marginTop: 10 }]}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <CheckBox
                            containerStyle={{ padding: 0, marginLeft: 0 }}
                            onPress={() => setPrivacyTerm(!privacyTerm)}
                            checked={privacyTerm}
                            checkedIcon={checkboxIcon(true)}
                            uncheckedIcon={checkboxIcon(false)}
                        />
                        <Text style={{ fontSize: 13, letterSpacing: -1 }}>
                            {getString(`"BOSAGORA" 개인정보처리방침`)}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.push('Common', { screen: 'Privacy' })}>
                        <Text style={{ color: color.primary }}>{getString('내용보기')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ alignItems: 'center' }}>
                <CommonButton
                    title={getString('동의하고 인증하기')}
                    containerStyle={{ borderRadius: 25 }}
                    buttonStyle={{
                        justifyContent: 'space-between',
                        paddingHorizontal: 21,
                        width: 209,
                    }}
                    filled
                    disabled={!allCheck}
                    disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                    disabledTitleStyle={{ color: 'white' }}
                    onPress={onComplete}
                    raised={allCheck}
                />
            </View>
        </View>
    );
}

export default Terms;
