import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, useWindowDimensions, StyleSheet, Image, ImageURISource } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useLinkTo, StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from 'styled-components/native';
import { Button, Text } from 'react-native-elements';
import { setStringAsync } from 'expo-clipboard';
import { useAssets } from 'expo-asset';
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle, { isLargeScreen } from '~/styles/global';
import { useIsValidatorLazyQuery } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { RoundDecimalPoint, WeiAmountToString } from '~/utils/votera/voterautil';
import { getBlockExplorerUrl } from '~/utils/votera/agoraconf';
import Anchor from '~/components/anchor/Anchor';
import { CopyIcon, ChevronRightIcon, CloseIcon, HomeIcon, NotificationIcon } from '~/components/icons';

const styles = StyleSheet.create({
    anchor: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 14,
    },
    anchorBalance: { fontSize: 14, lineHeight: 18 },
    anchorText: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        fontSize: 14,
        lineHeight: 18,
    },
    boxName: { alignItems: 'center', height: 30, justifyContent: 'center' },
    boxValidator: {
        alignItems: 'center',
        borderRadius: 5,
        height: 30,
        justifyContent: 'center',
        marginLeft: 5,
        width: 55,
    },
    copyIcon: { marginLeft: 32, marginRight: 5 },
    labelName: { fontSize: 13, lineHeight: 18 },
    menuLabel: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
    menuRightIcon: { height: 30, width: 30 },
    name: { fontSize: 20, lineHeight: 24, textAlignVertical: 'center' },
    separator: {
        backgroundColor: 'rgb(235,234,239)',
        height: 1,
        marginVertical: Platform.OS === 'android' ? 15 : 30,
    },
    subLabel: { fontSize: 13, lineHeight: 29 },
    subMenu: { marginTop: Platform.OS === 'android' ? 5 : 10 },
    validator: { fontSize: 14, lineHeight: 18 },
});

