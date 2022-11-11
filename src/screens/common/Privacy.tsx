import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { CommonScreenProps } from '~/navigation/common/CommonParams';
import getString from '~/utils/locales/STRINGS';
import { getPrivacyTermURL } from '~/utils/votera/agoraconf';
import WebFrameView from '~/components/ui/WebFrameView';
import globalStyle from '~/styles/global';
import { ChevronLeftIcon } from '~/components/icons';
import { replaceToHome } from '~/navigation/main/MainParams';

function PrivacyScreen({ route, navigation }: CommonScreenProps<'Privacy'>): JSX.Element {
    const [title] = useState(getString('개인정보처리방침'));
    const [uri] = useState(getPrivacyTermURL());

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
            title,
            headerTitle,
            headerLeft,
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation, headerLeft, headerTitle, title]);

    return <WebFrameView title={title} uri={uri} />;
}

export default PrivacyScreen;
