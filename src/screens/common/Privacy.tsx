import React, { useCallback, useContext, useState } from 'react';
import { View } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { useLinkTo } from '@react-navigation/native';
import { CommonScreenProps } from '~/navigation/common/CommonParams';
import getString from '~/utils/locales/STRINGS';
import { getPrivacyTermURL } from '~/utils/votera/agoraconf';
import WebFrameView from '~/components/ui/WebFrameView';
import globalStyle from '~/styles/global';

function PrivacyScreen({ route, navigation }: CommonScreenProps<'Privacy'>): JSX.Element {
    const [title] = useState(getString('개인정보수집약관'));
    const [uri] = useState(getPrivacyTermURL());
    const linkTo = useLinkTo();

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        linkTo('/home');
                    }
                }}
                icon={<Icon name="chevron-left" tvParallaxProperties={undefined} />}
                type="clear"
            />
        );
    }, [navigation, linkTo]);

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

export default PrivacyScreen;
