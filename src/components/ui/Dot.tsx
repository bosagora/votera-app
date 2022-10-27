import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components/native';
import { View } from 'react-native';

interface DotProps {
    active: boolean;
}

function Dot(props: DotProps): JSX.Element {
    const { active } = props;
    const themeContext = useContext(ThemeContext);
    return (
        <View
            style={{
                width: 20,
                height: 20,
                backgroundColor: active ? themeContext.color.primary : 'rgb(235,231,245)',
                marginHorizontal: 9,
                borderRadius: 10,
            }}
        />
    );
}

export default Dot;
