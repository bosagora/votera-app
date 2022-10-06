import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';

interface DownloadProps {
    label: string;
    onPress: () => void;
}

function DownloadComponent(props: DownloadProps) {
    const { label, onPress } = props;
    const themeContext = useContext(ThemeContext);
    return (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onPress}>
            <Icon name="file-download" color={themeContext.color.primary} tvParallaxProperties={undefined} />
            <Text style={{ marginLeft: 10, color: themeContext.color.primary, lineHeight: 26 }}>{label}</Text>
        </TouchableOpacity>
    );
}

export default DownloadComponent;
