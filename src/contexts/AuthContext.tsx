/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useMetaMask } from 'metamask-react';
import { BigNumber, ethers } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { isApolloError } from '@apollo/client';
import moment from 'moment';
import { getLocale, setLocale } from '@utils/locales/STRINGS';
import { AUTHCONTEXT_CONFIG, SESSION_USER_KEY } from '@config/keys';
import { serverChainID } from '@config/ServerConfig';
import {
    useIsMemberLazyQuery,
    useGetSignInDomainLazyQuery,
    useGetSignUpDomainLazyQuery,
    useSignInMemberMutation,
    useSignUpMemberMutation,
    useUpdateMemberMutation,
    SignTypeDomain,
    useMeLazyQuery,
} from '~/graphql/generated/generated';
import LocalStorage, { LocalStorageProps } from '~/utils/LocalStorage';
import SessionStorage from '~/utils/SessionStorage';
import client, { setToken, resetToken } from '~/graphql/client';
import pushService from '~/services/FcmService';

export enum MetamaskStatus {
    INITIALIZING,
    UNAVAILABLE,
    NOT_CONNECTED,
    CONNECTING,
    OTHER_CHAIN,
    CONNECTED,
}

export type User = {
    userId: string; // current user id
    memberId: string; // current memberId
    username: string; // name of node
    address: string; // validator address
    token?: string; // JWT Token
};

export type EnrolledAccount = {
    address: string;
};

export const AUTH_RESULT = {
    DEVICE_UNCONNECTED: 'Device.error.unconnected',
    DEVICE_UNREGISTERED: 'Device.error.unregistered',
    AUTH_CANCEL_INPUT: 'Auth.error.cancel',
    AUTH_MISSING_INPUT: 'Auth.error.missing',
    AUTH_INVALID: 'Auth.error.invalid',
    AUTH_BLOCKED: 'Auth.error.blocked',
    AUTH_UNAUTHORIZED: 'Auth.unauthorized',
    AUTH_FORBIDDEN: 'Auth.forbidden',
    SYSTEM_CONNECT: 'System.error.connection',
    SYSTEM_TIMEDOUT: 'System.error.timedout',
    SYSTEM_OTHER: 'System.error.other',
    SYSTEM_READY: 'System.error.ready',
};
type AUTH_RESULT = typeof AUTH_RESULT[keyof typeof AUTH_RESULT];

const signUpType: Record<string, Array<TypedDataField>> = {
    SignType: [
        { name: 'myWallet', type: 'address' },
        { name: 'userName', type: 'string' },
        { name: 'signTime', type: 'string' },
    ],
};

const signInType: Record<string, Array<TypedDataField>> = {
    SignType: [
        { name: 'myWallet', type: 'address' },
        { name: 'signTime', type: 'string' },
    ],
};

type LoginResultType = {
    succeeded: boolean;
    user?: User;
    token?: string;
    message?: string;
    messageId?: AUTH_RESULT;
};

type AuthContextState = {
    user?: User;
    login: (keepSession: boolean) => Promise<LoginResultType>;
    signOut: () => void;
    routeLoaded: boolean;
    setRouteLoaded: (loaded: boolean) => void;
    feedCount: number;
    refetchFeedCount: () => void;
    loaded: boolean;
    isGuest: boolean;
    setGuestMode: (flag: boolean) => void;
    enrolled: boolean;
    enroll: (username: string) => Promise<LoginResultType>;
    setEnrolledUser: (user: User) => void;
    resetEnroll: () => Promise<void>;
    changeVoterName: (username: string) => Promise<void>;
    isBookmarked: (id: string) => boolean;
    toggleBookmark: (id: string) => boolean;
    metamaskStatus: MetamaskStatus;
    metamaskAccount: string | null;
    metamaskBalance: BigNumber | null;
    metamaskChainId: string | null;
    metamaskProvider: ethers.providers.Web3Provider | null;
    metamaskConnect: () => void;
    metamaskSwitch: () => void;
    metamaskUpdateBalance: (tx?: string) => void;
};

type UserConfigType = {
    locale?: string;
    keepSignIn?: boolean;
};

export const AuthContext = React.createContext<AuthContextState>(null);

type AuthProviderProps = {
    children: React.ReactNode;
};

let userConfig: UserConfigType;

function normalizeUserCookie(storage?: UserConfigType): UserConfigType {
    if (!storage) {
        return {};
    }
    return storage;
}

let localStorage: LocalStorageProps = {
    user: {},
    members: [],
    bookmarks: [],
};

