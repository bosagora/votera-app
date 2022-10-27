import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';

import globalStyle from '~/styles/global';

interface TitleProps {
    text: string;
    isRequired: boolean;
}
/*
<TitleText text="제안 유형" isRequired />
<TitleText text="제안 유형" isRequired={false} />
*/

const styles = StyleSheet.create({
    contents: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    dots: {
        backgroundColor: 'rgb(240, 109, 63)',
        borderRadius: 3,
        height: 3,
        width: 3,
    },
    texts: {
        paddingRight: 11,
    },
});

function Dot() {
    return <View style={styles.dots} />;
}

function TitleContent(props: TitleProps): JSX.Element {
    const { text, isRequired } = props;

    return (
        <View style={styles.contents}>
            <Text style={[globalStyle.btext, styles.texts]}>{text}</Text>
            {isRequired && <Dot />}
        </View>
    );
}

export default TitleContent;
