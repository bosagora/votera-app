import React, { useContext, useState } from 'react';
import {
    Platform,
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    ImageURISource,
} from 'react-native';
import { Input, InputProps, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';

enum EnumIconAssets {
    PenIcon = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/penIconSvg.png')];

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    onlyRead: boolean;
    onPress: () => void;
    componentStyle?: StyleProp<ViewStyle>;
}
/*
 <View style={{ backgroundColor: 'white' }}>
    <MultiInputBox
        onChangeText={(text) => {
            console.log('이 콜백으로 데이터가 입력됩니다.', text);
        }}
        onlyRead={false}
        showText="onlyRead=true 읽기 전용 텍스트"
    />
</View>
*/
const styles = StyleSheet.create({
    inputContent: {
        backgroundColor: 'rgb(242, 244, 250)',
        borderRadius: 20,
        height: 128,
        marginBottom: 21.5,
        paddingHorizontal: 23,
        paddingVertical: 20, // onlyRead:false
    },
    inputStyle: {
        fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'NotoSansCJKkrRegular',
        fontSize: 13,
        lineHeight: 21,
        outlineStyle: 'none',
        padding: 0,
    },
    writeButton: {
        alignItems: 'center',
        backgroundColor: 'rgb(112, 58, 222)',
        borderRadius: 21.5,
        bottom: 0,
        height: 43,
        justifyContent: 'center',
        shadowColor: 'rgb(120,100,176)',
        shadowOffset: {
            height: 10,
            width: 0,
        },
        shadowOpacity: 0.29,
        width: 43,
    },
    writeContent: {
        alignItems: 'flex-end',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 0,
        paddingHorizontal: 23,
        position: 'absolute',
        right: 0,
    },
});

function MultilineInput(props: TextInputComponentProps): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const {
        value,
        componentStyle,
        inputStyle,
        inputContainerStyle,
        placeholderTextColor,
        onChangeText,
        onlyRead,
        onPress,
        ...otherProps
    } = props;
    const [assets] = useAssets(iconAssets);

    function writeBtnComponent() {
        return (
            <View style={styles.writeContent}>
                <Text style={{ fontSize: 10 }}>{`${value?.length || 0}/300`}</Text>
                {assets && (
                    <TouchableOpacity style={styles.writeButton} onPress={onPress}>
                        <Image
                            style={{ bottom: 1, left: 1 }}
                            source={assets[EnumIconAssets.PenIcon] as ImageURISource}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={componentStyle}>
            <View style={styles.inputContent}>
                <Input
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    value={value}
                    onChangeText={(text) => {
                        if (onChangeText) onChangeText(text);
                    }}
                    disabled={onlyRead}
                    multiline
                    renderErrorMessage={false}
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    // style={{ minHeight: 0, paddingTop: 0 }}
                    // containerStyle={{ paddingHorizontal: 0, paddingVertical: 0 }}
                    inputStyle={[styles.inputStyle, inputStyle]}
                    inputContainerStyle={[{ borderBottomWidth: 0 }, inputContainerStyle]}
                    placeholderTextColor={placeholderTextColor || themeContext.color.primary}
                    selectionColor={themeContext.color.primary}
                    autoCompleteType={undefined}
                />
            </View>
            {!onlyRead && writeBtnComponent()}
        </View>
    );
}

export default MultilineInput;

MultilineInput.defaultProps = {
    componentStyle: undefined,
};
