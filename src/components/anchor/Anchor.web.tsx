import React, { PropsWithChildren } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface AnchorProps {
    source: string;
    style: StyleProp<ViewStyle>;
}

function Anchor(props: PropsWithChildren<AnchorProps>): JSX.Element {
    const { source, style, children } = props;
    return (
        <View accessibilityRole="link" style={style} href={source} hrefAttrs={{ target: '_blank' }}>
            {children}
        </View>
    );
}

export default Anchor;
