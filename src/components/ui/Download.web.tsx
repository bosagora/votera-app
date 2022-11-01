import React, { useContext } from 'react';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { AttachmentFile } from '~/utils/attach';
import Anchor from '~/components/anchor/Anchor';
import { FileDownloadIcon } from '~/components/icons';

interface DownloadProps {
    file?: AttachmentFile;
}

function DownloadComponent(props: DownloadProps) {
    const { file } = props;
    const themeContext = useContext(ThemeContext);

    if (!file) return null;
    return (
        <Anchor style={{ flexDirection: 'row', alignItems: 'center' }} source={file.url || ''}>
            <FileDownloadIcon color={themeContext.color.primary} />
            <Text style={{ marginLeft: 10, color: themeContext.color.primary, lineHeight: 26 }}>
                {file.name || 'filename'}
            </Text>
        </Anchor>
    );
}

export default DownloadComponent;

DownloadComponent.defaultProps = {
    file: undefined,
};
