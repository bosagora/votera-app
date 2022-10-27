import nacl from 'tweetnacl';
import { generateKey, encryptLocalData, decryptLocalData } from '@utils/crypto';
import { scrypt } from 'scrypt-js';
import { WorkerType, WorkerData } from './localWorkerTypes';

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

export default () => {
    onmessage = (e) => {
        const data = e.data as WorkerData;
        switch (data.type) {
            case WorkerType.GET_LOCAL:
                if (!data.data1 || !data.data2) {
                    postMessage({
                        type: WorkerType.ERROR,
                        id: data.id,
                        data1: 'missing parameter',
                    });
                } else {
                    getLocalStorageKey(data.data1, data.data2)
                        .then((value) => {
                            postMessage({
                                type: WorkerType.GET_LOCAL,
                                id: data.id,
                                data1: value.toString(),
                            });
                        })
                        .catch((err) => {
                            postMessage({
                                type: WorkerType.ERROR,
                                id: data.id,
                                data1: err.toString(),
                            });
                        });
                }
                break;
            case WorkerType.SET_LOCAL:
                if (!data.data1) {
                    postMessage({
                        type: WorkerType.ERROR,
                        id: data.id,
                        data1: 'missing parameter',
                    });
                } else {
                    setLocalStorageKey(data.data1)
                        .then((value) => {
                            postMessage({
                                type: WorkerType.SET_LOCAL,
                                id: data.id,
                                data1: value,
                            });
                        })
                        .catch((err) => {
                            postMessage({
                                type: WorkerType.ERROR,
                                id: data.id,
                                data1: err.toString(),
                            });
                        });
                }
                break;
            case WorkerType.RESET_LOCAL:
                resetLocalStorageKey();
                postMessage({
                    type: WorkerType.RESET_LOCAL,
                    id: data.id,
                });
                break;
            case WorkerType.ENCRYPT:
                if (!data.data1) {
                    postMessage({
                        type: WorkerType.ERROR,
                        id: data.id,
                        data1: 'missing parameter',
                    });
                } else if (!localStorageKey) {
                    postMessage({
                        type: WorkerType.ERROR,
                        id: data.id,
                        data1: 'not initialized',
                    });
                } else {
                    try {
                        const value = encryptLocalData(data.data1, localStorageKey);
                        postMessage({
                            type: WorkerType.ENCRYPT,
                            id: data.id,
                            data1: value,
                        });
                    } catch (err) {
                        postMessage({
                            type: WorkerType.ERROR,
                            id: data.id,
                            data1: err.toString(),
                        });
                    }
                }
                break;
            case WorkerType.DECRYPT:
                if (!data.data1) {
                    postMessage({
                        type: WorkerType.ERROR,
                        id: data.id,
                        data1: 'missing parameter',
                    });
                } else if (!localStorageKey) {
                    postMessage({
                        type: WorkerType.ERROR,
                        id: data.id,
                        data1: 'not initialized',
                    });
                } else {
                    try {
                        const value = decryptLocalData(data.data1, localStorageKey);
                        postMessage({
                            type: WorkerType.DECRYPT,
                            id: data.id,
                            data1: value,
                        });
                    } catch (err) {
                        postMessage({
                            type: WorkerType.ERROR,
                            id: data.id,
                            data1: err.toString(),
                        });
                    }
                }
                break;
            default:
                postMessage({
                    type: WorkerType.ERROR,
                    id: data.id,
                    data1: 'unknown type',
                });
                break;
        }
    };
};
