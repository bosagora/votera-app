import React, { useContext } from 'react';
import { Icon, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { AttachmentFile } from '~/utils/attach';
import Anchor from '~/components/anchor/Anchor';

interface DownloadProps {
    file?: AttachmentFile;
}

function DownloadComponent(props: DownloadProps) {
    const { file } = props;
    const themeContext = useContext(ThemeContext);

    if (!file) return null;
    return (
        <Anchor style={{ flexDirection: 'row', alignItems: 'center' }} source={file.url || ''}>
            <Icon name="file-download" color={themeContext.color.primary} tvParallaxProperties={undefined} />
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
