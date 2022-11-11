import { Image } from 'react-native';
import ImagePicker from 'expo-image-picker';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import DocumentPicker from 'expo-document-picker';
import { UploadFile, Maybe } from '~/graphql/generated/generated';

export interface ISize {
    width: number;
    height: number;
}

export interface AttachmentImage {
    id?: string;
    url?: string;
    width?: number;
    height?: number;
}

export interface AttachmentFile {
    id?: string;
    url?: string;
    name?: string;
    mime?: string;
    size?: number;
}

export const getImageSize = (uri: string): Promise<ISize> => {
    const success = (resolve: (value: ISize | PromiseLike<ISize>) => void) => (width: number, height: number) => {
        resolve({
            width,
            height,
        });
    };
    const error = (reject: (reason?: any) => void) => (failure: Error) => {
        reject(failure);
    };

    return new Promise<ISize>((resolve, reject) => {
        Image.getSize(uri, success(resolve), error(reject));
    });
};

export function imagePickerToAttachmentImage(result: ImagePicker.ImagePickerResult): AttachmentImage | undefined {
    if (result.cancelled) {
        return undefined;
    }
    if (result.type === 'video') {
        return undefined;
    }
    return { url: result.uri, width: result.width, height: result.height };
}

export function uploadFileToAttachmentImage(result: UploadFile | null): AttachmentImage | undefined {
    if (!result || !result.mime?.startsWith('image')) {
        return undefined;
    }
    return { id: result.id, url: result.url, width: result.width ?? undefined, height: result.height ?? undefined };
}

export async function downloadFile(fileUrl?: string, fileName?: string): Promise<object | undefined> {
    if (!fileUrl) return undefined;
    const available = await isAvailableAsync();
    if (!available) throw new Error('NotAvailable');
    return shareAsync(fileUrl);
}

export function documentResultToAttachmentFile(result: DocumentPicker.DocumentResult): AttachmentFile | undefined {
    if (result.type === 'cancel') {
        return undefined;
    }
    return { url: result.uri, name: result.name, mime: result.mimeType, size: result.size };
}

export function uploadFileToAttachmentFile(result: UploadFile | null): AttachmentFile | undefined {
    if (!result || result.mime?.startsWith('image')) {
        return undefined;
    }
    return { id: result.id, url: result.url, name: result.name, mime: result.mime, size: result.size };
}

export async function adjustAttachmentImage(
    image: AttachmentImage,
    maxWidth: number,
): Promise<AttachmentImage | undefined> {
    if (!image.url) {
        return undefined;
    }
    if (image.width !== undefined && image.height !== undefined) {
        if (image.width > maxWidth) {
            const imageRatio = maxWidth / image.width;
            return { id: image.id, url: image.url, width: maxWidth, height: image.height * imageRatio };
        }
        return { id: image.id, url: image.url, width: image.width, height: image.height };
    }
    try {
        const size = await getImageSize(image.url);
        if (size.width > maxWidth) {
            const imageRatio = maxWidth / size.width;
            return { id: image.id, url: image.url, width: maxWidth, height: size.height * imageRatio };
        }
        return { id: image.id, url: image.url, width: size.width, height: size.height };
    } catch (err) {
        return undefined;
    }
}

export function filterAttachment(attachments: Maybe<UploadFile>[]): {
    images: AttachmentImage[];
    files: AttachmentFile[];
} {
    const images: AttachmentImage[] = [];
    const files: AttachmentFile[] = [];
    for (let i = 0; i < attachments.length; i += 1) {
        const attach = attachments[i];
        if (attach) {
            const image = uploadFileToAttachmentImage(attach);
            if (image) {
                images.push(image);
            } else {
                const file = uploadFileToAttachmentFile(attach);
                if (file) {
                    files.push(file);
                }
            }
        }
    }

    return { images, files };
}
