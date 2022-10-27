/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

const styles = StyleSheet.create({
    contents: {
        alignItems: 'center',
        borderRadius: 6,
        height: 22,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    labelText: { color: 'white', fontSize: 10, lineHeight: 20 },
    transparentContents: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderColor: 'white',
        borderRadius: 6,
        borderStyle: 'solid',
        borderWidth: 1,
        height: 22,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
});

interface HeaderProps {
    type: EnumProposalType;
    transparent: boolean;
}

function StatusMark(props: HeaderProps): JSX.Element {
    const { type, transparent } = props;
    const themeContext = useContext(ThemeContext);
    let componentStyle: StyleProp<ViewStyle> = [];

    if (transparent) {
        componentStyle = styles.transparentContents;
    } else {
        switch (type) {
            case EnumProposalType.Business:
                componentStyle = [styles.contents, { backgroundColor: themeContext.color.business }];
                break;
            case EnumProposalType.System:
            default:
                componentStyle = [styles.contents, { backgroundColor: themeContext.color.system }];
                break;
        }
    }

    return (
        <View style={componentStyle}>
            <Text style={[globalStyle.mtext, styles.labelText]}>
                {type === EnumProposalType.Business ? getString('사업제안') : getString('시스템제안')}
            </Text>
        </View>
    );
}

export default StatusMark;
