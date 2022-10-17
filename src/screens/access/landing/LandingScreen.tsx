/* eslint-disable import/extensions */
/* eslint-disable global-require */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Image, ActivityIndicator, ImageURISource } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useAssets } from 'expo-asset';
import { useLinkTo } from '@react-navigation/native';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { AccessScreenProps } from '~/navigation/access/AccessParams';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { WhereType } from '~/graphql/hooks/Proposals';

enum EnumIconAsset {
    FullnameLogo = 0,
    ArrowGrad,
}

const iconAssets = [
    require('@assets/images/votera/voteraFullnameLogo.png'),
    require('@assets/icons/arrow/arrowGrad.png'),
];

function LandingScreen({ navigation }: AccessScreenProps<'Landing'>): JSX.Element | null {
    const themeContext = useContext(ThemeContext);
    const {
        user,
        enrolled,
        setGuestMode,
        routeLoaded,
        setRouteLoaded,
        metamaskStatus,
        metamaskConnect,
        metamaskSwitch,
        isGuest,
    } = useContext(AuthContext);
    const [showLanding, setShowLanding] = useState(false);
    const onboarding = useRef<MetaMaskOnboarding>();
    const [assets] = useAssets(iconAssets);
    const linkTo = useLinkTo();

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
        switch (metamaskStatus) {
            case MetamaskStatus.INITIALIZING:
            case MetamaskStatus.UNAVAILABLE:
            case MetamaskStatus.NOT_CONNECTED:
            case MetamaskStatus.CONNECTING:
            case MetamaskStatus.OTHER_CHAIN:
                setShowLanding(true);
                return;
            default:
                break;
        }

        if (enrolled) {
            setShowLanding(false);
            if (!user) {
                navigation.replace('Login');
            }
            return;
        }

        setShowLanding(true);
    }, [metamaskStatus, enrolled, user, navigation]);

    useEffect(() => {
        if (routeLoaded && isGuest) {
            navigation.navigate('RootUser', { screen: 'Home', params: { where: WhereType.PROJECT } });
        }
    }, [routeLoaded, isGuest, navigation]);

    if (!showLanding) return null;
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
                        title={getString('계정만들기')}
                        buttonStyle={globalStyle.metaButton}
                        filled
                        onPress={() => linkTo('/signup')}
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
                            onPress={() => linkTo('/userservice')}
                        />
                        <Button
                            title={getString('개인정보보호정책')}
                            titleStyle={{
                                fontSize: 13,
                                color: themeContext.color.textGray,
                            }}
                            type="clear"
                            onPress={() => linkTo('/privacy')}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

export default LandingScreen;
