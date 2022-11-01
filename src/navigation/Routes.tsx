import React, { useCallback, useContext, useState } from 'react';
import { View, useWindowDimensions, Text } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { hideAsync as splashHideAsync } from 'expo-splash-screen';
import {
    createURL as linkingCreateURL,
    getInitialURL as linkingGetInitialURL,
    addEventListener as linkingAddEventListener,
} from 'expo-linking';

import Loading from '~/screens/loading';
import MainDrawer from './main/MainNavigator';
import AccessStackScreens from './access/AccessNavigator';
import CommonStackScreens from './common/CommonNavigator';
import { AuthContext } from '~/contexts/AuthContext';
import LoadingAniScreen from '~/components/shared/LoadingModal/index';
import SnackBar from '~/components/shared/snackbar';
import BottomSheetComponent from '~/components/shared/BottomSheet';
import { MAX_WIDTH } from '~/styles/global';
import { RootStackParams } from './types/RootStackParams';
import useVoteraFonts from '~/styles/VoteraFonts';

enum ScreenType {
    AuthScreens,
    UserScreens,
    GuestScreens,
}

const prefix = linkingCreateURL('/');

const linking: LinkingOptions<RootStackParams> = {
    prefixes: [prefix],
    config: {
        screens: {
            RootUser: {
                screens: {
                    Home: 'home',
                    Feed: 'feed',
                    Search: 'search',
                    ProposalDetail: 'detail/:id',
                    TempProposalList: 'list-temp',
                    MyProposalList: 'list-mine',
                    JoinProposalList: 'list-join',
                    Notice: 'notice/:id',
                    CreateNotice: 'createnotice/:id',
                    Settings: 'settings',
                    AccountInfo: 'accountinfo',
                    Alarm: 'alarm',
                    CreateProposal: 'createproposal/:tempId',
                    ProposalPayment: 'payment/:id',
                    ProposalPreview: 'preview',
                    Calendar: 'calendar',
                },
            },
            RootAuth: {
                screens: {
                    Landing: 'landing',
                    Signup: 'signup',
                    Login: 'login',
                },
            },
            Common: {
                screens: {
                    Privacy: 'privacy',
                    UserService: 'userservice',
                },
            },
        },
    },
    async getInitialURL() {
        const url = await linkingGetInitialURL();
        console.log('Routes.initialUrl = ', url);
        return url;
    },
    subscribe(listener) {
        const linkingSubscription = linkingAddEventListener('url', ({ url }) => {
            console.log('eventListener url=', url);
            listener(url);
        });
        return () => {
            linkingSubscription.remove();
        };
    },
};

const RootStack = createStackNavigator();

function getNavigationKey(screenType: ScreenType): string {
    switch (screenType) {
        case ScreenType.UserScreens:
            return 'users';
        case ScreenType.AuthScreens:
            return 'auths';
        default:
            return 'guests';
    }
}

function Routes(): JSX.Element {
    const { user, isGuest, setRouteLoaded } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [screenType, setScreenType] = useState(ScreenType.AuthScreens);
    const { width } = useWindowDimensions();
    const [fontLoaded, error] = useVoteraFonts();

    const selectStyle = () => {
        return width > MAX_WIDTH
            ? { flex: 1, left: (width - MAX_WIDTH) / 2, width: MAX_WIDTH }
            : { flex: 1, width: '100%' };
    };

    const onLayoutRootView = useCallback(() => {
        if (!isLoading) {
            splashHideAsync().catch((err) => {
                console.log('AplashScreen.hideAsync returns error', err);
            });
        }
    }, [isLoading]);

    React.useEffect(() => {
        setRouteLoaded(true);

        if (user) {
            setScreenType(ScreenType.UserScreens);
        } else if (isGuest) {
            setScreenType(ScreenType.GuestScreens);
        } else {
            setScreenType(ScreenType.AuthScreens);
        }
    }, [user, isGuest, setRouteLoaded]);

    if (isLoading || !fontLoaded) return <Loading onComplete={() => setIsLoading(false)} />;
    return (
        <>
            <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                <View style={selectStyle()} onLayout={onLayoutRootView}>
                    <RootStack.Navigator screenOptions={{ headerShown: false }}>
                        {screenType === ScreenType.UserScreens && (
                            <RootStack.Screen name="RootUser" component={MainDrawer} />
                        )}
                        {screenType === ScreenType.GuestScreens && (
                            <>
                                <RootStack.Screen name="RootUser" component={MainDrawer} />
                                <RootStack.Screen name="RootAuth" component={AccessStackScreens} />
                            </>
                        )}
                        {screenType === ScreenType.AuthScreens && (
                            <RootStack.Screen name="RootAuth" component={AccessStackScreens} />
                        )}
                        <RootStack.Screen
                            name="Common"
                            navigationKey={getNavigationKey(screenType)}
                            component={CommonStackScreens}
                        />
                    </RootStack.Navigator>
                </View>
            </NavigationContainer>
            <LoadingAniScreen />
            <BottomSheetComponent />
            <SnackBar />
        </>
    );
}

export default Routes;
