import { utils } from 'ethers';
import { arrayify, SigningKey, recoverAddress, BytesLike } from 'ethers/lib/utils';

/**
 * This represents a single field in a `V1` `signTypedData` message.
 *
 * @property name - The name of the field.
 * @property type - The type of a field (must be a supported Solidity type).
 * @property value - The value of the field.
 */
export interface TypedDataV1Field {
    name: string;
    type: string;
    value: any;
}

/**
 * This is the message format used for `V1` of `signTypedData`.
 */
export type TypedDataV1 = TypedDataV1Field[];

/**
 * Represents the version of `signTypedData` being used.
 *
 * V1 is based upon [an early version of EIP-712](https://github.com/ethereum/EIPs/pull/712/commits/21abe254fe0452d8583d5b132b1d7be87c0439ca)
 * that lacked some later security improvements, and should generally be neglected in favor of
 * later versions.
 *
 * V3 is based on EIP-712, except that arrays and recursive data structures are not supported.
 *
 * V4 is based on EIP-712, and includes full support of arrays and recursive data structures.
 */
export const enum SignTypedDataVersion {
    V1 = 'V1',
    V3 = 'V3',
    V4 = 'V4',
}
const SignTypedDataVersions = [SignTypedDataVersion.V1, SignTypedDataVersion.V3, SignTypedDataVersion.V4];

export interface MessageTypeProperty {
    name: string;
    type: string;
}

export interface MessageTypes {
    EIP712Domain: MessageTypeProperty[];
    [additionalProperties: string]: MessageTypeProperty[];
}

/**
 * This is the message format used for `signTypeData`, for all versions
 * except `V1`.
 *
 * @template T - The custom types used by this message.
 * @property types - The custom types used by this message.
 * @property primaryType - The type of the message.
 * @property domain - Signing domain metadata. The signing domain is the intended context for the
 * signature (e.g. the dapp, protocol, etc. that it's intended for). This data is used to
 * construct the domain seperator of the message.
 * @property domain.name - The name of the signing domain.
 * @property domain.version - The current major version of the signing domain.
 * @property domain.chainId - The chain ID of the signing domain.
 * @property domain.verifyingContract - The address of the contract that can verify the signature.
 * @property domain.salt - A disambiguating salt for the protocol.
 * @property message - The message to be signed.
 */
export interface TypedMessage<T extends MessageTypes> {
    types: T;
    primaryType: keyof T;
    domain: {
        name?: string;
        version?: string;
        chainId?: number;
        verifyingContract?: string;
        salt?: ArrayBuffer;
    };
    message: Record<string, unknown>;
}

/**
 * Validate that the given value is a valid version string.
 *
 * @param version - The version value to validate.
 * @param allowedVersions - A list of allowed versions. If omitted, all versions are assumed to be
 * allowed.
 */
function validateVersion(version: SignTypedDataVersion, allowedVersions?: SignTypedDataVersion[]) {
    if (!SignTypedDataVersions.includes(version)) {
        throw new Error(`Invalid version: '${version}'`);
    } else if (allowedVersions && !allowedVersions.includes(version)) {
        throw new Error(
            `SignTypedDataVersion not allowed: '${version}'. Allowed versions are: ${allowedVersions.join(', ')}`,
        );
    }
}

/**
 * Finds all types within a type definition object.
 *
 * @param primaryType - The root type.
 * @param types - Type definitions for all types included in the message.
 * @param results - The current set of accumulated types.
 * @returns The set of all types found in the type definition.
 */
function findTypeDependencies(
    primaryType: string,
    types: Record<string, MessageTypeProperty[]>,
    results: Set<string> = new Set(),
): Set<string> {
    const matchedType = primaryType.match(/^\w*/u);
    if (!matchedType) {
        return results;
    }
    const [prmType] = matchedType;
    if (results.has(prmType) || types[prmType] === undefined) {
        return results;
    }

    results.add(prmType);

    types[prmType].forEach((field) => {
        findTypeDependencies(field.type, types, results);
    });
    return results;
}

/**
 * Encodes the type of an object by encoding a comma delimited list of its members.
 *
 * @param primaryType - The root type to encode.
 * @param types - Type definitions for all types included in the message.
 * @returns An encoded representation of the primary type.
 */
