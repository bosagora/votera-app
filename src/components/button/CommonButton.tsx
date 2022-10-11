import React, { useContext } from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import { Image, View, ImageURISource } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';
import globalStyle from '~/styles/global';

enum EnumIconAsset {
    RightArrow = 0,
    ArrowGrad,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/arrow/rightArrowWhite.png'), require('@assets/icons/arrow/arrowGrad.png')];

interface CommonButtonProps extends ButtonProps {
    filled?: boolean;
    shadow?: boolean;
}

function CommonButton(props: CommonButtonProps): JSX.Element {
    const { filled, shadow, containerStyle, buttonStyle, titleStyle, icon, ...others } = props;
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(iconAssets);

    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
            containerStyle={[
                {
                    borderRadius: 25,
                },
                containerStyle,
            ]}
            buttonStyle={[
                {
                    borderWidth: 2,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: filled ? themeContext.color.primary : 'white',
                    borderColor: filled ? themeContext.color.primary : 'rgb(222,212,248)',
                },
                buttonStyle,
            ]}
            titleStyle={[
                globalStyle.btext,
                {
                    fontSize: 14,
                    color: filled ? 'white' : themeContext.color.primary,
                },
                titleStyle,
            ]}
            iconRight
            icon={
                icon ||
                (assets ? (
                    <Image
                        source={
                            filled
                                ? (assets[EnumIconAsset.RightArrow] as ImageURISource)
                                : (assets[EnumIconAsset.ArrowGrad] as ImageURISource)
                        }
                    />
                ) : undefined)
            }
        />
    );
}

export default CommonButton;

CommonButton.defaultProps = {
    filled: false,
    shadow: false,
};
