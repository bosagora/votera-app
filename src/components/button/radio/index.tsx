import React, { useContext } from 'react';
import { View, StyleProp, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';

const styles = StyleSheet.create({
    buttonStyle: {
        alignItems: 'center',
        borderColor: 'rgb(222, 212, 248)',
        borderRadius: 16,
        borderWidth: 2,
        height: 31,
        justifyContent: 'center',
        marginRight: 13,
        width: 31,
    },
});

interface Props {
    buttonStyle: StyleProp<ViewStyle>;
    buttonDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    data: { label: string }[];
    selectedIndex: number;
    onChange: (idx: number) => void;
}

interface ButtonProps {
    label: string;
}

function RadioButton(props: Props): JSX.Element {
    const { buttonStyle, selectedIndex, buttonDirection, data, onChange } = props;
    const themeContext = useContext(ThemeContext);
    const makeButton = (buttonData: ButtonProps, index: number) => {
        return (
            <TouchableOpacity
                key={`radiobtn_${index}`}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 28 }}
                onPress={() => onChange(index)}
            >
                <View style={[styles.buttonStyle, buttonStyle]}>
                    {selectedIndex === index && (
                        <View
                            style={{
                                width: 13,
                                height: 13,
                                borderRadius: 7,
                                backgroundColor: themeContext.color.primary,
                            }}
                        />
                    )}
                </View>
                <Text>{buttonData.label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flexDirection: buttonDirection }}>
            {data.map((buttonData, index) => {
                return makeButton(buttonData, index);
            })}
        </View>
    );
}

RadioButton.defaultProps = {
    buttonDirection: 'row',
};

export default RadioButton;
