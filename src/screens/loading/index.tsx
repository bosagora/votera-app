import React, { useEffect, useContext } from 'react';
import { useVoteraConfigurationQuery } from '~/graphql/generated/generated';
import { AuthContext } from '~/contexts/AuthContext';
import { setAppUpdate } from '~/utils/device';
import { setAgoraConf, setFeePolicy } from '~/utils/votera/agoraconf';
import { useAppDispatch } from '~/state/hooks';
import { hideSnackBar } from '~/state/features/snackBar';
import { loadFont } from '~/components/icons';

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

    useEffect(() => {
        dispatch(hideSnackBar());
    }, [dispatch]);

    useEffect(() => {
        if (!configLoading && loaded) {
            const asyncHandler = async () => {
                await loadFont();
                onComplete();
            };
            asyncHandler().catch(console.log);
        }
    }, [configLoading, loaded, onComplete]);

    return null;
}

export default Loading;
