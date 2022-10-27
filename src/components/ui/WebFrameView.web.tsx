import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WebFrameViewProps {
    title: string;
    uri: string;
}

function WebFrameView(props: WebFrameViewProps): JSX.Element {
    const { title, uri } = props;
    const [height, setHeight] = useState(100);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{ width: '100%', height: '100%' }}
                onLayout={(e) => {
                    setHeight(e.nativeEvent.layout.height - 10);
                }}
            >
                <iframe title={title} src={uri} height={height} />
            </View>
        </SafeAreaView>
    );
}

export default WebFrameView;
