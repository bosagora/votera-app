/* eslint-disable @typescript-eslint/no-unsafe-assignment, import/extensions, global-require */
import React from 'react';
import { useFonts } from 'expo-font';

export function useVoteraFonts(): [boolean, Error | null] {
    const [fontLoaded, error] = useFonts({
        GmarketSansTTFBold: require('@assets/fonts/GmarketSansTTFBold.ttf'),
        GmarketSansTTFMedium: require('@assets/fonts/GmarketSansTTFMedium.ttf'),
        NotoSansCJKkrBold: require('@assets/fonts/NotoSansCJKkr-Bold.otf'),
        NotoSansCJKkrLight: require('@assets/fonts/NotoSansCJKkr-Light.otf'),
        NotoSansCJKkrMedium: require('@assets/fonts/NotoSansCJKkr-Medium.otf'),
        NotoSansCJKkrRegular: require('@assets/fonts/NotoSansCJKkr-Regular.otf'),
        RobotoRegular: require('@assets/fonts/Roboto-Regular.ttf'),
        RobotoMedium: require('@assets/fonts/Roboto-Medium.ttf'),
        RobotoLight: require('@assets/fonts/Roboto-Light.ttf'),
    });

    return [fontLoaded, error];
}

export default useVoteraFonts;
