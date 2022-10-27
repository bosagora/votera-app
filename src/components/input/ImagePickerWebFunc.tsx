import React from 'react';
import { ImageInfo, ImagePickerResult } from 'expo-image-picker';
import { v4 } from 'uuid';

function readFile(targetFile: File): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
            reject(new Error(`Failed to read the selected media because the operation failed.`));
        };
        reader.onload = ({ target }) => {
            const uri = (target as any).result;
            const exif: Record<string, any> = { name: targetFile.name };
            const returnRaw = () =>
                resolve({
                    uri,
                    width: 0,
                    height: 0,
                    cancelled: false,
                    exif,
                });

            if (typeof uri === 'string') {
                const image = new Image();
                image.src = uri;
                image.onload = () =>
                    resolve({
                        uri,
                        width: image.naturalWidth ?? image.width,
                        height: image.naturalHeight ?? image.height,
                        cancelled: false,
                        exif,
                    });
                image.onerror = () => returnRaw();
            } else {
                returnRaw();
            }
        };

        reader.readAsDataURL(targetFile);
    });
}

export function openFileBrowserAsync(): Promise<ImagePickerResult> {
    const mediaTypeFormat = 'image/*';

    const input = document.createElement('input');
    input.style.display = 'none';
    input.setAttribute('type', 'file');
    input.setAttribute('accept', mediaTypeFormat);
    input.setAttribute('id', v4());
    document.body.appendChild(input);

    return new Promise((resolve, reject) => {
        input.addEventListener('change', () => {
            if (input.files) {
                readFile(input.files[0])
                    .then((img) => {
                        resolve(img);
                    })
                    .catch((err) => {
                        resolve({ cancelled: true });
                    });
            }
            document.body.removeChild(input);
        });

        const event = new MouseEvent('click');
        input.dispatchEvent(event);
    });
}

export function launchImageLibraryAsync(): Promise<ImagePickerResult> {
    return openFileBrowserAsync();
}