function normalizeLocalStorage(storage: LocalStorageProps): LocalStorageProps {
    if (!storage) {
        return {
            user: {},
            members: [],
            bookmarks: [],
        };
    }
    if (storage.user && storage.members && storage.bookmarks) {
        return storage;
    }
    return {
        user: storage.user || {},
        members: storage.members || [],
        bookmarks: storage.bookmarks || [],
    };
}

function getValidUserFromLocalStorage(): User | null {
    const { user } = localStorage;
    if (!user.userId || !user.memberId || !user.address) {
        return null;
    }
    return {
        userId: user.userId,
        memberId: user.memberId,
        username: user.username || '',
        address: user.address,
        token: user.token,
    };
}

async function setUserToLocalStorage(user: User) {
    const { user: localUser } = localStorage;
    localUser.userId = user.userId;
    localUser.memberId = user.memberId;
    localUser.username = user.username;
    localUser.address = user.address;
    localUser.token = user.token;
    await LocalStorage.set(localStorage);
}

async function resetUserOfLocalStorage() {
    const { user } = localStorage;
    delete user.userId;
    delete user.memberId;
    delete user.username;
    delete user.address;
    delete user.token;
    await LocalStorage.set(localStorage);
}

async function getValidUserFromSessionStorage(): Promise<User | null> {
    const user = await SessionStorage.getSessionByKey<User>(SESSION_USER_KEY);
    if (!user || !user.token) {
        return null;
    }
    return user;
}

async function setUserToSessionStorage(user: User) {
    await SessionStorage.setSessionByKey(SESSION_USER_KEY, user);
}

async function resetUserOfSessionStorage() {
    await SessionStorage.resetSessionByKey(SESSION_USER_KEY);
}

function addEnrolledMember(address: string) {
    if (localStorage.members) {
        if (localStorage.members.find((m) => m.address === address)) {
            return false;
        }
        localStorage.members.push({ address });
    } else {
        localStorage.members = [{ address }];
    }
    return true;
}

const setBookmarked = new Set<string>();

function updateBookmark() {
    for (let i = 0; i < localStorage.bookmarks.length; i += 1) {
        setBookmarked.add(localStorage.bookmarks[i]);
    }
}

function isBookmarked(id: string): boolean {
    return setBookmarked.has(id);
}

function toggleBookmark(id: string): boolean {
    let toggleResult = false;
    if (setBookmarked.has(id)) {
        const index = localStorage.bookmarks.findIndex((b) => b === id);
        if (index !== -1) {
            localStorage.bookmarks.splice(index, 1);
        }
        setBookmarked.delete(id);
    } else {
        localStorage.bookmarks.push(id);
        setBookmarked.add(id);
        toggleResult = true;
    }
    LocalStorage.set(localStorage).catch(console.log);
    return toggleResult;
}

function getTypedDataDomain(domain: SignTypeDomain): TypedDataDomain {
    return {
        name: domain.name || undefined,
        version: domain.version || undefined,
        chainId: domain.chainId || undefined,
        verifyingContract: domain.verifyingContract || undefined,
    };
}

