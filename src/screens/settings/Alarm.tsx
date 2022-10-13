import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Switch } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { debounce } from 'lodash';
import { useLinkTo } from '@react-navigation/native';
import { MainScreenProps } from '~/navigation/main/MainParams';
import globalStyle from '~/styles/global';
import { useUpdateAlarmStatusMutation } from '~/graphql/generated/generated';
import { FeedProps } from '~/types/alarmType';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import pushService from '~/services/FcmService';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';

const headerTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={globalStyle.headerTitle}>{getString('알람수신 설정')}</Text>
    </View>
);

function Alarm({ navigation, route }: MainScreenProps<'Alarm'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { isGuest, user } = useContext(AuthContext);
    const [feedStatus, setFeedStatus] = useState<FeedProps>();
    const [updateAlarmMutate] = useUpdateAlarmStatusMutation();
    const linkTo = useLinkTo();

    useEffect(() => {
        setFeedStatus(pushService.getUserAlarmStatus());
    }, []);

    const updateAlarm = useCallback(
        debounce(async () => {
            const alarmStatus = pushService.getUserAlarmStatus();
            const result = await updateAlarmMutate({
                variables: {
                    input: {
                        where: {
                            id: user?.userId || '',
                        },
                        data: {
                            alarmStatus: {
                                myProposalsNews: alarmStatus.isMyProposalsNews,
                                likeProposalsNews: alarmStatus.isLikeProposalsNews,
                                newProposalsNews: alarmStatus.isNewProposalNews,
                                myCommentsNews: alarmStatus.isMyCommentNews,
                                etcNews: alarmStatus.isEtcNews,
                            },
                        },
                    },
                },
            });
            if (!result.data?.updateUserAlarmStatus?.userFeed?.id) {
                dispatch(showSnackBar(getString('사용자 설정 오류로 변경 실패')));
            }
        }, 500),
        [dispatch, updateAlarmMutate, user?.userId],
    );

    useEffect(() => {
        return () => {
            updateAlarm.cancel();
        };
    }, [updateAlarm]);

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
        });
    }, [navigation, headerLeft]);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <ScrollView
                contentContainerStyle={{ paddingVertical: 50 }}
                style={{ paddingHorizontal: 22, paddingTop: 0 }}
            >
                <View style={{ marginTop: 60 }}>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('작성한 제안에 대한 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.disabled }}
                            disabled={isGuest}
                            value={feedStatus?.isMyProposalsNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(
                                    pushService.setUserAlarmStatus({
                                        isMyProposalsNews: value,
                                    }),
                                );
                                updateAlarm()?.catch(console.log);
                            }}
                            thumbColor="white"
                            activeThumbColor="white"
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('관심 제안에 대한 신규 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.disabled }}
                            disabled={isGuest}
                            value={feedStatus?.isLikeProposalsNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(
                                    pushService.setUserAlarmStatus({
                                        isLikeProposalsNews: value,
                                    }),
                                );
                                updateAlarm()?.catch(console.log);
                            }}
                            thumbColor="white"
                            activeThumbColor="white"
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('신규 제안 등록 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.disabled }}
                            disabled={isGuest}
                            value={feedStatus?.isNewProposalNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(
                                    pushService.setUserAlarmStatus({
                                        isNewProposalNews: value,
                                    }),
                                );
                                updateAlarm()?.catch(console.log);
                            }}
                            thumbColor="white"
                            activeThumbColor="white"
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('내 게시글에 대한 반응')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.disabled }}
                            disabled={isGuest}
                            value={feedStatus?.isMyCommentNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(
                                    pushService.setUserAlarmStatus({
                                        isMyCommentNews: value,
                                    }),
                                );
                                updateAlarm()?.catch(console.log);
                            }}
                            thumbColor="white"
                            activeThumbColor="white"
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('기타 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.disabled }}
                            disabled={isGuest}
                            value={feedStatus?.isEtcNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(
                                    pushService.setUserAlarmStatus({
                                        isEtcNews: value,
                                    }),
                                );
                                updateAlarm()?.catch(console.log);
                            }}
                            thumbColor="white"
                            activeThumbColor="white"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default Alarm;
