import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useLinkTo } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from 'styled-components/native';
import { Button, Text, Icon } from 'react-native-elements';
import { MaterialIcons, Octicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle, { isLargeScreen } from '~/styles/global';
import { useGetFeedsQuery, useIsValidatorLazyQuery } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { RoundDecimalPoint, WeiAmountToString } from '~/utils/votera/voterautil';

function VoteraDrawer({ navigation }: DrawerContentComponentProps): JSX.Element {
    const insets = useSafeAreaInsets();
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { user, isGuest, metamaskAccount, metamaskBalance } = useContext(AuthContext);
    const [isValidator, setIsValidator] = useState(false);
    const [publicKey, setPublicKey] = useState<string | null>();
    const [balance, setBalance] = useState<string>();
    const [notReadFeedsCount, setNotReadFeedsCount] = useState(0);
    const [isValidatorQuery, { data }] = useIsValidatorLazyQuery({ fetchPolicy: 'cache-and-network' });
    const { width } = useWindowDimensions();
    const linkTo = useLinkTo();

    const { data: feedsConnectionData, refetch } = useGetFeedsQuery({
        skip: !user,
        variables: {
            where: {
                target: user?.address,
                isRead: false,
            },
        },
    });

    useEffect(() => {
        if (feedsConnectionData?.listFeeds) {
            setNotReadFeedsCount(feedsConnectionData.listFeeds.count || 0);
        }
    }, [feedsConnectionData]);

    useEffect(() => {
        if (metamaskAccount) {
            isValidatorQuery({ variables: { address: metamaskAccount } }).catch((err) => {
                console.log('isValidatorQuery response error: ', err);
            });
        } else {
            setIsValidator(false);
            setPublicKey(undefined);
        }
        if (metamaskBalance) {
            setBalance(RoundDecimalPoint(WeiAmountToString(metamaskBalance), 4));
        } else {
            setBalance(undefined);
        }
    }, [metamaskAccount, metamaskBalance, isValidatorQuery]);

    useEffect(() => {
        if (data?.isValidator) {
            setIsValidator(!!data.isValidator.valid);
            setPublicKey(data.isValidator.publicKey);
        }
    }, [data]);

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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ marginRight: 5 }} onPress={() => linkTo('/home')}>
                            <Icon size={28} name="home" color="rgb(91,194,217)" tvParallaxProperties={undefined} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => linkTo('/feed')}>
                            <Icon
                                size={28}
                                name="notifications"
                                color="rgb(91,194,217)"
                                tvParallaxProperties={undefined}
                            />
                            {notReadFeedsCount !== 0 && (
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
                                            left: 15.5,
                                            borderWidth: 1,
                                            borderColor: 'white',
                                        },
                                    ]}
                                >
                                    <Text style={[globalStyle.gbtext, { fontSize: 11, color: 'white' }]}>
                                        {notReadFeedsCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    {!isLargeScreen(width) && (
                        <Button
                            icon={<Icon name="close" color="lightgray" tvParallaxProperties={undefined} />}
                            onPress={() => navigation.closeDrawer()}
                            type="clear"
                        />
                    )}
                </View>

                <View style={{ marginTop: 40 }}>
                    <Text style={{ color: themeContext.color.primary }}>{getString('계정이름')}</Text>
                    {isValidator && (
                        <View style={{ flexDirection: 'row', marginTop: Platform.OS === 'android' ? 0 : 10 }}>
                            <Text
                                style={[
                                    globalStyle.gbtext,
                                    {
                                        fontSize: 20,
                                        lineHeight: 30,
                                        color: themeContext.color.primary,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {user?.username || (isGuest ? 'Guest' : getString('User 없음'))}
                            </Text>
                            <View
                                style={{
                                    width: 48,
                                    height: 28,
                                    marginLeft: 10,
                                    borderRadius: 5,
                                    backgroundColor: themeContext.color.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>
                                    {getString('검증자')}
                                </Text>
                            </View>
                        </View>
                    )}
                    {!isValidator && (
                        <Text
                            style={[
                                globalStyle.gbtext,
                                {
                                    fontSize: 22,
                                    lineHeight: 30,
                                    marginTop: Platform.OS === 'android' ? 0 : 10,
                                    color: themeContext.color.primary,
                                },
                            ]}
                        >
                            {user?.username || (isGuest ? 'Guest' : getString('User 없음'))}
                        </Text>
                    )}
                    {publicKey && (
                        <View style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 5 : 14 }]}>
                            <Octicons name="key" size={18} />
                            <View style={{ flex: 1, marginLeft: 14, flexDirection: 'row' }}>
                                <Text numberOfLines={1}>{publicKey.slice(0, -6)}</Text>
                                <Text>{publicKey.slice(-6)}</Text>
                            </View>
                            <TouchableOpacity
                                style={{ marginLeft: 32, marginRight: 5 }}
                                onPress={() => {
                                    Clipboard.setStringAsync(publicKey).catch(console.log);
                                }}
                            >
                                <MaterialIcons name="content-copy" size={22} color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    {metamaskAccount && (
                        <View style={[globalStyle.flexRowBetween, { marginTop: 14 }]}>
                            <Octicons name="globe" size={18} />
                            <View style={{ flex: 1, marginLeft: 14, flexDirection: 'row' }}>
                                <Text numberOfLines={1}>{metamaskAccount.slice(0, -6)}</Text>
                                <Text>{metamaskAccount.slice(-6)}</Text>
                            </View>
                            <TouchableOpacity
                                style={{ marginLeft: 32, marginRight: 5 }}
                                onPress={() => {
                                    Clipboard.setStringAsync(metamaskAccount).catch(console.log);
                                }}
                            >
                                <MaterialIcons name="content-copy" size={22} color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    {balance && (
                        <View style={{ flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' }}>
                            <Text>{getString('BOA 잔액')}</Text>
                            <Text style={{ marginRight: 10 }}>{balance}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 20 : 40 }]}
                    onPress={() => {
                        if (isGuest) {
                            // Guest 모드일 때 어떻게 ?
                            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                        } else {
                            navigation.navigate('JoinProposalList');
                        }
                    }}
                >
                    <Text style={[globalStyle.btext, { fontSize: 16 }]}>{getString('내가 참여한 제안')}</Text>
                    <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                        <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                    </View>
                </TouchableOpacity>
                <View
                    style={{
                        height: 1,
                        backgroundColor: 'rgb(235,234,239)',
                        marginTop: Platform.OS === 'android' ? 15 : 33,
                    }}
                />

                <View style={{ marginTop: Platform.OS === 'android' ? 28 : 56 }}>
                    <Text style={[globalStyle.btext, { fontSize: 16 }]}>{getString('제안 작성')}</Text>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 5 : 14 }]}
                        onPress={() => {
                            navigation.navigate('CreateProposal', { tempId: Date.now().toString() });
                        }}
                    >
                        <Text>{getString('신규제안 작성')}</Text>
                        <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                            <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 0 : 9 }]}
                        onPress={() => navigation.navigate('TempProposalList')}
                    >
                        <Text>{getString('임시저장 제안')}</Text>
                        <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                            <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 0 : 9 }]}
                        onPress={() => {
                            if (isGuest) {
                                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                            } else {
                                navigation.navigate('MyProposalList');
                            }
                        }}
                    >
                        <Text>{getString('내가 작성한 제안')}</Text>
                        <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                            <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        height: 1,
                        backgroundColor: 'rgb(235,234,239)',
                        marginTop: Platform.OS === 'android' ? 15 : 33,
                        marginBottom: 26,
                    }}
                />

                <TouchableOpacity style={globalStyle.flexRowBetween} onPress={() => linkTo('/settings')}>
                    <Text style={[globalStyle.btext, { fontSize: 16 }]}>{getString('설정')}</Text>
                    <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                        <Icon name="chevron-right" color="darkgray" tvParallaxProperties={undefined} />
                    </View>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
}

export default VoteraDrawer;
