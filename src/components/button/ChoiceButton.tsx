import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Text } from 'react-native-elements';

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
    let baseColor = 'rgb(222, 212, 248)'; // primary op
    let iconName = 'radio-button-unchecked';

    if (isActive) {
        baseColor = 'rgba(112, 58, 222, 100)'; // primary
        iconName = 'radio-button-checked';
    }

    return (
        <View style={styles.contents}>
            <TouchableOpacity onPress={onPress}>
                <Icon name={iconName} size={28} color={baseColor} tvParallaxProperties={undefined} />
            </TouchableOpacity>
            <Text style={styles.texts}>{text}</Text>
        </View>
    );
}

export default ButtonContent;
