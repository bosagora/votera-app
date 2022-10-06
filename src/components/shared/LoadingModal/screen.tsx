/* eslint-disable global-require, @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function LoadingModalScreen(): JSX.Element | null {
    return (
        <View
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0, 0.5)',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <ActivityIndicator size="large" />
        </View>
    );
}
