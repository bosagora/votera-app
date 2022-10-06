import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';

function FocusAwareStatusBar(props: StatusBarProps): JSX.Element | null {
    const isFocused = useIsFocused();
    return isFocused ? (
        <StatusBar
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    ) : null;
}

export default FocusAwareStatusBar;
