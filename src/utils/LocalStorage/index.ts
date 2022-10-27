import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Random from 'expo-random';
import { encryptLocalData, decryptLocalData, generateKey } from '@utils/crypto';
import { LOCALSTORAGE_KEY, LOCALSTORAGE_SERVICE, LOCAL_TEMP_PROPOSALS } from '@config/keys';
import { LocalStorageProps, LocalStorageProposalProps } from './LocalStorageTypes';

export * from './LocalStorageTypes';

let localStorageKey: Buffer | undefined;

async function getLocalStorageKey(): Promise<Buffer> {
    if (!localStorageKey) {
        const options: SecureStore.SecureStoreOptions = {
            keychainService: LOCALSTORAGE_SERVICE,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        };
        try {
            console.log('call getLocalStorageKey');
            let value = await SecureStore.getItemAsync(LOCALSTORAGE_KEY, options);
            if (!value || value === '') {
                console.log('detect no LocalStorageKey, initailize');
                await SecureStore.setItemAsync(LOCALSTORAGE_KEY, generateKey(), options);
                value = await SecureStore.getItemAsync(LOCALSTORAGE_KEY, options);
                if (!value || value === '') {
                    throw new Error('Read Failed from SecureStore');
                }
            }

            localStorageKey = Buffer.from(value, 'hex');
        } catch (error) {
            console.log('getLocalStorageKey exception = ', error);
            throw error;
        }
    }

    return localStorageKey;
}

async function encryptData(data: string): Promise<string> {
    const key = await getLocalStorageKey();
    return encryptLocalData(data, key);
}

async function decryptData(data: string | null): Promise<string | null> {
    if (!data) {
        return null;
    }

    const key = await getLocalStorageKey();
    return decryptLocalData(data, key);
}

async function get(): Promise<LocalStorageProps> {
    try {
        const localData = await AsyncStorage.getItem(LOCALSTORAGE_KEY);
        if (localData) {
            const storageData = await decryptData(localData);
            return JSON.parse(storageData || '{}') as LocalStorageProps;
        }
    } catch (err) {
        console.log('Exception while localStorage.get = ', err);
    }
    return {
        user: {},
        members: [],
        bookmarks: [],
    };
}

async function set(data: LocalStorageProps): Promise<LocalStorageProps> {
    try {
        const localData = await encryptData(JSON.stringify(data));
        if (localData) {
            await AsyncStorage.setItem(LOCALSTORAGE_KEY, localData);
        }
    } catch (err) {
        console.log('Exception while localStorage.set = ', err);
    }
    return data;
}

async function reset(): Promise<void> {
    await AsyncStorage.removeItem(LOCALSTORAGE_KEY);
    await SecureStore.deleteItemAsync(LOCALSTORAGE_KEY);
    localStorageKey = undefined;
}

async function getByKey<T>(key: string): Promise<T | undefined> {
    try {
        const localData = await AsyncStorage.getItem(key);
        if (localData !== null) {
            return JSON.parse(localData) as T;
        }
    } catch (e) {
        console.log('LocalStorage get error : ', e);
    }
    return undefined;
}

async function setByKey<T>(key: string, data: T): Promise<void> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.log('LocalStorage set error : ', e);
    }
}

async function resetByKey(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.log('LocalStorage reset error : ', e);
    }
}

async function getByKeyEncrypt<T>(key: string): Promise<T | undefined> {
    try {
        const localData = await AsyncStorage.getItem(key);
        if (localData !== null) {
            const storageData = await decryptData(localData);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return JSON.parse(storageData || '{}') as T;
        }
    } catch (e) {
        console.log('LocalStorage getByKeyEncrypt error : ', e);
    }
    return undefined;
}

async function setByKeyEncrypt<T>(key: string, data: T): Promise<void> {
    try {
        const localData = await encryptData(JSON.stringify(data));
        if (localData) {
            await AsyncStorage.setItem(key, localData);
        }
    } catch (e) {
        console.log('LocalStorage setByKeyEncyrpt error : ', e);
    }
}

async function allTemporaryProposals(): Promise<LocalStorageProposalProps[]> {
    try {
        const localData = await AsyncStorage.getItem(LOCAL_TEMP_PROPOSALS);
        if (localData !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return JSON.parse(localData) as LocalStorageProposalProps[];
        }
    } catch (e) {
        console.log('LocalStorage allTemporaryProposals error : ', e);
    }
    return [];
}

async function findNewId(localProposals: LocalStorageProposalProps[]): Promise<string> {
    const id = Buffer.from(await Random.getRandomBytesAsync(16)).toString('hex');
    const index = localProposals.findIndex((p) => p.id === id);
    return index < 0 ? id : findNewId(localProposals);
}

async function getTemporaryProposals(id: string): Promise<LocalStorageProposalProps | null> {
    try {
        const localProposals = await allTemporaryProposals();
        const index = localProposals.findIndex((proposal) => proposal.id === id);
        return index < 0 ? null : localProposals[index];
    } catch (err) {
        console.log('LocalStorage getTemporaryProposals error : ', err);
        throw new Error('get temporary proposal failed');
    }
}

async function addTemporaryProposal(data: LocalStorageProposalProps): Promise<string> {
    try {
        const localProposals = await allTemporaryProposals();
        let itemId = data.id;
        if (itemId) {
            const tempData = { ...data, ...{ timestamp: Date.now() } };
            const index = localProposals.findIndex((proposal) => proposal.id === itemId);
            if (index < 0) {
                localProposals.push(tempData);
            } else {
                localProposals[index] = tempData;
            }
        } else {
            itemId = await findNewId(localProposals);
            const tempData = { ...data, ...{ id: itemId, timestamp: Date.now() } };
            localProposals.push(tempData);
        }

        await AsyncStorage.setItem(LOCAL_TEMP_PROPOSALS, JSON.stringify(localProposals));
        return itemId;
    } catch (err) {
        console.log('LocalStorage addTemporaryProposal error : ', err);
        throw new Error('save temporary proposal failed');
    }
}

async function deleteTemporaryProposal(id: string): Promise<LocalStorageProposalProps | null> {
    try {
        const localProposals = await allTemporaryProposals();
        const index = localProposals.findIndex((proposal) => proposal.id === id);
        if (index < 0) {
            return null;
        }

        const tempData = localProposals[index];
        localProposals.splice(index, 1);

        await AsyncStorage.setItem(LOCAL_TEMP_PROPOSALS, JSON.stringify(localProposals));
        return tempData;
    } catch (err) {
        console.log('LocalStorage deleteTemporaryProposal error : ', err);
        throw new Error('delete temporary proposal failed');
    }
}

export default {
    get,
    set,
    reset,
    getByKey,
    resetByKey,
    setByKey,
    getByKeyEncrypt,
    setByKeyEncrypt,
    allTemporaryProposals,
    getTemporaryProposals,
    addTemporaryProposal,
    deleteTemporaryProposal,
};
