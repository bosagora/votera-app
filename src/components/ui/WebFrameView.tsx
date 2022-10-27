import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

interface WebFrameViewProps {
    title: string;
    uri: string;
}

function WebFrameView(props: WebFrameViewProps): JSX.Element {
    const { title, uri } = props;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <WebView source={{ uri }} />
        </SafeAreaView>
    );
}

export default WebFrameView;
