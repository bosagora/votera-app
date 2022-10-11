/* eslint-disable @typescript-eslint/no-unsafe-assignment, import/extensions, global-require */
import React from 'react';
import { useFonts, FontDisplay } from 'expo-font';
import { Platform } from 'react-native';

export function useVoteraFonts(): [boolean, Error | null] {
    const [fontLoaded, error] = useFonts({
        GmarketSansTTFBold: {
            uri: 'https://cdn.jsdelivr.net/gh/webfontworld/gmarket/GmarketSansBold.woff',
            display: FontDisplay.SWAP,
        },
        GmarketSansTTFMedium: {
            uri: 'https://cdn.jsdelivr.net/gh/webfontworld/gmarket/GmarketSansMedium.woff',
            display: FontDisplay.SWAP,
        },
        // NotoSansCJKkrBold: require('@assets/fonts/NotoSansCJKkr-Bold.otf'),
        // NotoSansCJKkrLight: require('@assets/fonts/NotoSansCJKkr-Light.otf'),
        // NotoSansCJKkrMedium: require('@assets/fonts/NotoSansCJKkr-Medium.otf'),
        // NotoSansCJKkrRegular: require('@assets/fonts/NotoSansCJKkr-Regular.otf'),
        // RobotoRegular: require('@assets/fonts/Roboto-Regular.ttf'),
        // RobotoMedium: require('@assets/fonts/Roboto-Medium.ttf'),
        // RobotoLight: require('@assets/fonts/Roboto-Light.ttf'),
    });

    const linkElement = document.createElement('link');
    linkElement.href =
        'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Roboto:wght@300;400;500&display=swap';
    linkElement.rel = 'stylesheet';

    document.head.appendChild(linkElement);

    return [fontLoaded, error];
}

export default useVoteraFonts;
