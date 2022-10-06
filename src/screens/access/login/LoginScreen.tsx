import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Image, ActivityIndicator, ImageURISource } from 'react-native';
import { Button, Text, CheckBox } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useAssets } from 'expo-asset';
import { AccessScreenProps } from '~/navigation/access/AccessParams';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext, MetamaskStatus, currentKeepSignIn, changeKeepSignIn } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';

enum EnumIconAsset {
    FullnameLogo = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/votera/voteraFullnameLogo.png')];

function LoginScreen({ navigation }: AccessScreenProps<'Login'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { user, enrolled, metamaskStatus, metamaskConnect, metamaskSwitch, login } = useContext(AuthContext);
    const [keepSignIn, setKeepSignIn] = useState(currentKeepSignIn());
    const onboarding = useRef<MetaMaskOnboarding>();
    const [assets] = useAssets(iconAssets);

    useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (metamaskStatus === MetamaskStatus.CONNECTED && !enrolled) {
            if (!user) {
                navigation.replace('Landing');
            }
        }
    }, [metamaskStatus, enrolled, user, navigation]);

    const onClickSignIn = () => {
        if (keepSignIn !== currentKeepSignIn()) {
            changeKeepSignIn(keepSignIn);
        }
        login(keepSignIn)
            .then((result) => {
                if (!result.succeeded) {
                    console.log('login failed message = ', result.message);
                    dispatch(showSnackBar(getString('로그인을 실패했습니다')));
                }
            })
            .catch((err) => {
                console.log('login error = ', err);
                dispatch(showSnackBar(getString('로그인 통신 중 오류 발생')));
            });
    };

    return (
        <View style={{ alignItems: 'center', backgroundColor: 'white', flex: 1 }}>
            {assets && (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image source={assets[EnumIconAsset.FullnameLogo] as ImageURISource} />
                </View>
            )}
            <View>
                {metamaskStatus === MetamaskStatus.INITIALIZING && <ActivityIndicator />}
                {metamaskStatus === MetamaskStatus.UNAVAILABLE && (
                    <CommonButton
                        title={getString('메타마스크 설치하기')}
                        buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 271 }}
                        filled
                        onPress={() => {
                            onboarding.current?.startOnboarding();
                        }}
                        raised
                    />
                )}
                {metamaskStatus === MetamaskStatus.NOT_CONNECTED && (
                    <CommonButton
                        title={getString('메타마스크 연결하기')}
                        buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 271 }}
                        filled
                        onPress={metamaskConnect}
                        raised
                    />
                )}
                {metamaskStatus === MetamaskStatus.CONNECTING && <ActivityIndicator />}
                {metamaskStatus === MetamaskStatus.OTHER_CHAIN && (
                    <CommonButton
                        title={getString('메타마스크 체인 변경')}
                        buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 271 }}
                        filled
                        onPress={metamaskSwitch}
                        raised
                    />
                )}
                {metamaskStatus === MetamaskStatus.CONNECTED && (
                    <>
                        <CommonButton
                            title={getString('로그인')}
                            buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 271 }}
                            filled
                            onPress={onClickSignIn}
                            raised
                        />
                        <CheckBox
                            center
                            title={getString('로그인 상태 유지')}
                            checked={keepSignIn}
                            onPress={() => {
                                setKeepSignIn(!keepSignIn);
                            }}
                        />
                    </>
                )}
                <View style={{ marginBottom: 77, marginTop: 34, alignItems: 'center' }}>
                    <Text style={[globalStyle.gmtext, { fontSize: 11, color: themeContext.color.textGray }]}>
                        (C) 2022 BOSAGORA.
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 12.7 }}>
                        <Button
                            title={getString('이용약관')}
                            titleStyle={{
                                fontSize: 13,
                                color: themeContext.color.textGray,
                            }}
                            type="clear"
                        />
                        <Button
                            title={getString('개인정보보호정책')}
                            titleStyle={{
                                fontSize: 13,
                                color: themeContext.color.textGray,
                            }}
                            type="clear"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

export default LoginScreen;