enum EnumIconAsset {
    PublicKey = 0,
    Address,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/key.png'), require('@assets/icons/globe.png')];

function VoteraDrawer({ navigation }: DrawerContentComponentProps): JSX.Element {
    const insets = useSafeAreaInsets();
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { user, isGuest, metamaskAccount, metamaskBalance, setGuestMode, signOut, metamaskUpdateBalance, feedCount } =
        useContext(AuthContext);
    const [isValidator, setIsValidator] = useState(false);
    const [publicKey, setPublicKey] = useState<string | null>();
    const [balance, setBalance] = useState<string>();
    const [isValidatorQuery] = useIsValidatorLazyQuery({
        fetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data.isValidator) {
                setIsValidator(!!data.isValidator.valid);
                setPublicKey(data.isValidator.publicKey);
            }
        },
    });
    const { width } = useWindowDimensions();
    const linkTo = useLinkTo();
    const [assets] = useAssets(iconAssets);

    const onClickSignout = () => {
        if (isGuest) {
            setGuestMode(false);
        } else {
            signOut();
        }
    };

    useEffect(() => {
        if (metamaskAccount) {
            isValidatorQuery({ variables: { address: metamaskAccount } }).catch((err) => {
                console.log('isValidatorQuery response error: ', err);
            });
        } else {
            setIsValidator(false);
            setPublicKey(undefined);
        }
        metamaskUpdateBalance();
    }, [metamaskAccount, metamaskUpdateBalance, isValidatorQuery]);

    useEffect(() => {
        if (metamaskBalance) {
            setBalance(RoundDecimalPoint(WeiAmountToString(metamaskBalance), 4, true));
        } else {
            setBalance(undefined);
        }
    }, [metamaskBalance]);

    useEffect(() => {
        console.log('notified feedCount changed');
    }, [feedCount]);

    return (
        <DrawerContentScrollView
            contentContainerStyle={Platform.select({
                web: {
                    flex: 1,
                    paddingTop: insets.top + 25,
                    marginLeft: 20,
                    marginRight: 20,
                },
                default: {
                    flex: 1,
                    paddingTop: insets.top + 25,
                    paddingLeft: 40,
                    paddingRight: 40,
                },
            })}
        >
            <View style={{ flex: 1 }}>
                <View style={globalStyle.flexRowBetween}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ marginRight: 5 }} onPress={() => linkTo('/home')}>
                            <HomeIcon color="rgb(91,194,217)" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                if (isGuest) {
                                    dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                                } else {
                                    navigation.dispatch(StackActions.push('RootUser', { screen: 'Feed' }));
                                }
                            }}
                        >
                            <NotificationIcon color="rgb(91,194,217)" />
                            {feedCount !== 0 && (
                                <View
                                    style={[
                                        globalStyle.center,
                                        {
                                            position: 'absolute',
                                            width: 25.4,
                                            height: 25.4,
                                            borderRadius: 12.7,
                                            backgroundColor: themeContext.color.disagree,
                                            top: -3,
                                            left: 15.7,
                                            borderWidth: 1,
                                            borderColor: 'white',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[globalStyle.gbtext, { fontSize: 10, lineHeight: 12, color: 'white' }]}
                                    >
                                        {feedCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    {!isLargeScreen(width) && (
                        <Button
                            icon={<CloseIcon color="lightgray" />}
                            onPress={() => navigation.closeDrawer()}
                            type="clear"
                        />
                    )}
                </View>

                <View style={{ marginTop: 40 }}>
                    <Text style={[globalStyle.rtext, { color: themeContext.color.primary }, styles.labelName]}>
                        {getString('계정이름')}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: Platform.OS === 'android' ? 0 : 10 }}>
                        <View style={styles.boxName}>
                            <Text
                                style={[globalStyle.gbtext, { color: themeContext.color.primary }, styles.name]}
                                numberOfLines={1}
                            >
                                {user?.username || (isGuest ? 'Guest' : getString('User 없음'))}
                            </Text>
                        </View>
                        {isValidator && !isGuest ? (
                            <View style={[styles.boxValidator, { backgroundColor: themeContext.color.primary }]}>
                                <Text
                                    style={[globalStyle.btext, { color: themeContext.color.white }, styles.validator]}
                                >
                                    {getString('검증자')}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    {!isGuest && (
                        <>
                            {publicKey && assets && (
                                <View
                                    style={[
                                        globalStyle.flexRowBetween,
                                        { marginTop: Platform.OS === 'android' ? 5 : 14 },
                                    ]}
                                >
                                    <Image source={assets[EnumIconAsset.PublicKey] as ImageURISource} />
                                    <Anchor style={styles.anchor} source={getBlockExplorerUrl(metamaskAccount || '')}>
                                        <Text
                                            style={[
                                                globalStyle.rtext,
                                                { color: themeContext.color.textBlack },
                                                styles.anchorText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {publicKey.slice(0, -6)}
                                        </Text>
                                        <Text
                                            style={[
                                                globalStyle.rtext,
                                                { color: themeContext.color.textBlack },
                                                styles.anchorText,
                                            ]}
                                        >
                                            {publicKey.slice(-6)}
                                        </Text>
                                    </Anchor>
                                    <TouchableOpacity
                                        style={styles.copyIcon}
                                        onPress={() => {
                                            setStringAsync(publicKey)
                                                .then(() => {
                                                    dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                                })
                                                .catch(console.log);
                                        }}
                                    >
                                        <CopyIcon color={themeContext.color.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {metamaskAccount && assets && (
                                <View style={[globalStyle.flexRowBetween, { marginTop: 14 }]}>
                                    <Image source={assets[EnumIconAsset.Address] as ImageURISource} />
                                    <Anchor style={styles.anchor} source={getBlockExplorerUrl(metamaskAccount || '')}>
                                        <Text
                                            style={[
                                                globalStyle.rtext,
                                                { color: themeContext.color.textBlack },
                                                styles.anchorText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {metamaskAccount.slice(0, -6)}
                                        </Text>
                                        <Text
                                            style={[
                                                globalStyle.rtext,
                                                { color: themeContext.color.textBlack },
                                                styles.anchorText,
                                            ]}
                                        >
                                            {metamaskAccount.slice(-6)}
                                        </Text>
                                    </Anchor>
                                    <TouchableOpacity
                                        style={styles.copyIcon}
                                        onPress={() => {
                                            setStringAsync(metamaskAccount)
                                                .then(() => {
                                                    dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                                })
                                                .catch(console.log);
                                        }}
                                    >
                                        <CopyIcon color={themeContext.color.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {balance && (
                                <View style={{ flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' }}>
                                    <Text
                                        style={[
                                            globalStyle.rtext,
                                            { color: themeContext.color.textBlack },
                                            styles.anchorBalance,
                                        ]}
                                    >
                                        {getString('BOA 잔액')}
                                    </Text>
                                    <Text
                                        style={[
                                            globalStyle.rtext,
                                            { color: themeContext.color.textBlack },
                                            styles.anchorBalance,
                                            { marginRight: 10 },
                                        ]}
                                    >
                                        {balance}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 20 : 40 }]}
                    onPress={() => {
                        if (isGuest) {
                            // Guest 모드일 때 어떻게 ?
                            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                        } else {
                            navigation.dispatch(StackActions.push('RootUser', { screen: 'JoinProposalList' }));
                            // linkTo('/list-join');
                        }
                    }}
                >
                    <Text style={[globalStyle.btext, styles.menuLabel]}>{getString('내가 참여한 제안')}</Text>
                    <View style={[globalStyle.center, styles.menuRightIcon]}>
                        <ChevronRightIcon color="darkgray" />
                    </View>
                </TouchableOpacity>

                <View style={styles.separator} />

                <View>
                    <Text style={[globalStyle.btext, styles.menuLabel]}>{getString('제안 작성')}</Text>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, styles.subMenu]}
                        onPress={() => {
                            navigation.dispatch(
                                StackActions.push('RootUser', {
                                    screen: 'CreateProposal',
                                    params: { tempId: Date.now().toString() },
                                }),
                            );
                            // linkTo(`/createproposal/${Date.now().toString()}`);
                        }}
                    >
                        <Text style={[globalStyle.rtext, styles.subLabel]}>{getString('신규제안 작성')}</Text>
                        <View style={[globalStyle.center, styles.menuRightIcon]}>
                            <ChevronRightIcon color="darkgray" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, styles.subMenu]}
                        onPress={() => {
                            navigation.dispatch(StackActions.push('RootUser', { screen: 'TempProposalList' }));
                            // linkTo('/list-temp');
                        }}
                    >
                        <Text style={[globalStyle.rtext, styles.subLabel]}>{getString('임시저장 제안')}</Text>
                        <View style={[globalStyle.center, styles.menuRightIcon]}>
                            <ChevronRightIcon color="darkgray" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, styles.subMenu]}
                        onPress={() => {
                            if (isGuest) {
                                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                            } else {
                                navigation.dispatch(StackActions.push('RootUser', { screen: 'MyProposalList' }));
                                // linkTo('/list-mine');
                            }
                        }}
                    >
                        <Text style={[globalStyle.rtext, styles.subLabel]}>{getString('내가 작성한 제안')}</Text>
                        <View style={[globalStyle.center, styles.menuRightIcon]}>
                            <ChevronRightIcon color="darkgray" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                <TouchableOpacity style={globalStyle.flexRowBetween} onPress={() => linkTo('/settings')}>
                    <Text style={[globalStyle.btext, styles.menuLabel]}>{getString('설정')}</Text>
                    <View style={[globalStyle.center, styles.menuRightIcon]}>
                        <ChevronRightIcon color="darkgray" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.subMenu} onPress={onClickSignout}>
                    <Text style={[globalStyle.btext, styles.menuLabel]}>
                        {isGuest ? getString('둘러보기 종료') : getString('로그아웃')}
                    </Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
}

export default VoteraDrawer;
