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
    bottom: {
        alignItems: 'flex-end',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 0,
        paddingRight: 23,
        position: 'absolute',
        right: 0,
    },
    inputContent: {
        borderRadius: 20,
        height: 128,
        marginBottom: 21.5,
        paddingHorizontal: 23,
        paddingVertical: 20, // onlyRead:false
    },
    inputStyle: {
        fontSize: 13,
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
            <View style={styles.bottom}>
                <Text style={[globalStyle.rltext, styles.sizeCaption]}>{`${value?.length || 0}/300`}</Text>
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
            <View style={[styles.inputContent, { backgroundColor: themeContext.color.gray }]}>
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
                    inputStyle={[
                        Platform.OS === 'android' ? { fontFamily: 'sans-serif' } : globalStyle.rtext,
                        styles.inputStyle,
                        { color: themeContext.color.textBlack },
                        inputStyle,
                    ]}
                    inputContainerStyle={[{ borderBottomWidth: 0 }, inputContainerStyle]}
                    placeholderTextColor={placeholderTextColor || themeContext.color.placeholder}
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
