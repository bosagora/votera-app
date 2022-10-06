import { StyleSheet } from 'react-native';
import { theme } from '~/theme/theme';

const globalStyle = StyleSheet.create({
    btext: {
        fontFamily: 'NotoSansCJKkrBold',
        fontWeight: 'bold',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexRowAlignCenter: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    flexRowBetween: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gbtext: {
        fontFamily: 'GmarketSansTTFBold',
    },
    gmtext: {
        fontFamily: 'GmarketSansTTFMedium',
    },
    headerBackground: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: 10,
        top: -10,
    },
    headerBottomLine: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontFamily: 'NotoSansCJKkrBold',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputLabel: {
        fontFamily: 'NotoSansCJKkrMedium',
        fontSize: 10,
        letterSpacing: 1.3,
        marginBottom: 6,
    },
    lineComponent: {
        backgroundColor: 'rgb(235,234,239)',
        height: 1,
        marginVertical: 30,
        width: '100%',
    },
    ltext: {
        fontFamily: 'NotoSansCJKkrLight',
        fontWeight: '300',
    },
    metaButton: {
        alignItems: 'center',
        borderRadius: 20,
        height: 31,
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
        width: 114,
    },
    metaTitle: {
        fontFamily: 'NotoSansCJKkrRegular',
        fontSize: 14,
    },
    mtext: {
        fontFamily: 'NotoSansCJKkrMedium',
    },
    rltext: {
        fontFamily: 'RobotoLight',
    },
    rmtext: {
        fontFamily: 'RobotoMedium',
    },
    rtext: {
        fontFamily: 'NotoSansCJKkrRegular',
    },
    shortSmall: {
        backgroundColor: 'transparent',
        borderRadius: 6,
        height: 26,
        padding: 0,
        width: 61,
    },
    size10spacing13: {
        color: 'white',
        fontSize: 10,
        letterSpacing: 1.3,
    },
});

export const MAX_WIDTH = 1070;
export const DRAWER_WIDTH = 768;

export function isLargeScreen(width: number) {
    return width >= DRAWER_WIDTH;
}

export default globalStyle;