function encodeType(primaryType: string, types: Record<string, MessageTypeProperty[]>): string {
    let result = '';
    const unsortedDeps = findTypeDependencies(primaryType, types);
    unsortedDeps.delete(primaryType);

    const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
    deps.forEach((type) => {
        const children = types[type];
        if (!children) {
            throw new Error(`No type definition specified: ${type}`);
        }

        result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(',')})`;
    });
    return result;
}

/**
 * Hashes the type of an object.
 *
 * @param primaryType - The root type to hash.
 * @param types - Type definitions for all types included in the message.
 * @returns The hash of the object type.
 */
function hashType(primaryType: string, types: Record<string, MessageTypeProperty[]>): string {
    return utils.keccak256(Buffer.from(encodeType(primaryType, types), 'utf8'));
}

/**
 * Encodes an object by encoding and concatenating each of its members.
 *
 * @param primaryType - The root type.
 * @param data - The object to encode.
 * @param types - Type definitions for all types included in the message.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns An encoded representation of an object.
 */
function encodeData(
    primaryType: string,
    data: Record<string, unknown>,
    types: Record<string, MessageTypeProperty[]>,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4,
): string {
    validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);

    const encodedTypes = ['bytes32'];
    const encodedValues: unknown[] = [hashType(primaryType, types)];

    types[primaryType].forEach((field) => {
        if (version === SignTypedDataVersion.V3 && data[field.name] === undefined) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-use-before-define
        const [type, value] = encodeField(types, field.name, field.type, data[field.name], version);
        encodedTypes.push(type);
        encodedValues.push(value);
    });

    return utils.defaultAbiCoder.encode(encodedTypes, encodedValues);
}

/**
 * Hashes an object.
 *
 * @param primaryType - The root type.
 * @param data - The object to hash.
 * @param types - Type definitions for all types included in the message.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns The hash of the object.
 */
function hashStruct(
    primaryType: string,
    data: Record<string, unknown>,
    types: Record<string, MessageTypeProperty[]>,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4,
): string {
    validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);

    return utils.keccak256(encodeData(primaryType, data, types, version));
}

/**
 * Encode a single field.
 *
 * @param types - All type definitions.
 * @param name - The name of the field to encode.
 * @param type - The type of the field being encoded.
 * @param value - The value to encode.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns Encoded representation of the field.
 */
function encodeField(
    types: Record<string, MessageTypeProperty[]>,
    name: string,
    type: string,
    value: any,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4,
): [type: string, value: any] {
    validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);

    if (types[type] !== undefined) {
        return [
            'bytes32',
            version === SignTypedDataVersion.V4 && value == null // eslint-disable-line no-eq-null
                ? '0x0000000000000000000000000000000000000000000000000000000000000000'
                : utils.keccak256(encodeData(type, value as Record<string, unknown>, types, version)),
        ];
    }

    if (value === undefined) {
        throw new Error(`missing value for field ${name} of type ${type}`);
    }

    if (type === 'bytes') {
        return ['bytes32', utils.keccak256(value as BytesLike)];
    }

    if (type === 'string') {
        // convert string to buffer - prevents ethUtil from interpreting strings like '0xabcd' as hex
        if (typeof value === 'string') {
            return ['bytes32', utils.keccak256(Buffer.from(value, 'utf8'))];
        }
        return ['bytes32', utils.keccak256(value as BytesLike)];
    }

    if (type.lastIndexOf(']') === type.length - 1) {
        if (version === SignTypedDataVersion.V3) {
            throw new Error('Arrays are unimplemented in encodeData; use V4 extension');
        }
        const parsedType = type.slice(0, type.lastIndexOf('['));
        const typeValuePairs = (value as any[]).map((item) => encodeField(types, name, parsedType, item, version));
        return [
            'bytes32',
            utils.keccak256(
                utils.defaultAbiCoder.encode(
                    typeValuePairs.map(([t]) => t),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    typeValuePairs.map(([, v]) => v),
                ),
            ),
        ];
    }

    return [type, value];
}

/**
 * Removes properties from a message object that are not defined per EIP-712.
 *
 * @param data - The typed message object.
 * @returns The typed message object with only allowed fields.
 */
function sanitizeData<T extends MessageTypes>(data: TypedMessage<T>): TypedMessage<T> {
    const { types, primaryType, domain, message } = data;
    if (!types.EIP712Domain) {
        types.EIP712Domain = [];
    }
    return { types, primaryType, domain, message };
}

/**
 * Hash a typed message according to EIP-712. The returned message starts with the EIP-712 prefix,
 * which is "1901", followed by the hash of the domain separator, then the data (if any).
 * The result is hashed again and returned.
 *
 * This function does not sign the message. The resulting hash must still be signed to create an
 * EIP-712 signature.
 *
 * @param typedData - The typed message to hash.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns The hash of the typed message.
 */
function eip712Hash<T extends MessageTypes>(
    typedData: TypedMessage<T>,
    version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4,
): string {
    validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);

    const sanitizedData = sanitizeData(typedData);
    const parts = [new Uint8Array([0x19, 0x01])];
    parts.push(arrayify(hashStruct('EIP712Domain', sanitizedData.domain, sanitizedData.types, version)));

    if (sanitizedData.primaryType !== 'EIP712Domain') {
        parts.push(
            arrayify(
                hashStruct(sanitizedData.primaryType as string, sanitizedData.message, sanitizedData.types, version),
            ),
        );
    }
    return utils.keccak256(Buffer.concat(parts.map((p) => Buffer.from(p))));
}

/**
 * A collection of utility functions used for signing typed data.
 */
export const TypedDataUtils = {
    encodeData,
    encodeType,
    findTypeDependencies,
    hashStruct,
    hashType,
    sanitizeData,
    eip712Hash,
};

/**
 * Sign typed data according to EIP-712. The signing differs based upon the `version`.
 *
 * V1 is based upon [an early version of EIP-712](https://github.com/ethereum/EIPs/pull/712/commits/21abe254fe0452d8583d5b132b1d7be87c0439ca)
 * that lacked some later security improvements, and should generally be neglected in favor of
 * later versions.
 *
 * V3 is based on [EIP-712](https://eips.ethereum.org/EIPS/eip-712), except that arrays and
 * recursive data structures are not supported.
 *
 * V4 is based on [EIP-712](https://eips.ethereum.org/EIPS/eip-712), and includes full support of
 * arrays and recursive data structures.
 *
 * @param options - The signing options.
 * @param options.privateKey - The private key to sign with.
 * @param options.data - The typed data to sign.
 * @param options.version - The signing version to use.
 * @returns The '0x'-prefixed hex encoded signature.
 */
export function signTypedData<V extends SignTypedDataVersion, T extends MessageTypes>({
    privateKey,
    data,
    version,
}: {
    privateKey: Uint8Array;
    data: TypedMessage<T>;
    version: V;
}): string {
    validateVersion(version);
    if (data === null || data === undefined) {
        throw new Error('Missing data parameter');
    } else if (privateKey === null || data === undefined) {
        throw new Error('Missing private key parameter');
    }

    const messageHash = TypedDataUtils.eip712Hash(data, version as SignTypedDataVersion.V3 | SignTypedDataVersion.V4);
    const signingKey = new SigningKey(privateKey);
    const sig = signingKey.signDigest(messageHash);
    return utils.joinSignature(sig);
}

/**
 * Recover the address of the account that created the given EIP-712
 * signature. The version provided must match the version used to
 * create the signature.
 *
 * @param options - The signature recovery options.
 * @param options.data - The typed data that was signed.
 * @param options.signature - The '0x-prefixed hex encoded message signature.
 * @param options.version - The signing version to use.
 * @returns The '0x'-prefixed hex address of the signer.
 */
export function recoverTypedSignature<V extends SignTypedDataVersion, T extends MessageTypes>({
    data,
    signature,
    version,
}: {
    data: TypedMessage<T>;
    signature: string;
    version: V;
}): string {
    validateVersion(version);
    if (data === null || data === undefined) {
        throw new Error('Missing data parameter');
    } else if (signature === null || data === undefined) {
        throw new Error('Missing signature parameter');
    }

    const messageHash = TypedDataUtils.eip712Hash(data, version as SignTypedDataVersion.V3 | SignTypedDataVersion.V4);
    const sig = utils.splitSignature(signature);
    return recoverAddress(messageHash, sig);
}
