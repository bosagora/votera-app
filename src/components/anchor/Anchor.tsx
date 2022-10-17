import React, { PropsWithChildren } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import * as Linking from 'expo-linking';

interface AnchorProps {
    source: string;
    style: StyleProp<ViewStyle>;
}

function Anchor(props: PropsWithChildren<AnchorProps>): JSX.Element {
    const { source, style, children } = props;
    return (
        <TouchableOpacity
            style={style}
            onPress={() => {
                Linking.openURL(source).catch(console.log);
            }}
        >
            {children}
        </TouchableOpacity>
    );
}

export default Anchor;
