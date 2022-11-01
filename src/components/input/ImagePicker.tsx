import React, { useState, useContext } from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import {
    ImagePickerResult,
    launchImageLibraryAsync,
    MediaTypeOptions,
    getMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { Text } from 'react-native-elements';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import getString from '~/utils/locales/STRINGS';
import { AddIcon, ClearIcon } from '~/components/icons';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgb(252, 251, 255)',
        borderColor: 'rgb(235, 234, 239)',
        borderRadius: 5,
        borderWidth: 2,
        flexDirection: 'row',
        height: 52,
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
});

function getBase64ImageSize(uri: string): number {
    const datas = uri.split(',');
    if (datas?.length !== 2) {
        // unknown uri
        return 0;
    }

    const buf = Buffer.from(datas[1], 'base64');
    return buf.length;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

interface Props {
    showImage: boolean;
    placeholder: string;
    value?: ImagePickerResult;
    onChangeImage: (image: ImagePickerResult | undefined) => void;
}

function ImagePickerComponent(props: Props): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const { showImage, value, placeholder, onChangeImage, ...others } = props;
    const [imageUri, setImageUri] = useState('');
    // const [imageSource, setImageSource] = useState<ImagePickerResult>();
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        if (!value || value.cancelled) {
            setImageUri('');
        } else {
            setImageUri(value.uri);
        }
    }, [value]);

    const resetImageSource = () => {
        // setImageSource(undefined);
        onChangeImage(undefined);
    };

    const pickImage = async () => {
        try {
            const result: ImagePickerResult = await launchImageLibraryAsync({
                mediaTypes: MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
                exif: true,
            });
            if (!result.cancelled) {
                if (result.uri.startsWith('data:image')) {
                    const size = getBase64ImageSize(result.uri);
                    if (size > MAX_IMAGE_SIZE) {
                        dispatch(showSnackBar(getString('파일 사이즈가 10M 이상입니다&#46;')));
                        return;
                    }
                }
            }
            onChangeImage(result);
            // setImageSource(result);
        } catch (err) {
            console.log('image picker err : ', err);
        }
    };

    const checkPermission = () => {
        getMediaLibraryPermissionsAsync()
            .then(() => {
                return pickImage();
            })
            .catch((err) => {
                console.log('checkPersmission error', err);
                dispatch(showSnackBar('fail to get permission'));
            });
    };

    return (
        <View
            style={styles.container}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
        >
            {imageUri !== '' && showImage && <Image style={{ width: 27, height: 28 }} source={{ uri: imageUri }} />}
            {!imageUri.startsWith('data:image/') && (
                <Text
                    style={{
                        flex: 1,
                        fontSize: 14,
                        color: imageUri ? themeContext.color.textBlack : themeContext.color.placeholder,
                    }}
                >
                    {imageUri ? imageUri.split('/').pop() : placeholder}
                </Text>
            )}
            <TouchableOpacity
                onPress={imageUri ? resetImageSource : checkPermission}
                style={{
                    width: 27,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: imageUri ? 'transparent' : themeContext.color.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {imageUri ? (
                    <ClearIcon color={themeContext.color.primary} />
                ) : (
                    <AddIcon color={themeContext.color.white} />
                )}
            </TouchableOpacity>
        </View>
    );
}

export default ImagePickerComponent;

ImagePickerComponent.defaultProps = {
    value: undefined,
};
