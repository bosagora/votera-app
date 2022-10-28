import React, { useContext } from 'react';
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
import globalStyle from '~/styles/global';

enum EnumIconAssets {
    PenIcon = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/penIconSvg.png')];

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
    bottom: {
        alignItems: 'flex-end',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 0,
        paddingRight: 13,
        position: 'absolute',
        right: 0,
    },
    inputContent: {
        borderBottomWidth: 0,
        borderRadius: 20,
        height: 128,
        marginBottom: 21.5,
        paddingHorizontal: 23,
        paddingVertical: 20, // onlyRead:false
    },
    inputStyle: {
        fontSize: 13,
        height: '100%',
        lineHeight: 21,
        outlineStyle: 'none',
        padding: 0,
    },
    sizeCaption: { fontSize: 10, lineHeight: 20 },
    writeButton: {
        alignItems: 'center',
        borderRadius: 21.5,
        bottom: 0,
        height: 43,
        justifyContent: 'center',
        width: 43,
    },
    writeButtonImage: { bottom: 1, left: 1 },
});

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    onlyRead: boolean;
    onPress: () => void;
    componentStyle?: StyleProp<ViewStyle>;
    maxInput?: number;
}

function MultilineInput(props: TextInputComponentProps): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const {
        value,
        componentStyle,
        inputStyle,
        inputContainerStyle,
        placeholderTextColor = themeContext.color.placeholder,
        onChangeText,
        onlyRead,
        onPress,
        maxInput,
        ...otherProps
    } = props;
    const [assets] = useAssets(iconAssets);

    function writeBtnComponent() {
        return (
            <View style={styles.bottom}>
                <Text style={[globalStyle.rltext, styles.sizeCaption]}>
                    {maxInput !== undefined && maxInput > 0 ? `${value?.length || 0}/${maxInput}` : ''}
                </Text>
                {assets && (
                    <TouchableOpacity
                        style={[styles.writeButton, { backgroundColor: themeContext.color.primary }]}
                        onPress={onPress}
                    >
                        <Image
                            style={styles.writeButtonImage}
                            source={assets[EnumIconAssets.PenIcon] as ImageURISource}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={componentStyle}>
            <Input
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                value={value}
                onChangeText={(text) => {
                    if (maxInput !== undefined && maxInput > 0) {
                        if (text.length > maxInput) {
                            if (onChangeText) onChangeText(text.slice(0, maxInput));
                            return;
                        }
                    }
                    if (onChangeText) onChangeText(text);
                }}
                disabled={onlyRead}
                multiline
                renderErrorMessage={false}
                allowFontScaling={false}
                autoCorrect={false}
                autoCapitalize="none"
                inputStyle={[
                    Platform.OS === 'android' ? { fontFamily: 'sans-serif' } : globalStyle.rtext,
                    styles.inputStyle,
                    { color: themeContext.color.textBlack },
                    inputStyle,
                ]}
                inputContainerStyle={[
                    styles.inputContent,
                    { backgroundColor: themeContext.color.gray },
                    inputContainerStyle,
                ]}
                placeholderTextColor={placeholderTextColor}
                selectionColor={themeContext.color.primary}
                autoCompleteType={undefined}
                containerStyle={{ paddingHorizontal: 0 }}
            />
            {!onlyRead && writeBtnComponent()}
        </View>
    );
}

export default MultilineInput;

MultilineInput.defaultProps = {
    componentStyle: undefined,
    maxInput: 0,
};
