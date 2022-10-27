import { Platform } from 'react-native';

const theme = {
    Header: {
        containerStyle: {
            backgroundColor: 'white',
            height: 60,
            borderBottomWidth: 0,
        },
    },
    Text: {
        style: Platform.select({
            web: {
                fontSize: 14,
                color: 'rgb(71,71,75)',
                fontFamily: `'Noto Sans KR', sans-serif`,
                fontWeight: '400',
            },
            default: {
                fontSize: 14,
                color: 'rgb(71,71,75)',
                fontFamily: 'NotoSansCJKkrRegular',
            },
        }),
    },
    colors: {
        primary: 'rgb(112,58,222)',
    },
};

export default theme;
