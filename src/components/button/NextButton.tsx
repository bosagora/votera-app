import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';

interface ButtonProps {
    icon?: Image;
    text: string;
    styles: {
        width: number;
        backgroundColor: string;
    };
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
    const { text, styles: styleProps, icon } = props;
    let otherColor = styles.textContents.color;

    // 배경색이 흰색이면 글씨는 기본색
    if (styleProps.backgroundColor === 'white') {
        otherColor = 'rgba(112, 58, 222, 100)'; // FIXME: Global Color 지정
    }
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
                style={[globalStyle.center, styles.contents, styleProps]}
                onPress={() => {
                    console.log('onPress Btn');
                }}
            >
                <View style={{ flexDirection: 'row' }}>
                    <>
                        {icon}
                        <Text style={[globalStyle.btext, styles.textContents, { color: otherColor }]}>{text}</Text>
                    </>
                </View>
                <Icon name="chevron-right" color={otherColor} style={{}} tvParallaxProperties={undefined} />
            </TouchableOpacity>
        </View>
    );
}

export default ButtonContent;
