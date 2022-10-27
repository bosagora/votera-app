import AsyncStorage from '@react-native-async-storage/async-storage';

const SS_PREFIX = 'ss.';

function getSessionKey(key: string): string {
    return `${SS_PREFIX}${key}`;
}

async function setSessionByKey<T>(key: string, data: T): Promise<void> {
    const ssKey = getSessionKey(key);
    await AsyncStorage.setItem(ssKey, JSON.stringify(data));
}

async function getSessionByKey<T>(key: string): Promise<T | undefined> {
    const ssKey = getSessionKey(key);
    const localData = await AsyncStorage.getItem(ssKey);
    if (localData !== null) {
        return JSON.parse(localData) as T;
    }
    return undefined;
}

async function resetSessionByKey(key: string): Promise<void> {
    const ssKey = getSessionKey(key);
    await AsyncStorage.removeItem(ssKey);
}

async function clearSession(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const foundKeys = keys.filter((key) => key.startsWith(SS_PREFIX));
    if (foundKeys.length > 0) {
        await AsyncStorage.multiRemove(foundKeys);
    }
}

function initializeSession() {
    let done = false;
    return () => {
        if (!done) {
            done = true;
            clearSession().catch(console.log);
        }
    };
}

initializeSession();

export default {
    setSessionByKey,
    getSessionByKey,
    resetSessionByKey,
    clearSession,
};
