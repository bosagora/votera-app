import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, Platform } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useIsFocused, useLinkTo } from '@react-navigation/native';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import pushService from '~/services/FcmService';
import { MainScreenProps } from '~/navigation/main/MainParams';
import { useUpdatePushTokenMutation } from '~/graphql/generated/generated';
import { getAppUpdate, getCurrentVersion } from '~/utils/device';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import { PushStatusType } from '~/types/pushType';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        marginBottom: 15,
    },
    sectionSeparator: {
        backgroundColor: 'rgb(235,234,239)',
        height: 1,
        marginVertical: 30,
    },
});

const headerTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={globalStyle.headerTitle}>{getString('설정')}</Text>
    </View>
);

function Settings({ navigation, route }: MainScreenProps<'Settings'>): JSX.Element {
    const dispatch = useAppDispatch();
    const { isGuest, user } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const isFocused = useIsFocused();
    const [usePush, setUsePush] = useState<boolean>(!isGuest);
    const [disablePush, setDisablePush] = useState<boolean>(isGuest);
    const linkTo = useLinkTo();

    const [updatePushToken] = useUpdatePushTokenMutation();

    const toggleUsePush = async (isPush: boolean) => {
        const localData = await pushService.getCurrentPushLocalStorage();
        if (!localData?.id) {
            return;
        }

        await pushService.updatePushTokenOnLocalStorage(localData.id, localData.token, isPush);

        const result = await updatePushToken({
            variables: {
                input: {
                    where: {
                        id: user?.userId || '',
                    },
                    data: {
                        pushId: localData.id,
                        isActive: isPush,
                    },
                },
            },
        });
        if (!result.data?.updateUserPushToken?.userFeed) {
            // update failed, restore to original
            await pushService.updatePushTokenOnLocalStorage(localData.id, localData.token, localData.enablePush);
            setUsePush(localData.enablePush);
            dispatch(showSnackBar(getString('사용자 설정 오류로 변경 실패')));
        }
    };

    useEffect(() => {
        if (isFocused && !isGuest) {
            pushService
                .getCurrentPushLocalStorage()
                .then((localData) => {
                    if (!localData || localData.tokenStatus === PushStatusType.DISABLED) {
                        setUsePush(false);
                        setDisablePush(true);
                        return;
                    }

                    setUsePush(!!localData.enablePush);
                })
                .catch((err) => {
                    console.log('getCurrentPushLocalStorage error : ', err);
                });
        }
    }, [isFocused, isGuest]);

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        linkTo('/home');
                    }
                }}
                icon={<Icon name="chevron-left" tvParallaxProperties={undefined} />}
                type="clear"
            />
        );
    }, [navigation, linkTo]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle,
            headerLeft,
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation, headerLeft]);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <ScrollView
                contentContainerStyle={{ paddingVertical: 50 }}
                style={{ paddingHorizontal: 22, paddingTop: 0 }}
            >
                <View>
                    <Text style={{ fontSize: 13, color: themeContext.color.textBlack }}>{getAppUpdate()}</Text>
                    <Text
                        style={[
                            globalStyle.gbtext,
                            {
                                fontSize: 14,
                                marginTop: 8.5,
                                color: themeContext.color.primary,
                            },
                        ]}
                    >
                        Ver {getCurrentVersion()}
                    </Text>
                </View>
                <View style={{ marginTop: 60 }}>
                    <Text style={[globalStyle.btext, styles.sectionLabel]}>{getString('알림')}</Text>
                    {Platform.OS !== 'web' && (
                        <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                            <Text style={{ fontSize: 13 }}>{getString('푸시 알림 받기')}</Text>
                            <Switch
                                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                                trackColor={{ true: themeContext.color.primary, false: themeContext.color.disabled }}
                                disabled={disablePush}
                                value={usePush}
                                onValueChange={(isPush) => {
                                    setUsePush(isPush);
                                    toggleUsePush(isPush).catch((err) => {
                                        console.log('toggleUsePush error : ', err);
                                    });
                                }}
                                thumbColor="white"
                                activeThumbColor="white"
                            />
                        </View>
                    )}
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { height: 40 }]}
                        onPress={() => linkTo('/alarm')}
                    >
                        <Text style={{ fontSize: 13 }}>{getString('알림 수신 설정')}</Text>
                        <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionSeparator} />

                <View>
                    <Text style={[globalStyle.btext, styles.sectionLabel]}>{getString('계정 설정')}</Text>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { height: 40 }]}
                        onPress={() => linkTo('/accountinfo')}
                    >
                        <Text style={{ fontSize: 13 }}>{getString('계정이름 변경하기')}</Text>
                        <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionSeparator} />

                <Text style={[globalStyle.btext, styles.sectionLabel]}>{getString('기타')}</Text>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { height: 40 }]}
                    onPress={() => linkTo('/userservice')}
                >
                    <Text style={{ fontSize: 13 }}>{getString('이용약관')}</Text>
                    <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { height: 40 }]}
                    onPress={() => linkTo('/privacy')}
                >
                    <Text style={{ fontSize: 13 }}>{getString('개인정보보호정책')}</Text>
                    <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

export default Settings;
