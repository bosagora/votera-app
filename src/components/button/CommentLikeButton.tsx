import React, { useContext } from 'react';
import { Image, ImageURISource } from 'react-native';
import { Button, ButtonProps } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';

enum EnumIconAsset {
    LikeIcon = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/comment/likeIcon.png')];

interface HeaderProps extends ButtonProps {
    onPress: () => void;
    likeCount: number;
    isLiked: boolean;
}

function CommentLikeButton(props: HeaderProps): JSX.Element {
    const { onPress, likeCount, isLiked, ...otherProps } = props;
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(iconAssets);

    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            onPress={onPress}
            icon={assets ? <Image source={assets[EnumIconAsset.LikeIcon] as ImageURISource} /> : undefined}
            type="outline"
            buttonStyle={[
                {
                    paddingHorizontal: 10,
                    paddingVertical: 5.5,
                    borderColor: isLiked ? themeContext.color.primary : themeContext.color.boxBorder,
                    backgroundColor: isLiked ? themeContext.color.boxBorder : themeContext.color.white,
                    borderWidth: 1,
                    borderRadius: 6,
                    height: 25,
                },
                otherProps.buttonStyle,
            ]}
            title={likeCount.toString()}
            titleStyle={[
                {
                    fontSize: 10,
                    fontWeight: isLiked ? 'bold' : 'normal',
                    color: isLiked ? themeContext.color.primary : themeContext.color.textBlack,
                    marginLeft: 4,
                },
                otherProps.titleStyle,
            ]}
        />
    );
}

export default CommentLikeButton;
