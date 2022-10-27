import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';

interface ButtonProps {
    text: string;
    isActive: boolean;
    onPress: () => void;
}

const styles = StyleSheet.create({
    contents: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    texts: {
        paddingHorizontal: 13,
    },
});

function ButtonContent(props: ButtonProps): JSX.Element {
    const { text, onPress } = props;
    const { isActive = false } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View style={styles.contents}>
            <TouchableOpacity onPress={onPress}>
                <Icon
                    name={isActive ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={28}
                    color={isActive ? themeContext.color.primary : themeContext.color.boxBorder}
                    tvParallaxProperties={undefined}
                />
            </TouchableOpacity>
            <Text style={styles.texts}>{text}</Text>
        </View>
    );
}

export default ButtonContent;
