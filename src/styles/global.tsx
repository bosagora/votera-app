import { Platform, StyleSheet } from 'react-native';
import { theme } from '~/theme/theme';

const globalStyle = StyleSheet.create({
    btext: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontWeight: '700',
        },
        default: {
            fontFamily: 'NotoSansCJKkrBold',
            fontWeight: 'bold',
        },
    }),
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
    headerTitle: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontSize: 16,
            fontWeight: '700',
        },
        default: {
            fontFamily: 'NotoSansCJKkrBold',
            fontSize: 16,
            fontWeight: 'bold',
        },
    }),
    inputLabel: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontSize: 10,
            fontWeight: '500',
            letterSpacing: 1.3,
            marginBottom: 6,
        },
        default: {
            fontFamily: 'NotoSansCJKkrMedium',
            fontSize: 10,
            letterSpacing: 1.3,
            marginBottom: 6,
        },
    }),
    lineComponent: {
        backgroundColor: 'rgb(235,234,239)',
        height: 1,
        marginVertical: 30,
        width: '100%',
    },
    ltext: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontWeight: '300',
        },
        default: {
            fontFamily: 'NotoSansCJKkrLight',
            fontWeight: '300',
        },
    }),
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
    metaTitle: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontSize: 14,
            fontWeight: '400',
        },
        default: {
            fontFamily: 'NotoSansCJKkrRegular',
            fontSize: 14,
        },
    }),
    mtext: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontWeight: '500',
        },
        default: {
            fontFamily: 'NotoSansCJKkrMedium',
        },
    }),
    rltext: Platform.select({
        web: {
            fontFamily: 'Roboto',
            fontWeight: '300',
        },
        default: {
            fontFamily: 'RobotoLight',
        },
    }),
    rmtext: Platform.select({
        web: {
            fontFamily: 'Roboto',
            fontWeight: '500',
        },
        default: {
            fontFamily: 'RobotoMedium',
        },
    }),
    rrtext: Platform.select({
        web: {
            fontFamily: 'Roboto',
            fontWeight: '400',
        },
        default: {
            fontFamily: 'RobotoRegular',
        },
    }),
    rtext: Platform.select({
        web: {
            fontFamily: `'Noto Sans KR', sans-serif`,
            fontWeight: '400',
        },
        default: {
            fontFamily: 'NotoSansCJKkrRegular',
        },
    }),
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
