/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';

interface PeriodBlockProps {
    type: string;
    typeStyle?: StyleProp<TextStyle>;
    periodStyle?: StyleProp<TextStyle>;
    start: number | undefined | null;
    end: number | undefined | null;
    color?: string;
}

const styles = StyleSheet.create({
    periods: { fontSize: 12 },
    types: { fontSize: 11, paddingRight: 13 },
});

function PeriodBlock(props: PeriodBlockProps): JSX.Element {
    const { type, start, end, color, typeStyle, periodStyle } = props;

    return (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={[globalStyle.mtext, styles.types, { color }, typeStyle]}>{type}</Text>
            <Text style={[globalStyle.rrtext, styles.periods, { color }, periodStyle]}>
                {start} - {end}
            </Text>
        </View>
    );
}

export default PeriodBlock;

PeriodBlock.defaultProps = {
    typeStyle: undefined,
    periodStyle: undefined,
    color: undefined,
};
