import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonStackParams } from './CommonParams';
import globalStyle from '~/styles/global';
import UserServiceScreen from '~/screens/common/UserService';
import PrivacyScreen from '~/screens/common/Privacy';

const CommonStack = createStackNavigator<CommonStackParams>();

export function CommonStackScreens(): JSX.Element {
    return (
        <CommonStack.Navigator
            screenOptions={{
                headerTitleStyle: globalStyle.headerTitle,
                headerLeftContainerStyle: { paddingLeft: 20 },
                headerRightContainerStyle: { paddingRight: 20 },
                headerTitleAlign: 'center',
            }}
        >
            <CommonStack.Screen name="UserService" component={UserServiceScreen} />
            <CommonStack.Screen name="Privacy" component={PrivacyScreen} />
        </CommonStack.Navigator>
    );
}

export default CommonStackScreens;
