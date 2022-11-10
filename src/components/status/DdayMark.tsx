/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import {
    Enum_Proposal_Type as EnumProposalType,
    Enum_Proposal_Status as EnumProposalStatus,
} from '~/graphql/generated/generated';
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
    status: EnumProposalStatus | undefined;
    top?: boolean;
}

function DdayMark(props: DdayMarkProps): JSX.Element {
    const { deadline, type, status, top } = props;
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

    const displayDday = () => {
        switch (status) {
            case EnumProposalStatus.Cancel:
            case EnumProposalStatus.Closed:
            case EnumProposalStatus.Deleted:
            case EnumProposalStatus.Reject:
                return '';
            default:
                return ddayCalc(deadline);
        }
    };

    return (
        <View style={styles.contents}>
            <Text style={fontStyle}>{displayDday()}</Text>
        </View>
    );
}

export default DdayMark;

DdayMark.defaultProps = {
    top: false,
};
