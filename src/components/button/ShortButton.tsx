import React, { useContext } from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';

interface Props extends ButtonProps {
    filled?: boolean;
}

function ShortButton(props: Props): JSX.Element {
    const { filled, buttonStyle, titleStyle, ...others } = props;
    const themeContext = useContext(ThemeContext);
    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
            buttonStyle={[
                {
                    width: 83,
                    borderRadius: 5,
                    backgroundColor: filled ? themeContext.color.primary : 'white',
                    borderWidth: 1,
                    borderColor: themeContext.color.primary,
                },
                buttonStyle,
            ]}
            titleStyle={[
                globalStyle.btext,
                {
                    fontSize: 15,
                    color: filled ? 'white' : themeContext.color.primary,
                },
                titleStyle,
            ]}
        />
    );
}

export default ShortButton;

ShortButton.defaultProps = {
    filled: false,
};
