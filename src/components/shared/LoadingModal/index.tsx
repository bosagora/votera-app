/* eslint-disable global-require, @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useAppSelector, useAppDispatch } from '~/state/hooks';
import { selectLoadingAniModalState, hideLoadingAniModal } from '~/state/features/loadingAniModal';
import LoadingModalScreen from './screen';

export default function LoadingAniModal(): JSX.Element | null {
    const loadingAniModal = useAppSelector(selectLoadingAniModalState);
    const dispatch = useAppDispatch();

    useEffect(() => {
        let tm: NodeJS.Timeout;
        if (loadingAniModal.visibility) {
            tm = setTimeout(() => {
                if (Platform.OS === 'web') {
                    window.prompt('Loading failed');
                } else {
                    Alert.alert('Loading failed');
                }
                dispatch(hideLoadingAniModal());
            }, 180000);
        }
        return () => {
            if (tm) {
                clearTimeout(tm);
            }
        };
    }, [loadingAniModal.visibility, dispatch]);

    if (!loadingAniModal.visibility) return null;
    return <LoadingModalScreen />;
}
