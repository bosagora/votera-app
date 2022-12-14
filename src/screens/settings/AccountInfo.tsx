import React, { useCallback, useContext, useState, useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { debounce } from 'lodash';
import globalStyle from '~/styles/global';
import NowNode from '~/components/input/SingleLineInput2';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { showLoadingAniModal, hideLoadingAniModal } from '~/state/features/loadingAniModal';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import { useCheckUsernameLazyQuery } from '~/graphql/generated/generated';
import { ChevronLeftIcon } from '~/components/icons';

const DEBOUNCER_TIME = 300;

const headerTitle = () => <Text style={globalStyle.headerTitle}>{getString('계정이름 변경')}</Text>;

function AccountInfo({ navigation, route }: MainScreenProps<'AccountInfo'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { user, changeVoterName, isGuest } = useContext(AuthContext);
    const [newName, setNewName] = useState<string>(user?.username || (isGuest ? 'Guest' : getString('User 없음')));
    const [nameError, setNameError] = useState(false);
    const [isEqual, setIsEqual] = useState(true);
    const [width, setWidth] = useState(0);

    const [checkUsername, { loading }] = useCheckUsernameLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (!data.checkDupUserName) {
                setNameError(true);
            } else if (data.checkDupUserName.duplicated) {
                setNameError(true);
            } else {
                setNameError(false);
            }
        },
        onError: (err) => {
            setNameError(true);
        },
    });

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.pop();
                    } else {
                        navigation.dispatch(replaceToHome());
                    }
                }}
                icon={<ChevronLeftIcon color="black" />}
                type="clear"
            />
        );
    }, [navigation]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            title: getString('계정이름 변경'),
            headerTitle,
            headerLeft,
        });
    }, [navigation, headerLeft]);

    const changeNodeName = useCallback(
        async (username: string) => {
            if (isGuest) {
                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                return;
            }
            if (!user?.memberId) {
                dispatch(showSnackBar(getString('사용자 설정 오류로 변경 실패')));
                return;
            }

            dispatch(showLoadingAniModal());
            try {
                await changeVoterName(username);
                setIsEqual(true);
                dispatch(hideLoadingAniModal());
                dispatch(showSnackBar(getString('계정이름이 변경되었습니다')));
            } catch (err) {
                console.log('changeVoterName error : ', err);
                dispatch(hideLoadingAniModal());
                dispatch(showSnackBar(getString('이름 변경 중 오류 발생')));
            }
        },
        [changeVoterName, dispatch, isGuest, user?.memberId],
    );

    const debounceNameCheck = useMemo(
        () =>
            debounce((username: string) => {
                if (username.length > 0 && username !== user?.username) {
                    checkUsername({
                        variables: {
                            username,
                        },
                    }).catch(console.log);
                }
            }, DEBOUNCER_TIME),
        [checkUsername, user?.username],
    );

    useEffect(() => {
        return () => {
            debounceNameCheck.cancel();
        };
    }, [debounceNameCheck]);

    return (
        <View
            style={{ flex: 1, backgroundColor: themeContext.color.white }}
            onLayout={(event) => {
                setWidth(event.nativeEvent.layout.width);
            }}
        >
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <ScrollView
                contentContainerStyle={{ paddingVertical: 50 }}
                style={{ paddingHorizontal: 22, paddingTop: 0 }}
            >
                <View style={{ marginTop: 60 }}>
                    <Text style={[globalStyle.btext, { marginBottom: 15, color: 'black' }]}>
                        {getString('현재 로그인한 계정')}
                    </Text>
                    <NowNode
                        onChangeText={(text) => {
                            setNewName(text);
                            setNameError(false);
                            if (text === user?.username) {
                                setIsEqual(true);
                            } else {
                                setIsEqual(false);
                                debounceNameCheck(text);
                            }
                        }}
                        inputStyle={[globalStyle.gbtext, { width: width - 150 }]}
                        searchValue={newName}
                        value={newName}
                        koreanInput
                        textDisable={isGuest}
                        subComponent={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Button
                                    disabled={isEqual || isGuest}
                                    title={getString('이름변경')}
                                    titleStyle={[
                                        globalStyle.btext,
                                        {
                                            fontSize: 14,
                                            color: themeContext.color.primary,
                                        },
                                    ]}
                                    type="clear"
                                    onPress={() => {
                                        changeNodeName(newName).catch(console.log);
                                    }}
                                />
                            </View>
                        }
                        placeholderText=""
                    />
                </View>
                {nameError && (
                    <Text
                        style={{ color: themeContext.color.error, textAlign: 'center', lineHeight: 23, marginTop: 20 }}
                    >
                        {getString('중복된 아이디입니다&#46; 다른 아이디를 입력해주십시오&#46;')}
                    </Text>
                )}
                {loading && <ActivityIndicator size="large" />}

                <View style={{ height: 1, backgroundColor: themeContext.color.divider, marginVertical: 30 }} />
            </ScrollView>
        </View>
    );
}

export default AccountInfo;
