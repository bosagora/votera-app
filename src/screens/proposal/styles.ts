import { Dimensions, Platform, StyleSheet } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
export const STATUS_BAR_HEIGHT = Platform.select({ ios: IS_IPHONE_X ? 44 : 20, default: 0 });
export const HEADER_HEIGHT = Platform.select({ ios: IS_IPHONE_X ? 88 : 64, default: 64 });
export const NAV_BAR_HEIGHT = HEADER_HEIGHT - STATUS_BAR_HEIGHT;

const styles = StyleSheet.create({
    container: {},
    contentContainer: {
        flexGrow: 1,
    },
    navBar: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        flexDirection: 'row',
        height: NAV_BAR_HEIGHT,
        justifyContent: 'space-between',
    },
    navContainer: {
        height: HEADER_HEIGHT,
        marginHorizontal: 10,
    },
    statusBar: {
        backgroundColor: 'transparent',
        height: STATUS_BAR_HEIGHT,
    },
});

export default styles;
