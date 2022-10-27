import nacl from 'tweetnacl';
import { generateKey, encryptLocalData, decryptLocalData } from '@utils/crypto';
import { scrypt } from 'scrypt-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytesAsync } from 'expo-random';
import { LOCALSTORAGE_KEY, LOGIN_SESSION_SEED, LOCAL_TEMP_PROPOSALS } from '@config/keys';
import { LocalStorageProps, LocalStorageProposalProps } from './LocalStorageTypes';

export * from './LocalStorageTypes';

let localStorageKey: Buffer | undefined;

const DefaultN = 16384;
const DefaultR = 8;
const DefaultP = 1;
const keyLen = nacl.secretbox.keyLength + nacl.secretbox.nonceLength;

async function getLocalStorageKey(localSeed: string, seed: string): Promise<boolean> {
    const seeds = localSeed.split('.');
    const storageKey = await scrypt(
        Buffer.from(seeds[0], 'base64'),
        Buffer.from(seed, 'base64'),
        DefaultN,
        DefaultR,
        DefaultP,
        keyLen,
    );
    const cipher = Buffer.from(seeds[1], 'base64');
    const key = storageKey.subarray(0, nacl.secretbox.keyLength);
    const nonce = storageKey.subarray(nacl.secretbox.keyLength);

    const result = nacl.secretbox.open(cipher, nonce, key);
    if (!result) {
        localStorageKey = undefined;
        return false;
    }
    if (Buffer.from(result).toString('utf8') !== 'hello') {
        localStorageKey = undefined;
        return false;
    }
    localStorageKey = Buffer.from(storageKey);
    return true;
}

async function setLocalStorageKey(seed: string): Promise<string> {
    const localSeed0 = Buffer.from(generateKey(keyLen), 'hex');
    const storageKey = await scrypt(localSeed0, Buffer.from(seed, 'base64'), DefaultN, DefaultR, DefaultP, keyLen);
    const key = storageKey.subarray(0, nacl.secretbox.keyLength);
    const nonce = storageKey.subarray(nacl.secretbox.keyLength);
    const message = Buffer.from('hello', 'utf8');

    const cipher = nacl.secretbox(message, nonce, key);
    localStorageKey = Buffer.from(storageKey);
    return `${localSeed0.toString('base64')}.${Buffer.from(cipher).toString('base64')}`;
}

function resetLocalStorageKey() {
    localStorageKey = undefined;
}

async function prepareStorageKey() {
    if (localStorageKey) {
        return;
    }
    let localSeed = await AsyncStorage.getItem(LOGIN_SESSION_SEED);
    if (localSeed) {
        const response = await getLocalStorageKey(localSeed, 'votera');
        if (response) {
            return;
        }
    }

    localSeed = await setLocalStorageKey('votera');
    if (!localSeed) {
        throw new Error('cannot initialize seed');
    }

    await AsyncStorage.setItem(LOGIN_SESSION_SEED, localSeed);
}

async function encryptData(data: string): Promise<string> {
    await prepareStorageKey();
    if (!localStorageKey) {
        throw new Error('NotReady storage key');
    }

    return encryptLocalData(data, localStorageKey);
}

async function decryptData(data: string | null): Promise<string | null> {
    await prepareStorageKey();
    if (!localStorageKey) {
        throw new Error('NotReady storage key');
    }
    if (!data) {
        return null;
    }
    return decryptLocalData(data, localStorageKey);
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
}

async function getByKey<T>(key: string): Promise<T | undefined> {
    try {
        const localData = await AsyncStorage.getItem(key);
        if (localData !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    const id = Buffer.from(await getRandomBytesAsync(16)).toString('hex');
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
            const tempData = { ...data, ...{ id: itemId, timestamp: Date.now() } };
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
