import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { CommonScreenProps } from '~/navigation/common/CommonParams';
import getString from '~/utils/locales/STRINGS';
import { getUserServiceTermURL } from '~/utils/votera/agoraconf';
import WebFrameView from '~/components/ui/WebFrameView';
import globalStyle from '~/styles/global';
import { ChevronLeftIcon } from '~/components/icons';
import { replaceToHome } from '~/navigation/main/MainParams';

function UserServiceScreen({ route, navigation }: CommonScreenProps<'UserService'>): JSX.Element {
    const [title] = useState(getString('약관'));
    const [uri] = useState(getUserServiceTermURL());

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.pop();
                    } else {
                        navigation.dispatch(replaceToHome());
                    }
                }}
                icon={<ChevronLeftIcon color="black" />}
                type="clear"
            />
        );
    }, [navigation]);

    const headerTitle = useCallback(() => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={globalStyle.headerTitle}>{title}</Text>
            </View>
        );
    }, [title]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle,
            headerLeft,
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation, headerLeft, headerTitle]);

    return <WebFrameView title={title} uri={uri} />;
}

export default UserServiceScreen;
