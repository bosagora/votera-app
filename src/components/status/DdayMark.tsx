/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import { ddayCalc } from '~/utils/time';

interface DdayMarkProps {
    deadline: string | undefined;
    type: EnumProposalType | undefined;
    color?: string;
}

/**
 * ! 폰트 추가 
 * GmarketSansTTFBold
 * 위치 : assets/fonts/GmarketSansTTFBold.ttf
 * 사용법: 
 * * expo install expo-font
 * * import * as Font from 'expo-font'
 * * load font 
 *  Font.loadAsync({
        GmarketSansTTFBold: require('@assets/fonts/GmarketSansTTFBold.ttf'),
    });
    * fontFamily: 'GmarketSansTTFBold'

 * * Component Example
const nextDay = new Date();
nextDay.setDate(new Date().getDate() + 16);
<Dday deadline={nextDay} type="BUSINESS" />
<Dday deadline={nextDay} type="SYSTEM" />
*/

const styles = StyleSheet.create({
    businessFonts: { color: 'rgb(29, 197, 220)' },
    contents: {},
    fonts: {
        fontFamily: 'GmarketSansTTFBold',
        fontSize: 11,
    },
    systemFonts: { color: 'rgb(242, 145, 229)' },
});

function DdayMark(props: DdayMarkProps): JSX.Element {
    const { deadline, type, color } = props;
    let fontStyle: StyleProp<TextStyle> = [];

    switch (type) {
        case 'BUSINESS':
            fontStyle = [styles.fonts, styles.businessFonts];
            break;
        case 'SYSTEM':
            fontStyle = [styles.fonts, styles.systemFonts];
            break;
        default:
            break;
    }
    if (color && color === 'white') {
        fontStyle = [...fontStyle, { color, fontSize: 14 }];
    }

    return (
        <View style={styles.contents}>
            <Text style={fontStyle}>{ddayCalc(deadline)}</Text>
        </View>
    );
}

export default DdayMark;

DdayMark.defaultProps = {
    color: undefined,
};
