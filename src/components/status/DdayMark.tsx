/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import { ddayCalc } from '~/utils/time';

const styles = StyleSheet.create({
    contents: {},
    topFonts: { color: 'white', fontSize: 14, lineHeight: 17 },
    typeFonts: { fontSize: 11, lineHeight: 13 },
});

interface DdayMarkProps {
    deadline: string | undefined;
    type: EnumProposalType | undefined;
    top?: boolean;
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

function DdayMark(props: DdayMarkProps): JSX.Element {
    const { deadline, type, top } = props;
    const themeContext = useContext(ThemeContext);
    let fontStyle: StyleProp<TextStyle> = [];

    if (top) {
        fontStyle = [globalStyle.gbtext, styles.topFonts];
    } else {
        switch (type) {
            case EnumProposalType.Business:
                fontStyle = [globalStyle.gbtext, styles.typeFonts, { color: themeContext.color.business }];
                break;
            case EnumProposalType.System:
            default:
                fontStyle = [globalStyle.gbtext, styles.typeFonts, { color: themeContext.color.system }];
                break;
        }
    }

    return (
        <View style={styles.contents}>
            <Text style={fontStyle}>{ddayCalc(deadline)}</Text>
        </View>
    );
}

export default DdayMark;

DdayMark.defaultProps = {
    top: false,
};
