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
        borderColor: 'rgb(112, 58, 222)',
        borderRadius: 25,
        borderWidth: 2,
        flexDirection: 'row',
        height: 52,
        paddingLeft: 10,
    },
    input: {
        color: 'rgb(112, 58, 222)',
        fontSize: 14,
        outlineStyle: 'none',
    },
    inputContainerStyle: {
        borderBottomWidth: 0,
    },
});

/*
<TextInput
    onChangeText={(text) => {
        console.log('changeText', text);
    }}
    koreanInput
    subComponent={<Icon onPress={console.log} name="cancel" color="rgb(112, 58, 222)" size={28} />}
/>
*/

function TextInputComponent(props: TextInputComponentProps): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const {
        inputStyle,
        inputContainerStyle,
        placeholderTextColor,
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
                    inputStyle={[globalStyle.btext, styles.input, inputStyle]}
                    inputContainerStyle={[styles.inputContainerStyle]}
                    placeholderTextColor={themeContext.color.placeholder}
                    placeholder={placeholderText}
                    rightIcon={changed ? subComponent : undefined}
                    autoCompleteType={undefined}
                />
            </View>
        );
    }
    return (
        <View style={[styles.contents, style]}>
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
                inputStyle={[globalStyle.btext, styles.input, inputStyle]}
                inputContainerStyle={[styles.inputContainerStyle]}
                placeholder={placeholderText}
                placeholderTextColor={themeContext.color.placeholder}
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
