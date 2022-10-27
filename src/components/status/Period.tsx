/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import { getPeriodText } from '~/utils/time';

const styles = StyleSheet.create({
    periods: { fontSize: 12, letterSpacing: 0.48, lineHeight: 20 },
    types: { fontSize: 11, lineHeight: 19, paddingRight: 13 },
});

interface PeriodProps {
    type: string;
    typeStyle?: StyleProp<TextStyle>;
    periodStyle?: StyleProp<TextStyle>;
    created: string | undefined | null;
    deadline: string | undefined | null;
    top?: boolean;
}

function Period(props: PeriodProps): JSX.Element {
    const { type, created, deadline, top, typeStyle, periodStyle } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text
                style={[
                    globalStyle.mtext,
                    top ? { color: 'white' } : { color: themeContext.color.textBlack },
                    styles.types,
                    typeStyle,
                ]}
            >
                {type}
            </Text>
            <Text
                style={[
                    top
                        ? [globalStyle.rrtext, { color: 'white' }]
                        : [globalStyle.rltext, { color: themeContext.color.textBlack }],
                    styles.periods,
                    periodStyle,
                ]}
            >
                {getPeriodText(created, deadline)}
            </Text>
        </View>
    );
}

export default Period;

Period.defaultProps = {
    typeStyle: undefined,
    periodStyle: undefined,
    top: false,
};
