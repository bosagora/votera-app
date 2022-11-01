import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { showSnackBar } from '~/state/features/snackBar';
import { useAppDispatch } from '~/state/hooks';
import globalStyle from '~/styles/global';
import { AttachmentFile, downloadFile } from '~/utils/attach';
import getString from '~/utils/locales/STRINGS';
import { FileDownloadIcon } from '~/components/icons';

interface DownloadProps {
    file?: AttachmentFile;
}

function DownloadComponent(props: DownloadProps) {
    const { file } = props;
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();

    if (!file) return null;
    return (
        <TouchableOpacity
            style={globalStyle.flexRowAlignCenter}
            onPress={() => {
                downloadFile(file.url, file.name)
                    .then((result) => {
                        dispatch(showSnackBar(getString('다운로드가 완료 되었습니다')));
                    })
                    .catch(console.log);
            }}
        >
            <FileDownloadIcon color={themeContext.color.primary} />
            <Text
                style={[
                    globalStyle.rtext,
                    { marginLeft: 10, color: themeContext.color.primary, fontSize: 13, lineHeight: 26 },
                ]}
            >
                {file.name || 'filename'}
            </Text>
        </TouchableOpacity>
    );
}

export default DownloadComponent;

DownloadComponent.defaultProps = {
    file: undefined,
};
