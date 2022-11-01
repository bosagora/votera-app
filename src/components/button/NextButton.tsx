import React, { useContext } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import { ChevronRightIcon } from '~/components/icons';

interface ButtonProps {
    icon?: Image;
    text: string;
    filled: boolean;
    styles?: StyleProp<ViewStyle> | undefined;
}

const styles = StyleSheet.create({
    contents: {
        backgroundColor: 'rgba(112, 58, 222, 100)',
        borderRadius: 25,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-between',
        paddingHorizontal: 27,
    },
    textContents: {
        color: 'white',
        fontSize: 15,
        marginLeft: 10,
        textAlign: 'center',
    },
});

function ButtonContent(props: ButtonProps): JSX.Element {
    const { text, styles: styleProps, icon, filled } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
                style={[
                    globalStyle.center,
                    styles.contents,
                    { backgroundColor: filled ? themeContext.color.primary : themeContext.color.white },
                    styleProps,
                ]}
                onPress={() => {
                    console.log('onPress Btn');
                }}
            >
                <View style={{ flexDirection: 'row' }}>
                    <>
                        {icon}
                        <Text
                            style={[
                                globalStyle.btext,
                                styles.textContents,
                                { color: filled ? themeContext.color.white : themeContext.color.primary },
                            ]}
                        >
                            {text}
                        </Text>
                    </>
                </View>
                <ChevronRightIcon color={filled ? themeContext.color.white : themeContext.color.primary} />
            </TouchableOpacity>
        </View>
    );
}

export default ButtonContent;

ButtonContent.defaultProps = {
    icon: undefined,
    styles: undefined,
};
