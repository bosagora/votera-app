import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, BackHandler } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet';
import { useAppDispatch, useAppSelector } from '~/state/hooks';
import { selectBottomSheetState, hideBottomSheet } from '~/state/features/bottomSheet';

export default function BottomSheetComponent(): JSX.Element | null {
    const dispatch = useAppDispatch();
    const bottomSheet = useAppSelector(selectBottomSheetState);
    const sheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        if (bottomSheet.visibility) {
            const backAction = () => {
                dispatch(hideBottomSheet());
                return true;
            };
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            sheetRef?.current?.snapTo(0);
            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
            return () => backHandler.remove();
        }
        return () => {
            // console.log('no-op');
        };
    }, [bottomSheet.visibility, dispatch]);

    if (!bottomSheet.visibility) return null;

    return (
        <>
            {bottomSheet.visibility && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        sheetRef?.current?.snapTo(1);
                    }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                />
            )}
            <BottomSheet
                onCloseEnd={() => dispatch(hideBottomSheet())}
                ref={sheetRef}
                snapPoints={[bottomSheet.sheetHeight || 0, 0]}
                renderContent={bottomSheet.bodyComponent}
                initialSnap={1}
                renderHeader={() => (
                    <View
                        style={{
                            height: 24,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <View style={{ width: 33, height: 4, borderRadius: 2, backgroundColor: '#EDEDED' }} />
                    </View>
                )}
            />
        </>
    );
}
