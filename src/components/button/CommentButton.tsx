/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext, useState, useEffect } from 'react';
import { Icon, Button } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface CommentButtonProps {
    onPress: any;
    commentCount: number;
    arrowUp: boolean;
}

function CommentButton(props: CommentButtonProps): JSX.Element {
    const { onPress, commentCount, arrowUp } = props;
    const themeContext = useContext(ThemeContext);
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (commentCount) {
            setTitle(getString('답글 #N').replace('#N', commentCount.toString() || '0'));
        } else {
            setTitle(getString('답글작성'));
        }
    }, [commentCount]);

    return (
        <Button
            title={title}
            titleStyle={[globalStyle.btext, { fontSize: 10 }]}
            buttonStyle={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderColor: themeContext.color.boxBorder,
                borderWidth: 1,
                borderRadius: 6,
                marginRight: 10,
                height: 25,
            }}
            onPress={onPress}
            iconRight
            type="outline"
            icon={
                arrowUp ? (
                    <Icon
                        name="keyboard-arrow-up"
                        color={themeContext.color.primary}
                        size={10}
                        tvParallaxProperties={undefined}
                    />
                ) : (
                    <Icon
                        name="keyboard-arrow-down"
                        color={themeContext.color.primary}
                        size={10}
                        tvParallaxProperties={undefined}
                    />
                )
            }
        />
    );
}

export default CommentButton;