function getErrorAuthResult(err: Error): AUTH_RESULT {
    if (isApolloError(err)) {
        const apolloError = err;
        if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
            // error from graphql app of strapi server
            const { extensions } = apolloError.graphQLErrors[0];
            if (!extensions?.exception) {
                return AUTH_RESULT.SYSTEM_OTHER;
            }
            const { data, output, reason } = extensions.exception;

            if (output) {
                // reject by policy (eg Authroization)
                switch (output.statusCode) {
                    case 401: // unauthorized
                        return AUTH_RESULT.AUTH_UNAUTHORIZED;
                    case 403: // forbidden
                        return AUTH_RESULT.AUTH_FORBIDDEN;
                    default:
                        return AUTH_RESULT.SYSTEM_OTHER;
                }
            } else if (data) {
                // error related with Auth
                const messageId = data.data[0].messages[0].id;
                switch (messageId) {
                    case 'Auth.form.error.email.provide':
                    case 'Auth.form.error.password.provide':
                        return AUTH_RESULT.AUTH_MISSING_INPUT;
                    case 'Auth.form.error.invalid': // when identifier or password is wrong
                        return AUTH_RESULT.AUTH_INVALID;
                    case 'Auth.form.error.blocked': // when user is blocked by admin
                        return AUTH_RESULT.AUTH_BLOCKED;
                    default:
                        return AUTH_RESULT.SYSTEM_OTHER;
                }
            } else if (reason) {
                // connect ECONNREFUSED, connection timed out (to mongoDB)
                return AUTH_RESULT.SYSTEM_OTHER;
            }
        } else if (apolloError.networkError) {
            // error from local graphql connector or remote graphql layer of strapi
            const { name } = apolloError.networkError;
            if (name === 'FetchError') {
                const fetchError = apolloError.networkError;
                if (fetchError.type === 'system') {
                    switch (fetchError.code) {
                        case 'ECONNREFUSED':
                        case 'ECONNRESET':
                            return AUTH_RESULT.SYSTEM_CONNECT;
                        case 'ETIMEDOUT':
                            return AUTH_RESULT.SYSTEM_TIMEDOUT;
                        default:
                            return AUTH_RESULT.SYSTEM_OTHER;
                    }
                } else {
                    return AUTH_RESULT.SYSTEM_OTHER;
                }
            } else {
                return AUTH_RESULT.SYSTEM_OTHER;
            }
        }
    }

    return AUTH_RESULT.SYSTEM_OTHER;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [userState, setUserState] = useState<User>();
    const [routeLoaded, setRouteLoaded] = useState(false);
    const [feedCount, setFeedCount] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [isGuest, setGuestMode] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { status, connect, switchChain, account, chainId, ethereum } = useMetaMask();
    const [metamaskStatus, setMetamaskStatus] = useState(MetamaskStatus.INITIALIZING);
    const [metamaskAccount, setMetamaskAccount] = useState<string | null>(null);
    const [metamaskBalance, setMetamaskBalance] = useState<BigNumber | null>(null);
    const [metamaskChainId, setMetamaskChainId] = useState<string | null>(null);
    const [metamaskProvider, setMetamaskProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [isMemberQuery] = useIsMemberLazyQuery({ fetchPolicy: 'cache-and-network' });
    const [getMe] = useMeLazyQuery({ fetchPolicy: 'network-only' });
    const [getSignInDomainQuery] = useGetSignInDomainLazyQuery({ fetchPolicy: 'cache-and-network' });
    const [signInMemberMutation] = useSignInMemberMutation();
    const [getSignUpDomainQuery] = useGetSignUpDomainLazyQuery({ fetchPolicy: 'cache-and-network' });
    const [signUpMemberMutation] = useSignUpMemberMutation();
    const [updateMemberMutate] = useUpdateMemberMutation();

    useEffect(() => {
        const initializeAuthContext = async () => {
            userConfig = normalizeUserCookie(await LocalStorage.getByKey<UserConfigType>(AUTHCONTEXT_CONFIG));
            if (userConfig.locale) {
                localStorage.user.locale = userConfig.locale;
            }
            if (localStorage.user.locale) {
                setLocale(localStorage.user.locale);
            }

            localStorage = normalizeLocalStorage(await LocalStorage.get());
            updateBookmark();

            let storageUser = await getValidUserFromSessionStorage();
            if (!storageUser) {
                if (localStorage.user.token && userConfig.keepSignIn) {
                    storageUser = getValidUserFromLocalStorage();
                }
            }

            if (storageUser && storageUser.token) {
                try {
                    const response = await getMe({ context: { token: storageUser.token } });
                    if (response.data?.meEx) {
                        const { member } = response.data.meEx;
                        if (member?.id === storageUser.memberId && member?.address === storageUser.address) {
                            setToken(storageUser.token);
                            setUserState(storageUser);

                            const userFeed = response.data.meEx.user_feed;
                            pushService.setUserAlarmStatus({
                                isMyProposalsNews: userFeed?.myProposalsNews,
                                isNewProposalNews: userFeed?.newProposalsNews,
                                isLikeProposalsNews: userFeed?.likeProposalsNews,
                                isMyCommentNews: userFeed?.myCommentsNews,
                                isEtcNews: userFeed?.etcNews,
                            });
                        } else {
                            resetUserOfLocalStorage();
                        }
                    } else if (response.error) {
                        console.log('response error = ', response.error);
                        if (getErrorAuthResult(response.error) === AUTH_RESULT.AUTH_UNAUTHORIZED) {
                            resetUserOfLocalStorage();
                        }
                    }
                } catch (err) {
                    console.log('check user failed', err);
                }
            }

            setLoaded(true);
        };
        initializeAuthContext().catch(console.error);
    }, [getMe]);

    useEffect(() => {
        switch (status) {
            case 'initializing':
                setMetamaskStatus(MetamaskStatus.INITIALIZING);
                break;
            case 'unavailable':
                setMetamaskStatus(MetamaskStatus.UNAVAILABLE);
                break;
            case 'notConnected':
                setMetamaskStatus(MetamaskStatus.NOT_CONNECTED);
                break;
            case 'connecting':
                setMetamaskStatus(MetamaskStatus.CONNECTING);
                break;
            case 'connected':
            default:
                if (chainId !== serverChainID) {
                    setMetamaskStatus(MetamaskStatus.OTHER_CHAIN);
                } else {
                    setMetamaskStatus(MetamaskStatus.CONNECTED);
                    if (userState?.address === account) {
                        setEnrolled(true);
                    } else if (localStorage.members.find((m) => m.address === account)) {
                        setEnrolled(true);
                        setUserState(undefined);
                    } else {
                        if (userState) {
                            setUserState(undefined);
                        }
                        isMemberQuery({ variables: { address: account } })
                            .then((response) => {
                                setEnrolled(!!response.data?.isMember);
                            })
                            .catch(console.error);
                    }
                }
                break;
        }
        setMetamaskAccount(account);
        setMetamaskChainId(chainId);
    }, [status, account, chainId, userState, isMemberQuery]);

    const metamaskUpdateBalance = useCallback(
        (tx?: string) => {
            if (metamaskAccount && metamaskProvider) {
                if (tx) {
                    metamaskProvider
                        .waitForTransaction(tx, 1)
                        .then((value) => {
                            return metamaskProvider.getBalance(metamaskAccount);
                        })
                        .then((value) => {
                            setMetamaskBalance(value);
                        })
                        .catch(console.log);
                } else {
                    metamaskProvider
                        .getBalance(metamaskAccount)
                        .then((value) => {
                            setMetamaskBalance(value);
                        })
                        .catch(console.log);
                }
            } else {
                setMetamaskBalance(null);
            }
        },
        [metamaskAccount, metamaskProvider],
    );

    useEffect(() => {
        metamaskUpdateBalance();
    }, [metamaskUpdateBalance]);

    const login = useCallback(
        async (keepSession: boolean): Promise<LoginResultType> => {
            if (status !== 'connected') {
                return {
                    succeeded: false,
                    message: 'not connected metamask',
                    messageId: AUTH_RESULT.DEVICE_UNCONNECTED,
                };
            }
            if (!enrolled) {
                return {
                    succeeded: false,
                    message: 'not enrolled device',
                    messageId: AUTH_RESULT.DEVICE_UNREGISTERED,
                };
            }
            try {
                const signInResponse = await getSignInDomainQuery();
                if (!signInResponse.data?.getSignInDomain) {
                    return {
                        succeeded: false,
                        message: 'server response error',
                        messageId: AUTH_RESULT.SYSTEM_OTHER,
                    };
                }
                const domain = getTypedDataDomain(signInResponse.data.getSignInDomain);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const web3provider = new ethers.providers.Web3Provider(ethereum);
                const signTime = moment().format('YYYY-MM-DD HH:mm:ss ZZ');
                const signValue = {
                    myWallet: account,
                    signTime,
                };
                // eslint-disable-next-line no-underscore-dangle
                const result = await web3provider.getSigner()._signTypedData(domain, signInType, signValue);
                if (!result) {
                    return {
                        succeeded: false,
                        message: 'canceled input',
                        messageId: AUTH_RESULT.AUTH_CANCEL_INPUT,
                    };
                }

                const response = await signInMemberMutation({
                    variables: { input: { data: { address: account, signTime, signature: result } } },
                });
                if (response.data?.signInMember) {
                    const { user, jwt } = response.data.signInMember;
                    if (!jwt) {
                        return {
                            succeeded: false,
                            message: 'invalid input',
                            messageId: AUTH_RESULT.AUTH_INVALID,
                        };
                    }
                    if (!user || !user.member) {
                        return {
                            succeeded: false,
                            message: 'Server data error',
                            messageId: AUTH_RESULT.SYSTEM_OTHER,
                        };
                    }

                    const loginUser: User = {
                        userId: user.id,
                        memberId: user.member.id,
                        username: user.member.username,
                        address: user.member.address,
                        token: jwt,
                    };

                    setToken(jwt);
                    setUserState(loginUser);

                    const userFeed = user.user_feed;
                    pushService.setUserAlarmStatus({
                        isMyProposalsNews: userFeed?.myProposalsNews,
                        isNewProposalNews: userFeed?.newProposalsNews,
                        isLikeProposalsNews: userFeed?.likeProposalsNews,
                        isMyCommentNews: userFeed?.myCommentsNews,
                        isEtcNews: userFeed?.etcNews,
                    });

                    const updated = addEnrolledMember(loginUser.address);

                    await setUserToSessionStorage(loginUser);

                    if (keepSession) {
                        await setUserToLocalStorage(loginUser);
                    } else if (updated) {
                        await LocalStorage.set(localStorage);
                    }

                    return {
                        succeeded: true,
                        user: loginUser,
                    };
                }

                return {
                    succeeded: false,
                    message: 'server response error',
                    messageId: AUTH_RESULT.SYSTEM_OTHER,
                };
            } catch (err) {
                console.log('login exception: ', err);
                return Promise.resolve({
                    succeeded: false,
                    message: 'internal error',
                    messageId: err instanceof Error ? getErrorAuthResult(err) : AUTH_RESULT.SYSTEM_OTHER,
                });
            }
        },
        [status, enrolled, getSignInDomainQuery, ethereum, account, signInMemberMutation],
    );

    const signOut = useCallback(async () => {
        setUserState(undefined);
        setFeedCount(0);
        resetToken();

        await resetUserOfSessionStorage();
        await resetUserOfLocalStorage();
        await client.clearStore();
    }, []);

    const enroll = useCallback(
        async (username: string): Promise<LoginResultType> => {
            if (status !== 'connected') {
                return {
                    succeeded: false,
                    message: 'not connected metamask',
                    messageId: AUTH_RESULT.DEVICE_UNCONNECTED,
                };
            }
            if (enrolled) {
                return {
                    succeeded: false,
                    message: 'alreay enrolled',
                    messageId: AUTH_RESULT.SYSTEM_OTHER,
                };
            }
            try {
                const signUpResponse = await getSignUpDomainQuery();
                if (!signUpResponse.data?.getSignUpDomain) {
                    return {
                        succeeded: false,
                        message: 'server response error',
                        messageId: AUTH_RESULT.SYSTEM_OTHER,
                    };
                }
                const domain = getTypedDataDomain(signUpResponse.data.getSignUpDomain);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const web3provider = new ethers.providers.Web3Provider(ethereum);
                const signTime = moment().format('YYYY-MM-DD HH:mm:ss ZZ');
                const signValue = {
                    myWallet: account,
                    userName: username,
                    signTime,
                };
                // eslint-disable-next-line no-underscore-dangle
                const result = await web3provider.getSigner()._signTypedData(domain, signUpType, signValue);
                if (!result) {
                    return {
                        succeeded: false,
                        message: 'canceled input',
                        messageId: AUTH_RESULT.AUTH_CANCEL_INPUT,
                    };
                }

                const response = await signUpMemberMutation({
                    variables: {
                        input: {
                            data: { address: account, signTime, username, signature: result },
                        },
                    },
                });
                if (response.data?.signUpMember) {
                    const { user, jwt } = response.data.signUpMember;
                    if (!jwt) {
                        return {
                            succeeded: false,
                            message: 'invalid input',
                            messageId: AUTH_RESULT.AUTH_INVALID,
                        };
                    }
                    if (!user || !user.member) {
                        return {
                            succeeded: false,
                            message: 'Server data error',
                            messageId: AUTH_RESULT.SYSTEM_OTHER,
                        };
                    }

                    const loginUser: User = {
                        userId: user.id,
                        memberId: user.member.id,
                        username: user.member.username,
                        address: user.member.address,
                        token: jwt,
                    };

                    const userFeed = user.user_feed;
                    pushService.setUserAlarmStatus({
                        isMyProposalsNews: userFeed?.myProposalsNews,
                        isNewProposalNews: userFeed?.newProposalsNews,
                        isLikeProposalsNews: userFeed?.likeProposalsNews,
                        isMyCommentNews: userFeed?.myCommentsNews,
                        isEtcNews: userFeed?.etcNews,
                    });

                    const updated = addEnrolledMember(loginUser.address);
                    if (updated) {
                        await LocalStorage.set(localStorage);
                    }

                    return {
                        succeeded: true,
                        user: loginUser,
                    };
                }

                return {
                    succeeded: false,
                    message: 'server response error',
                    messageId: AUTH_RESULT.SYSTEM_OTHER,
                };
            } catch (err) {
                console.log('enroll exception: ', err);
                if (err.code && err.message) {
                    if (err.code === 4001) {
                        return {
                            succeeded: false,
                            message: err.message,
                            messageId: AUTH_RESULT.AUTH_CANCEL_INPUT,
                        };
                    }
                }
                return Promise.resolve({
                    succeeded: false,
                    message: err.message || 'internal error',
                    messageId: err instanceof Error ? getErrorAuthResult(err) : AUTH_RESULT.SYSTEM_OTHER,
                });
            }
        },
        [account, enrolled, ethereum, getSignUpDomainQuery, signUpMemberMutation, status],
    );

    useEffect(() => {
        if (ethereum) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setMetamaskProvider(new ethers.providers.Web3Provider(ethereum));
        } else {
            setMetamaskProvider(null);
        }
    }, [ethereum]);

    const setEnrolledUser = useCallback((user: User) => {
        if (!user.token) {
            throw new Error('Missing token');
        }
        if (!localStorage.members.find((m) => m.address === user.address)) {
            throw new Error('Not on user list');
        }

        setToken(user.token);
        setUserState(user);
        setEnrolled(true);

        setUserToLocalStorage(user).catch((err) => {
            console.log('saveLocalStorage error: ', err);
        });
    }, []);

    const resetEnroll = useCallback(async () => {
        localStorage.user = {};
        localStorage.members = [];
        await LocalStorage.set(localStorage);

        setUserState(undefined);
        setEnrolled(false);
        setFeedCount(0);
        resetToken();

        await client.clearStore();
    }, []);

    const refetchFeedCount = useCallback(() => {
        console.log('refetchFeedCount: not yet implemented');
    }, []);

    const changeVoterName = useCallback(
        async (username: string) => {
            if (!userState?.memberId) {
                throw new Error('not login');
            }

            const updateResult = await updateMemberMutate({
                variables: {
                    input: {
                        where: {
                            id: userState.memberId,
                        },
                        data: {
                            username,
                        },
                    },
                },
            });

            if (!updateResult?.data?.updateMember?.member) {
                throw new Error('Fail to update node name');
            }

            const newUser = { ...userState };
            newUser.username = username;
            setUserState(newUser);
            await setUserToLocalStorage(newUser);
        },
        [updateMemberMutate, userState],
    );

    const metamaskConnect = useCallback(() => {
        connect().catch((err) => {
            console.log('metamask.connect error: ', err);
        });
    }, [connect]);

    const metamaskSwitch = useCallback(() => {
        if (!serverChainID) {
            throw new Error('not defined chainID');
        }

        switchChain(serverChainID).catch((err) => {
            console.log('metamask.switchChain error: ', err);
        });
    }, [switchChain]);

    const context = useMemo(
        () => ({
            user: userState,
            login,
            signOut,
            routeLoaded,
            setRouteLoaded,
            feedCount,
            refetchFeedCount,
            loaded,
            isGuest,
            setGuestMode,
            enrolled,
            enroll,
            setEnrolledUser,
            resetEnroll,
            changeVoterName,
            isBookmarked,
            toggleBookmark,
            metamaskStatus,
            metamaskAccount,
            metamaskBalance,
            metamaskChainId,
            metamaskProvider,
            metamaskConnect,
            metamaskSwitch,
            metamaskUpdateBalance,
        }),
        [
            changeVoterName,
            enroll,
            enrolled,
            feedCount,
            isGuest,
            loaded,
            login,
            metamaskAccount,
            metamaskBalance,
            metamaskChainId,
            metamaskConnect,
            metamaskProvider,
            metamaskStatus,
            metamaskSwitch,
            metamaskUpdateBalance,
            refetchFeedCount,
            resetEnroll,
            routeLoaded,
            setEnrolledUser,
            signOut,
            userState,
        ],
    );

    return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}

export const currentLocale = (): string => {
    return localStorage.user.locale || getLocale();
};

export const changeLocale = (locale: string): void => {
    setLocale(locale);
    // locale 설정 변경건으로는 백업하지 않음
    localStorage.user.locale = locale;
    userConfig.locale = locale;
    LocalStorage.setByKey(AUTHCONTEXT_CONFIG, userConfig).catch((err) => {
        console.log('LocalStorage setByKey error : ', err);
    });
};

export const currentKeepSignIn = (): boolean => {
    return !!userConfig?.keepSignIn;
};

export const changeKeepSignIn = (keepSignIn: boolean): void => {
    userConfig.keepSignIn = keepSignIn;
    LocalStorage.setByKey(AUTHCONTEXT_CONFIG, userConfig).catch((err) => {
        console.log('LocalStorage setByKey error : ', err);
    });
};
