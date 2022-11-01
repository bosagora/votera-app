import React, { useState, useEffect, useContext } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { DocumentResult, getDocumentAsync } from 'expo-document-picker';
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
        marginBottom: 7,
        paddingHorizontal: 15,
    },
});

interface Props {
    data: DocumentResult;
    placeholder: string;
    fileType: string[];
    addFile: (fileData: DocumentResult) => void;
    removeFile: (fileData: DocumentResult) => void;
}

interface PickerProps {
    placeholder: string;
    fileType: string[];
    onChangeFiles: (files: DocumentResult[]) => void;
    value?: DocumentResult[];
}

const MAX_SIZE = 10 * 1024 * 1024;

function DocumentPickerComponent(props: Props): JSX.Element {
    const { data, removeFile, addFile, fileType, placeholder, ...others } = props;
    const themeContext = useContext(ThemeContext);
    const [fileSource, setFileSource] = useState<DocumentResult>();
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
            const result = await getDocumentAsync({
                type: fileType.length === 0 ? '*/*' : fileType,
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
                {fileSource?.type === 'success' ? (
                    <ClearIcon color={themeContext.color.primary} />
                ) : (
                    <AddIcon color={themeContext.color.white} />
                )}
            </TouchableOpacity>
        </View>
    );
}

function DocumentPickerWrapper(props: PickerProps): JSX.Element {
    const { value, onChangeFiles, placeholder, fileType } = props;

    const addFile = (fileData: DocumentResult) => {
        if (fileData.type !== 'success') {
            return;
        }

        const filteredFiles = value?.filter((file) => file.type === 'success') || [];
        const newFiles = [...filteredFiles, fileData];
        // setFiles(newFiles);
        onChangeFiles(newFiles);
    };

    const removeFile = (fileData: DocumentResult) => {
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
                        fileType={fileType}
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
                    fileType={fileType}
                />
            )}
        </>
    );
}

export default DocumentPickerWrapper;

DocumentPickerWrapper.defaultProps = {
    value: [],
};
