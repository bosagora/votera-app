import React, { useState, useEffect } from 'react';
import { View, StyleProp, ViewStyle, TouchableOpacity, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { ArrowBackIcon, ClearIcon } from '~/components/icons';
import styles from './style';

interface CellProps {
    symbol: number;
    onPress: () => void;
    cellStyle: StyleProp<ViewStyle>;
}

function Cell(props: CellProps): JSX.Element {
    const { symbol, onPress, cellStyle } = props;
    return (
        <TouchableOpacity style={[styles.cell, cellStyle]} key={symbol} onPress={onPress}>
            <Text style={[globalStyle.gmtext, { fontSize: 19 }]}>{symbol}</Text>
        </TouchableOpacity>
    );
}

interface RowProps {
    symbols: number[];
    onPress: (val: number | string) => void;
    cellStyle: StyleProp<ViewStyle>;
    rowStyle: StyleProp<ViewStyle>;
}

function Row(props: RowProps): JSX.Element {
    const { symbols, cellStyle, rowStyle, onPress } = props;
    const cells = symbols.map((v) => (
        <Cell key={`cell_${v}`} symbol={v} cellStyle={cellStyle} onPress={() => onPress(v)} />
    ));
    return <View style={[styles.row, rowStyle]}>{cells}</View>;
}

interface VirtualNumericKeypadProps {
    style?: StyleProp<ViewStyle>;
    rowStyle?: StyleProp<ViewStyle>;
    cellStyle?: StyleProp<ViewStyle>;
    numberStyle?: StyleProp<TextStyle>;
    onChange: (val: string) => void;
    value: string;
    maxLength: number;
}

function VirtualNumericKeypad(props: VirtualNumericKeypadProps): JSX.Element {
    const { value, style, rowStyle, cellStyle, onChange, maxLength } = props;
    const [password, setPassword] = useState('');

    useEffect(() => {
        setPassword(value);
    }, [value]);

    const onPress = (val: number | string) => {
        if (typeof val === 'string') {
            if (val === 'back') {
                setPassword(password.slice(0, -1));
                onChange(password.slice(0, -1));
            } else {
                setPassword('');
                onChange('');
            }
        } else {
            if (password.length >= maxLength) return;
            setPassword(`${password}${val}`);
            onChange(`${password}${val}`);
        }
    };

    return (
        <View style={[styles.container, style]}>
            <Row symbols={[1, 2, 3]} cellStyle={cellStyle} rowStyle={rowStyle} onPress={onPress} />
            <Row symbols={[4, 5, 6]} cellStyle={cellStyle} rowStyle={rowStyle} onPress={onPress} />
            <Row symbols={[7, 8, 9]} cellStyle={cellStyle} rowStyle={rowStyle} onPress={onPress} />
            <View style={[styles.row, rowStyle]}>
                <TouchableOpacity style={[styles.cell, cellStyle]} onPress={() => onPress('clear')}>
                    <ClearIcon color="black" />
                </TouchableOpacity>
                <Cell symbol={0} onPress={() => onPress(0)} cellStyle={cellStyle} />
                <TouchableOpacity style={[styles.cell, cellStyle]} onPress={() => onPress('back')}>
                    <ArrowBackIcon color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default VirtualNumericKeypad;
