import { isDevice } from 'expo-device';
import LocalStorage, { LocalStoragePushProps } from '~/utils/LocalStorage';
import { PushStatusType, PushRequestStatus } from '~/types/pushType';
import { FeedProps } from '~/types/alarmType';

const PushServiceLocation = 'PushServiceProp';

function isValidPlatform(): boolean {
    if (!isDevice) {
        console.log('Must use physical device for Push Notifications');
        return false;
    }
    // return true;
    return false;
}

async function getLocalPushStorage(): Promise<LocalStoragePushProps | undefined> {
    const localData = await LocalStorage.getByKey<LocalStoragePushProps>(PushServiceLocation);
    return localData;
}

async function updateLocalPushStorage(updatedLocalStorage: LocalStoragePushProps): Promise<LocalStoragePushProps> {
    try {
        await LocalStorage.setByKey(PushServiceLocation, updatedLocalStorage);
    } catch (e) {
        console.log(e);
    }
    return updatedLocalStorage;
}

/**
 * 토큰을 얻습니다.
 * @returns
 */
async function getToken(): Promise<string> {
    // return await messaging().getToken();
    return Promise.resolve('');
}

/**
 * 토큰의 권한을 가져옵니다.
 * @returns
 */
async function getPushTokenPermission(): Promise<boolean> {
    // const authStatus = await messaging().hasPermission();
    // return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return Promise.resolve(false);
}

/**
 * 권한을 요청합니다
 */
async function requestPushTokenPermission(): Promise<boolean> {
    // const authStatus = await messaging().requestPermission();
    // return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return Promise.resolve(false);
}

async function getTokenStatus(fcmToken?: string): Promise<PushStatusType> {
    const pushLocalData = await getLocalPushStorage();
    if (!pushLocalData || !pushLocalData.id) {
        return PushStatusType.NEW_TOKEN;
    }
    if ((fcmToken && pushLocalData.token !== fcmToken) || pushLocalData.tokenStatus === PushStatusType.RENEW_TOKEN) {
        return PushStatusType.RENEW_TOKEN;
    }
    return PushStatusType.USING_TOKEN;
}

let userAlarmStatus: FeedProps = {};

const pushService = {
    registerAppWithFCM: async (): Promise<void> => {
        // if (!messaging().isDeviceRegisteredForRemoteMessages) {
        //     await messaging().registerDeviceForRemoteMessages();
        // }
        return Promise.resolve();
    },

    getPushNotificationTokenOnDevice: async (): Promise<PushRequestStatus | null> => {
        if (!isValidPlatform()) {
            return null;
        }

        const hasPermission = await requestPushTokenPermission();
        if (!hasPermission) {
            return null;
        }

        const token = await getToken();
        const tokenStatus = await getTokenStatus(token);
        return { token, tokenStatus };
    },

    updatePushTokenOnLocalStorage: async (pushId: string, pushToken: string, pushIsActive?: boolean | null) => {
        const enablePush = !!pushIsActive;
        let localData = await getLocalPushStorage();
        if (!localData) {
            localData = {
                id: pushId,
                token: pushToken,
                enablePush,
                tokenStatus: PushStatusType.USING_TOKEN,
            };
        } else {
            localData.id = pushId;
            localData.token = pushToken;
            localData.enablePush = enablePush;
            localData.tokenStatus = PushStatusType.USING_TOKEN;
        }
        return updateLocalPushStorage(localData);
    },

    updateRefreshTokenOnLocalStorage: async (pushToken: string) => {
        let localData = await getLocalPushStorage();
        if (!localData) {
            localData = { token: pushToken, enablePush: true, tokenStatus: PushStatusType.RENEW_TOKEN };
        } else {
            localData.token = pushToken;
            localData.tokenStatus = PushStatusType.RENEW_TOKEN;
        }
        return updateLocalPushStorage(localData);
    },

    checkPushTokenChangeOnLocalStorage: async (): Promise<boolean> => {
        if (!isValidPlatform()) {
            return false;
        }

        const localData = await getLocalPushStorage();

        const hasPermission = await requestPushTokenPermission();
        if (!hasPermission) {
            if (!localData || localData.tokenStatus === PushStatusType.DISABLED) {
                return false;
            }
            return true;
        }

        if (!localData || !localData.id) {
            return true; // NEW_TOKEN
        }
        if (localData.tokenStatus !== PushStatusType.USING_TOKEN) {
            return true;
        }

        return false;
    },

    disablePushTokenOnLocalStorage: async () => {
        const localData = await getLocalPushStorage();
        if (localData) {
            localData.tokenStatus = PushStatusType.DISABLED;
            await updateLocalPushStorage(localData);
        }
    },

    activatePushTokenOnLocalStorage: async (activate: boolean) => {
        const localData = await getLocalPushStorage();
        if (localData) {
            localData.enablePush = activate;
            await updateLocalPushStorage(localData);
        }
    },

    getCurrentPushLocalStorage: async () => {
        const pushData = await getLocalPushStorage();
        return pushData;
    },
    useGetPushPermission: async () => {
        const pushPermission = await getPushTokenPermission();
        return pushPermission;
    },

    setUserAlarmStatus: (alarmStatus: FeedProps) => {
        if (alarmStatus) {
            userAlarmStatus = { ...userAlarmStatus, ...alarmStatus };
        }
        return { ...userAlarmStatus };
    },
    getUserAlarmStatus: () => {
        return { ...userAlarmStatus };
    },
};

export default pushService;
