import React, { useContext, useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Input, InputProps } from 'react-native-elements';
import { IconNode } from 'react-native-elements/dist/icons/Icon';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    placeholderText: string;
    searchValue: string;
    subComponent?: IconNode;
    koreanInput?: boolean;
    borderColor?: string;
    textDisable?: boolean;
}

const styles = StyleSheet.create({
    contents: {
        alignItems: 'center',
        backgroundColor: 'rgb(252, 251, 255)',
        borderRadius: 25,
        borderWidth: 2,
        flexDirection: 'row',
        height: 52,
        paddingLeft: 10,
    },
    input: {
        fontSize: 14,
        outlineStyle: 'none',
    },
    inputContainerStyle: {
        borderBottomWidth: 0,
        flex: 1,
    },
});

function TextInputComponent(props: TextInputComponentProps): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const {
        inputStyle,
        inputContainerStyle,
        placeholderTextColor = themeContext.color.placeholder,
        placeholderText,
        searchValue,
        onChangeText,
        koreanInput,
        style,
        subComponent,
        borderColor = themeContext.color.primary,
        textDisable,
        ...otherProps
    } = props;
    // const [isFocused, setIsFocused] = useState(false);
    const [changed, setChanged] = useState(false);
    const [value, setValue] = useState<string>('');

    useEffect(() => {
        if (searchValue) {
            setChanged(true);
            setValue(searchValue);
        }
    }, [searchValue]);

    if (Platform.OS === 'ios' && !!koreanInput) {
        if (changed) delete otherProps.value;
        return (
            <View style={[styles.contents, { borderColor }]}>
                <Input
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    value={searchValue.length === 0 ? '' : value}
                    disabled={textDisable}
                    disabledInputStyle={{ color: themeContext.color.primary, opacity: 1 }}
                    onChangeText={(text) => {
                        setChanged(true);
                        if (onChangeText) {
                            onChangeText(text);
                            setValue(text);
                        }
                        if (text.length === 0) {
                            setChanged(false);
                            setValue('');
                        }
                    }}
                    renderErrorMessage={false}
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    inputStyle={[globalStyle.btext, styles.input, { color: themeContext.color.primary }, inputStyle]}
                    inputContainerStyle={[styles.inputContainerStyle]}
                    placeholderTextColor={placeholderTextColor}
                    placeholder={placeholderText}
                    rightIcon={changed ? subComponent : undefined}
                    autoCompleteType={undefined}
                />
            </View>
        );
    }
    return (
        <View style={[styles.contents, { borderColor }, style]}>
            <Input
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                onChangeText={onChangeText}
                disabled={textDisable}
                disabledInputStyle={{ color: themeContext.color.primary }}
                renderErrorMessage={false}
                allowFontScaling={false}
                autoCorrect={false}
                autoCapitalize="none"
                inputStyle={[globalStyle.btext, styles.input, { color: themeContext.color.primary }, inputStyle]}
                inputContainerStyle={[styles.inputContainerStyle]}
                placeholder={placeholderText}
                placeholderTextColor={placeholderTextColor}
                selectionColor={themeContext.color.primary}
                rightIcon={subComponent}
                autoCompleteType={undefined}
            />
        </View>
    );
}

export default TextInputComponent;

TextInputComponent.defaultProps = {
    koreanInput: false,
    textDisable: false,
};
