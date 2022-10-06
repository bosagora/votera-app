import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Keyboard, BackHandler } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { ThemeContext } from 'styled-components/native';
import { useIsValidatorLazyQuery } from '~/graphql/generated/generated';
import { AccessScreenProps } from '~/navigation/access/AccessParams';
import { AuthContext, currentLocale, MetamaskStatus, User } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import pushService from '~/services/FcmService';
import { hideLoadingAniModal, showLoadingAniModal } from '~/state/features/loadingAniModal';
import Terms from './Terms';
import NodeGuide from './NodeGuide';
import NameScreen from './Name';
import CompleteScreen from './Complete';

const keys = [
    { key: 'terms', title: getString('약관동의') },
    { key: 'name', title: getString('계정이름') },
    { key: 'complete', title: getString('가입완료') },
    { key: 'guide', title: getString('노드확인안내') },
];

const findIndex = (key: string) => {
    return keys.findIndex((value) => value.key === key);
};

function SignupScreen({ navigation }: AccessScreenProps<'Signup'>): JSX.Element {
    const dispatch = useAppDispatch();
    const themeContext = useContext(ThemeContext);
    const [index, setIndex] = useState(0);
    const [routes] = useState(keys);
    const { metamaskStatus, metamaskAccount, enrolled, enroll, setEnrolledUser } = useContext(AuthContext);
    const [stepComplete, setStepComplete] = useState(false);
    const [accountName, setAccountName] = useState('');
    const [newUser, setNewUser] = useState<User>();
    const [isValidatorQuery] = useIsValidatorLazyQuery({ fetchPolicy: 'cache-and-network' });

    useEffect(() => {
        switch (metamaskStatus) {
            // case MetamaskStatus.INITIALIZING:
            // case MetamaskStatus.CONNECTING:
            case MetamaskStatus.UNAVAILABLE:
            case MetamaskStatus.NOT_CONNECTED:
            case MetamaskStatus.OTHER_CHAIN:
                navigation.navigate('Landing');
                return;
            default:
                if (enrolled) {
                    navigation.navigate('Landing');
                }
                break;
        }
    }, [metamaskStatus, enrolled, navigation]);

    const enrollAccount = useCallback(
        async (username: string) => {
            try {
                const result = await enroll(username);
                if (result.succeeded) {
                    setNewUser(result.user);
                    return true;
                }
                console.log('enroll failed message : ', result.message);
                dispatch(showSnackBar(getString('사용자 생성 실패')));
            } catch (err) {
                console.log('enroll failed: ', err);
                dispatch(showSnackBar(getString('사용자 생성 중 오류 발생')));
            }
            return false;
        },
        [dispatch, enroll],
    );

    const headerRight = useCallback(() => {
        if (index === 0 || index === 2 || index === 3) {
            return null;
        }

        return (
            <Button
                disabled={!stepComplete}
                onPress={() => {
                    Keyboard.dismiss();
                    enrollAccount(accountName)
                        .then((result) => {
                            if (result) {
                                setIndex(index + 1);
                            }
                        })
                        .catch(console.log);
                }}
                title={getString('다음')}
                titleStyle={[globalStyle.rtext, { fontSize: 17, color: themeContext.color.primary }]}
                buttonStyle={{ padding: 0 }}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                type="clear"
            />
        );
    }, [accountName, enrollAccount, index, stepComplete, themeContext.color.primary]);

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (index === 0 || index === findIndex('guide')) {
                        navigation.pop();
                    } else {
                        setIndex(index - 1);
                    }
                }}
                icon={<Icon name="chevron-left" tvParallaxProperties={undefined} />}
                type="clear"
            />
        );
    }, [index, navigation]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: getString('계정만들기'),
            headerLeft,
            headerRight,
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation, headerLeft, headerRight]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (index === 0 || index === findIndex('guide')) {
                navigation.pop();
            } else {
                setIndex(index - 1);
            }
            return true;
        });
        return () => backHandler.remove();
    }, [navigation, index]);

    useEffect(() => {
        setStepComplete(false);
    }, [index]);

    const checkValidator = useCallback(
        async (address: string) => {
            try {
                const response = await isValidatorQuery({
                    variables: { address },
                });
                if (response.data?.isValidator) {
                    if (response.data.isValidator?.valid) {
                        setIndex(findIndex('name'));
                    } else {
                        setIndex(findIndex('guide'));
                    }
                    return;
                }
                if (response.error) {
                    console.log('isValidatorQuery response.error: ', response.error);
                }
                dispatch(showSnackBar(getString('노드 확인 중 오류가 발생했습니다')));
            } catch (err) {
                console.log('isValidatorQuery error: ', err);
                dispatch(showSnackBar(getString('노드 확인 중 오류가 발생했습니다')));
            }
        },
        [dispatch, isValidatorQuery],
    );

    const onCompleteTerm = useCallback(
        (account: string) => {
            checkValidator(account).catch(console.log);
        },
        [checkValidator],
    );

    const onChangeName = useCallback((name: string, incomplete?: boolean) => {
        setAccountName(name);
        if (incomplete) {
            setStepComplete(false);
        } else {
            setStepComplete(name.length > 0);
        }
    }, []);

    const completeSignup = useCallback(() => {
        if (!newUser) {
            dispatch(showSnackBar(getString('계정 생성 중 오류가 발생했습니다')));
            return;
        }

        dispatch(showLoadingAniModal());
        try {
            setEnrolledUser(newUser);
            dispatch(hideLoadingAniModal());
        } catch (err) {
            dispatch(hideLoadingAniModal());
        }
    }, [dispatch, newUser, setEnrolledUser]);

    const renderTabBar = useCallback(
        (props: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> }) => {
            return (
                <View style={{ height: 30, flexDirection: 'row', paddingHorizontal: 20 }}>
                    {props.navigationState.routes.map((route: { key: string; title: string }, i: number) => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        const isActive = props.navigationState.index === i;
                        return (
                            <View
                                key={`singupTab_${route.key}`}
                                style={[
                                    globalStyle.center,
                                    {
                                        flex: 1,
                                        borderBottomWidth: isActive ? 2 : 0,
                                        borderBottomColor: themeContext.color.primary,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: isActive ? themeContext.color.primary : themeContext.color.disabled,
                                        fontFamily: isActive ? 'NotoSansCJKkrBold' : 'NotoSansCJKkrLight',
                                        fontWeight: isActive ? 'bold' : '300',
                                    }}
                                >
                                    {route.title}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            );
        },
        [themeContext.color.disabled, themeContext.color.primary],
    );

    const renderScene = useCallback(
        (props: SceneRendererProps & { route: { key: string; title: string } }) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            switch (props.route.key) {
                case 'terms':
                    return (
                        <Terms
                            onComplete={() => {
                                onCompleteTerm(metamaskAccount || '');
                            }}
                        />
                    );
                case 'name':
                    return <NameScreen onChangeName={onChangeName} />;
                case 'complete':
                    return <CompleteScreen onComplete={completeSignup} />;
                case 'guide':
                    return <NodeGuide address={metamaskAccount || ''} />;
                default:
                    return null;
            }
        },
        [completeSignup, metamaskAccount, onChangeName, onCompleteTerm],
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <TabView
                swipeEnabled={false}
                sceneContainerStyle={{ paddingHorizontal: 22 }}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
            />
        </SafeAreaView>
    );
}

export default SignupScreen;
