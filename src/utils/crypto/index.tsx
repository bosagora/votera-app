import nacl from 'tweetnacl-bosagora';
import { arrayify, keccak256 } from 'ethers/lib/utils';

const keySize = 32;
const ivSize = 16;
const macSize = 16;

export function encryptLocalData(data: string, keyBuf: Buffer): string {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const key = keyBuf.subarray(0, nacl.secretbox.keyLength);
    const message = Buffer.from(data, 'utf8');
    const cipher = nacl.secretbox(message, nonce, key);
    const result = Buffer.concat([nonce, cipher].map((v) => Buffer.from(v))).toString('base64');
    return `E$${result}`;
}

export function decryptLocalData(data: string, keyBuf: Buffer): string {
    if (!data) {
        return data;
    }
    if (!data.startsWith('E$')) {
        return data;
    }

    const encrypted = data.slice(2).split('.');
    if (encrypted.length >= 2) {
        throw new Error('invalid encrypted local data');
    }

    const message = Buffer.from(encrypted[0], 'base64');
    if (message.length < nacl.secretbox.nonceLength) {
        throw new Error('invalid encrypted local data');
    }

    const nonce = message.subarray(0, nacl.secretbox.nonceLength);
    const cipher = message.subarray(nacl.secretbox.nonceLength);
    const key = keyBuf.subarray(0, nacl.secretbox.keyLength);

    const result = nacl.secretbox.open(cipher, nonce, key);
    if (!result) {
        return '';
    }
    return Buffer.from(result).toString('utf8');
}

export function encryptText(text: string, eKey: string): string {
    const keyBuf = Buffer.from(eKey, 'hex');
    return encryptLocalData(text, keyBuf);
}

export function decryptText(data: string, eKey: string): string {
    if (!data || !data.startsWith('E$')) {
        return data;
    }
    const keyBuf = Buffer.from(eKey, 'hex');
    return decryptLocalData(data, keyBuf);
}

export function generateKey(size = keySize + ivSize + macSize): string {
    return Buffer.from(nacl.randomBytes(size)).toString('hex');
}

export function hashWorkspaceKey(workspaceKey: string): string {
    const hashed = keccak256(Buffer.from(workspaceKey, 'utf8'));
    return Buffer.from(arrayify(hashed)).toString('base64');
}

export const generateHashPin = (pin: string, privateKey: string): string => {
    const buf = Buffer.from(pin, 'utf8');
    const hash1 = arrayify(keccak256(buf));

    const pb = arrayify(privateKey);
    let hash2 = keccak256(Buffer.concat([hash1, pb].map((v) => Buffer.from(v))));

    for (let i = 1; i < 10; i += 1) {
        hash2 = keccak256(hash2);
    }

    return Buffer.from(arrayify(hash2)).toString('base64');
};

export const kdfKeygen = (): Uint8Array => {
    return nacl.randomBytes(keySize);
};
