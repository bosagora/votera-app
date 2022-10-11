/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { getPeriodText } from '~/utils/time';

const styles = StyleSheet.create({
    periods: { fontSize: 12 },
    types: { fontSize: 11, paddingRight: 13 },
});

interface PeriodProps {
    type: string;
    typeStyle?: StyleProp<TextStyle>;
    periodStyle?: StyleProp<TextStyle>;
    created: string | undefined | null;
    deadline: string | undefined | null;
    color?: string;
}

function Period(props: PeriodProps): JSX.Element {
    const { type, created, deadline, color, typeStyle, periodStyle } = props;

    return (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={[globalStyle.mtext, styles.types, { color }, typeStyle]}>{type}</Text>
            <Text style={[globalStyle.rrtext, styles.periods, { color }, periodStyle]}>
                {getPeriodText(created, deadline)}
            </Text>
        </View>
    );
}

export default Period;

Period.defaultProps = {
    typeStyle: undefined,
    periodStyle: undefined,
    color: undefined,
};
