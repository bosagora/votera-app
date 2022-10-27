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
    dateBox: {
        alignItems: 'center',
        position: 'absolute',
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
    period: { fontSize: 12, letterSpacing: 0.48, lineHeight: 20 },
    periodText: { fontSize: 13, lineHeight: 22 },
    statusBar: {
        backgroundColor: 'transparent',
        height: STATUS_BAR_HEIGHT,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        width: '70%',
    },
    titleText: {
        color: 'white',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
        width: '100%',
    },
    typeBox: {
        alignItems: 'center',
        borderColor: 'white',
        borderRadius: 6,
        borderWidth: 1,
        height: 23,
        justifyContent: 'center',
        position: 'absolute',
        width: 64,
    },
    typeText: { color: 'white', fontSize: 10, lineHeight: 20 },
});

export default styles;
