import React, { useContext } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import { ExpandLessIcon } from '~/components/icons';

interface ListFooterButtonProps {
    onPress: () => void;
}

function ListFooterButton(props: ListFooterButtonProps): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const { onPress } = props;

    return (
        <View style={[globalStyle.center, { height: 86, backgroundColor: themeContext.color.gray }]}>
            <Button
                onPress={onPress}
                icon={
                    <View
                        style={[
                            globalStyle.center,
                            {
                                width: 31,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: 'white',
                                borderWidth: 2,
                                borderColor: themeContext.color.boxBorder,
                            },
                        ]}
                    >
                        <ExpandLessIcon />
                    </View>
                }
                type="clear"
            />
        </View>
    );
}

export default ListFooterButton;
