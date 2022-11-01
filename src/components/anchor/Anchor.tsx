import React, { PropsWithChildren } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { openURL as linkingOpenURL } from 'expo-linking';

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
                linkingOpenURL(source).catch(console.log);
            }}
        >
            {children}
        </TouchableOpacity>
    );
}

export default Anchor;
