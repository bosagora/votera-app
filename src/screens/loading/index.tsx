/* eslint-disable import/extensions */
/* eslint-disable camelcase, global-require, @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useContext } from 'react';
import { useFonts } from 'expo-font';
import { useVoteraConfigurationQuery } from '~/graphql/generated/generated';
import { AuthContext } from '~/contexts/AuthContext';
import { setAppUpdate } from '~/utils/device';
import { setAgoraConf, setFeePolicy } from '~/utils/votera/agoraconf';
import { useAppDispatch } from '~/state/hooks';
import { hideSnackBar } from '~/state/features/snackBar';

interface LoadingProps {
    onComplete: () => void;
}

function Loading(props: LoadingProps): JSX.Element | null {
    const { onComplete } = props;
    const dispatch = useAppDispatch();
    const { loaded } = useContext(AuthContext);
    const { loading: configLoading } = useVoteraConfigurationQuery({
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (data?.version) {
                setAppUpdate(data.version);
            }
            if (data?.agora) {
                setAgoraConf(data.agora);
            }
            if (data?.feePolicy) {
                setFeePolicy(data.feePolicy);
            }
        },
    });
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

    useEffect(() => {
        dispatch(hideSnackBar());
    }, [dispatch]);

    useEffect(() => {
        if (fontLoaded && !configLoading && loaded) onComplete();
    }, [fontLoaded, configLoading, loaded, onComplete]);

    return null;
}

export default Loading;
