import React, { useState, useEffect, useContext } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import * as DocumentPicker from 'expo-document-picker';
import { Icon, Text } from 'react-native-elements';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import getString from '~/utils/locales/STRINGS';

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
        marginBottom: 7,
        paddingHorizontal: 15,
    },
});

interface Props {
    data: DocumentPicker.DocumentResult;
    placeholder: string;
    addFile: (fileData: DocumentPicker.DocumentResult) => void;
    removeFile: (fileData: DocumentPicker.DocumentResult) => void;
}

interface PickerProps {
    placeholder: string;
    onChangeFiles: (files: DocumentPicker.DocumentResult[]) => void;
    value?: DocumentPicker.DocumentResult[];
}

const MAX_SIZE = 10 * 1024 * 1024;

function DocumentPickerComponent(props: Props): JSX.Element {
    const { data, removeFile, addFile, placeholder, ...others } = props;
    const themeContext = useContext(ThemeContext);
    const [fileSource, setFileSource] = useState<DocumentPicker.DocumentResult>();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setFileSource(data);
    }, [data]);

    const resetFileSource = () => {
        if (fileSource) {
            removeFile(fileSource);
        }
        setFileSource({ type: 'cancel' });
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
            });
            if (result.type !== 'cancel') {
                if (result.size && result.size > MAX_SIZE) {
                    dispatch(showSnackBar(getString('파일 사이즈가 10M 이상입니다&#46;')));
                    return;
                }
            }
            addFile(result);
        } catch (err) {
            console.log('Document Picker error : ', err);
        }
    };

    return (
        <View
            style={styles.container}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
        >
            <Text
                style={{
                    flex: 1,
                    fontSize: 15,
                    color:
                        fileSource?.type === 'success' ? themeContext.color.textBlack : themeContext.color.placeholder,
                }}
            >
                {fileSource?.type === 'success' ? fileSource.name : placeholder}
            </Text>

            <TouchableOpacity
                onPress={fileSource?.type === 'success' ? resetFileSource : pickFile}
                style={{
                    width: 27,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: fileSource?.type === 'success' ? 'transparent' : themeContext.color.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon
                    color={fileSource?.type === 'success' ? themeContext.color.primary : 'white'}
                    name={fileSource?.type === 'success' ? 'clear' : 'add'}
                    tvParallaxProperties={undefined}
                />
            </TouchableOpacity>
        </View>
    );
}

function DocumentPickerWrapper(props: PickerProps): JSX.Element {
    const { value, onChangeFiles, placeholder } = props;

    const addFile = (fileData: DocumentPicker.DocumentResult) => {
        if (fileData.type !== 'success') {
            return;
        }

        const filteredFiles = value?.filter((file) => file.type === 'success') || [];
        const newFiles = [...filteredFiles, fileData];
        // setFiles(newFiles);
        onChangeFiles(newFiles);
    };

    const removeFile = (fileData: DocumentPicker.DocumentResult) => {
        if (fileData.type === 'cancel') {
            return;
        }

        const filteredFiles = value?.filter(
            (file) => file.type === 'success' && file.name !== fileData.name && file.uri !== fileData.uri,
        );
        if (!filteredFiles) {
            onChangeFiles([{ type: 'cancel' }]);
            return;
        }
        onChangeFiles(filteredFiles);
        // setFiles(filteredFiles);
    };

    return (
        <>
            {value?.map((file) => {
                return (
                    <DocumentPickerComponent
                        key={`attachment_${file.type === 'success' ? file.name : 0}`}
                        data={file}
                        addFile={(fileDatas) => addFile(fileDatas)}
                        removeFile={(fileData) => removeFile(fileData)}
                        placeholder={placeholder}
                    />
                );
            })}
            {(!value || value.length < 5) && (
                <DocumentPickerComponent
                    key={`attachment_${value?.length || 0}`}
                    data={{ type: 'cancel' }}
                    addFile={(fileDatas) => addFile(fileDatas)}
                    removeFile={(fileData) => removeFile(fileData)}
                    placeholder={placeholder}
                />
            )}
        </>
    );
}

export default DocumentPickerWrapper;

DocumentPickerWrapper.defaultProps = {
    value: [],
};
