/* eslint-disable import/extensions */
/* eslint-disable global-require */
import React, { useCallback, useLayoutEffect, useContext, useState, useEffect } from 'react';
import {
    BackHandler,
    ActivityIndicator,
    Image,
    ImageURISource,
    useWindowDimensions,
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Button, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, DrawerActions, useLinkTo } from '@react-navigation/native';
import { useAssets } from 'expo-asset';
import { TabView, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { MainScreenProps } from '~/navigation/main/MainParams';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { hideSnackBar } from '~/state/features/snackBar';
import globalStyle, { isLargeScreen } from '~/styles/global';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import HomeView from './HomeView';
import { WhereType } from '~/graphql/hooks/Proposals';

enum EnumIconAsset {
    VoteraLogo = 0,
    Drawer,
    Search,
}

const iconAssets = [
    require('@assets/images/votera/voteraLogo.png'),
    require('@assets/icons/header/drawerIcon.png'),
    require('@assets/icons/header/searchIcon.png'),
];

const keys = [
    { key: 'project', title: getString('프로젝트') },
    { key: 'open', title: getString('오픈예정') },
];

function findIndex(key: string) {
    return keys.findIndex((value) => value.key === key);
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    searchButton: {
        marginLeft: 6,
    },
    tabButton: {
        alignItems: 'center',
        borderBottomWidth: 2,
        height: 40,
        justifyContent: 'center',
        width: '50%',
    },
    tabWrapper: {
        alignItems: 'center',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'row',
        height: 42,
        justifyContent: 'center',
        paddingHorizontal: 22,
    },
});

function HomeScreen({ navigation, route }: MainScreenProps<'Home'>): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [assets] = useAssets(iconAssets);
    const { width } = useWindowDimensions();
    const { metamaskStatus, metamaskConnect } = useContext(AuthContext);
    const linkTo = useLinkTo();
    const [index, setIndex] = useState(0);
    const [routes] = useState(keys);

    const headerTitle = useCallback(() => {
        if (!assets) return null;
        return <Image source={assets[EnumIconAsset.VoteraLogo] as ImageURISource} />;
    }, [assets]);

    const headerLeft = useCallback(() => {
        if (!assets || isLargeScreen(width)) return null;
        return (
            <Button
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                icon={<Image source={assets[EnumIconAsset.Drawer] as ImageURISource} />}
                type="clear"
            />
        );
    }, [assets, width, navigation]);

    const headerRight = useCallback(() => {
        if (!assets) return null;
        return (
            <View style={{ flexDirection: 'row' }}>
                {metamaskStatus === MetamaskStatus.NOT_CONNECTED && (
                    <Button
                        containerStyle={[globalStyle.metaButton, { backgroundColor: themeContext.color.primary }]}
                        title="CONNECT"
                        titleStyle={globalStyle.metaTitle}
                        onPress={() => {
                            metamaskConnect();
                        }}
                    />
                )}
                {metamaskStatus === MetamaskStatus.CONNECTING && <ActivityIndicator />}
                {(metamaskStatus === MetamaskStatus.CONNECTED || metamaskStatus === MetamaskStatus.OTHER_CHAIN) && (
                    <View style={[globalStyle.metaButton, { borderColor: themeContext.color.primary }]}>
                        <Text style={{ color: themeContext.color.primary }}>CONNECTED</Text>
                    </View>
                )}
                <Button
                    style={styles.searchButton}
                    onPress={() => linkTo('/search')}
                    icon={<Image source={assets[EnumIconAsset.Search] as ImageURISource} />}
                    type="clear"
                />
            </View>
        );
    }, [assets, linkTo, metamaskConnect, metamaskStatus, themeContext.color.primary]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle,
            headerLeft,
            headerRight,
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0, borderBottomWidth: 0 },
            headerShown: true,
        });
    }, [headerLeft, headerRight, headerTitle, navigation]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (route.name === getString('프로젝트') || route.name === getString('오픈예정')) {
                    dispatch(hideSnackBar());
                    BackHandler.exitApp();
                    return true;
                }
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [dispatch, route.name]),
    );

    const renderTabBar = useCallback(
        (props: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> }) => {
            return (
                <View style={styles.tabWrapper}>
                    {props.navigationState.routes.map((tabRoute: { key: string; title: string }, i: number) => {
                        const isFocused = props.navigationState.index === i;
                        const onPress = () => {
                            if (!isFocused) {
                                setIndex(findIndex(tabRoute.key));
                            }
                        };
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.tabButton,
                                    { borderBottomColor: isFocused ? 'rgb(112,58,222)' : 'transparent' },
                                ]}
                                onPress={onPress}
                                key={`tab_${tabRoute.key}`}
                            >
                                <Text
                                    style={[
                                        globalStyle.btext,
                                        { fontSize: 13, color: isFocused ? 'rgb(112,58,222)' : '#000000' },
                                    ]}
                                >
                                    {tabRoute.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        },
        [],
    );

    const renderScene = useCallback((props: SceneRendererProps & { route: { key: string; title: string } }) => {
        switch (props.route.key) {
            case 'project':
                return <HomeView where={WhereType.PROJECT} />;
            case 'open':
                return <HomeView where={WhereType.OPEN} />;
            default:
                return null;
        }
    }, []);

    useEffect(() => {
        switch (route.params?.where) {
            case WhereType.PROJECT:
                setIndex(findIndex('project'));
                break;
            case WhereType.OPEN:
                setIndex(findIndex('open'));
                break;
            default:
                setIndex(0);
                break;
        }
    }, [route.params?.where]);

    return (
        <SafeAreaView style={styles.container}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <TabView
                swipeEnabled
                sceneContainerStyle={{ paddingHorizontal: 22 }}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
            />
        </SafeAreaView>
    );
}

export default HomeScreen;
