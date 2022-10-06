import React, { useContext, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Input, InputProps } from 'react-native-elements';
import { IconNode } from 'react-native-elements/dist/icons/Icon';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgb(252, 251, 255)',
        borderColor: 'rgb(235, 234, 239)',
        borderRadius: 5,
        borderWidth: 2,
        flexDirection: 'row',
        height: 52,
        justifyContent: 'center',
    },
    input: {
        fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'NotoSansCJKkrRegular',
        fontSize: 14,
        lineHeight: 18,
        outlineStyle: 'none',
    },
});

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    subComponent?: IconNode;
    koreanInput?: boolean;
}

function TextInputComponent(props: TextInputComponentProps): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const {
        inputStyle,
        inputContainerStyle,
        labelStyle,
        placeholderTextColor,
        onChangeText,
        koreanInput,
        style,
        subComponent,
        ...otherProps
    } = props;
    // const [isFocused, setIsFocused] = useState(false);
    const [changed, setChanged] = useState(false);

    if (Platform.OS === 'ios' && !!koreanInput) {
        if (changed) delete otherProps.value;
        return (
            <View style={styles.container}>
                <Input
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    onChangeText={(text) => {
                        setChanged(true);
                        if (onChangeText) onChangeText(text);
                    }}
                    renderErrorMessage={false}
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={{ paddingHorizontal: 5 }}
                    inputStyle={styles.input}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    placeholderTextColor={placeholderTextColor}
                    rightIcon={subComponent && subComponent}
                    autoCompleteType={undefined}
                />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Input
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                onChangeText={onChangeText}
                renderErrorMessage={false}
                allowFontScaling={false}
                autoCorrect={false}
                autoCapitalize="none"
                // style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}} // 이 부분 때문에 빨간줄이 뜨는데, 작동은 됨 // 웹에서 Input 클릭했을때 border 안생기는 기능
                inputStyle={[styles.input, inputStyle]}
                inputContainerStyle={[{ borderBottomWidth: 0 }, inputContainerStyle]}
                labelStyle={[globalStyle.inputLabel, labelStyle]}
                placeholderTextColor={placeholderTextColor || themeContext.color.textGray}
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
};
