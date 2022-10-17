/* eslint-disable import/extensions */
/* eslint-disable global-require */
import React, { useContext, useRef, useEffect } from 'react';
import { View, Image, ActivityIndicator, ImageURISource } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useAssets } from 'expo-asset';
import { AccessScreenProps } from '~/navigation/access/AccessParams';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { WhereType } from '~/graphql/hooks/Proposals';

enum EnumIconAsset {
    FullnameLogo = 0,
    ArrowGrad,
}

const iconAssets = [
    require('@assets/images/votera/voteraFullnameLogo.png'),
    require('@assets/icons/arrow/arrowGrad.png'),
];

function LoginScreen({ navigation }: AccessScreenProps<'Login'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const {
        user,
        enrolled,
        metamaskStatus,
        metamaskConnect,
        metamaskSwitch,
        login,
        setRouteLoaded,
        routeLoaded,
        setGuestMode,
        isGuest,
    } = useContext(AuthContext);
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

    useEffect(() => {
        if (isGuest && routeLoaded) {
            navigation.navigate('RootUser', { screen: 'Home', params: { where: WhereType.PROJECT } });
        }
    }, [isGuest, navigation, routeLoaded]);

    const onClickSignIn = () => {
        login(false)
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
                        buttonStyle={globalStyle.metaButton}
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
                        buttonStyle={globalStyle.metaButton}
                        filled
                        onPress={metamaskConnect}
                        raised
                    />
                )}
                {metamaskStatus === MetamaskStatus.CONNECTING && <ActivityIndicator />}
                {metamaskStatus === MetamaskStatus.OTHER_CHAIN && (
                    <CommonButton
                        title={getString('메타마스크 체인 변경')}
                        buttonStyle={globalStyle.metaButton}
                        filled
                        onPress={metamaskSwitch}
                        raised
                    />
                )}
                {metamaskStatus === MetamaskStatus.CONNECTED && (
                    <CommonButton
                        title={getString('로그인')}
                        buttonStyle={globalStyle.metaButton}
                        filled
                        onPress={onClickSignIn}
                        raised
                    />
                )}
                <Button
                    title={getString('둘러보기')}
                    titleStyle={[globalStyle.mtext, { marginRight: 16, fontSize: 14 }]}
                    icon={assets ? <Image source={assets[EnumIconAsset.ArrowGrad] as ImageURISource} /> : undefined}
                    iconRight
                    buttonStyle={{ justifyContent: 'flex-end', paddingHorizontal: 21, marginTop: 10 }}
                    iconContainerStyle={{ paddingLeft: 16 }}
                    type="clear"
                    onPress={() => {
                        setRouteLoaded(false);
                        setGuestMode(true);
                    }}
                />
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
