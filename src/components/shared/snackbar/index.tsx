import React, { useContext, useEffect, useRef, useState } from 'react';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { Animated, useWindowDimensions, View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useAppSelector, useAppDispatch } from '~/state/hooks';
import { selectSnackBarState, hideSnackBar } from '~/state/features/snackBar';
import { MAX_WIDTH } from '~/styles/global';

const SNACK_BAR_HEIGHT = 70 + (initialWindowMetrics?.insets.bottom || 0);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: SNACK_BAR_HEIGHT,
        justifyContent: 'center',
        marginHorizontal: 40,
    },
    text: {
        color: 'white',
        textAlign: 'center',
    },
});

export default function SnackBar(): JSX.Element | null {
    const snackBarTopAni = useRef(new Animated.Value(SNACK_BAR_HEIGHT)).current;
    const theme = useContext(ThemeContext);
    const snackBar = useAppSelector(selectSnackBarState);
    const dispatch = useAppDispatch();
    const [showWindow, setShowWindow] = useState(false);
    const { width } = useWindowDimensions();

    const selectWidth = () => {
        return width > MAX_WIDTH ? MAX_WIDTH : '100%';
    };

    const selectLeft = () => {
        return width > MAX_WIDTH ? (width - MAX_WIDTH) / 2 : 0;
    };

    useEffect(() => {
        setShowWindow(snackBar.visibility);
        if (snackBar.visibility) {
            Animated.sequence([
                Animated.timing(snackBarTopAni, {
                    toValue: 0,
                    duration: 500,
                    delay: 0,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(snackBarTopAni, {
                    toValue: SNACK_BAR_HEIGHT,
                    duration: 500,
                    delay: 2000,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]).start((result) => {
                dispatch(hideSnackBar());
            });
        }
    }, [dispatch, snackBar.visibility, snackBarTopAni]);

    if (!showWindow) return null;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: 0,
                left: selectLeft(),
                width: selectWidth(),
                transform: [{ translateY: snackBarTopAni }],
            }}
        >
            <View style={[styles.container, { backgroundColor: theme.color.primary }]}>
                <Text style={styles.text}>{snackBar.text}</Text>
            </View>
        </Animated.View>
    );
}
