import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from '~/screens/access/landing/LandingScreen';
import LoginScreen from '~/screens/access/login/LoginScreen';
import SignupScreen from '~/screens/access/signup/SignupScreen';
import globalStyle from '~/styles/global';
import { AccessStackParams } from './AccessParams';

const AccessStack = createStackNavigator<AccessStackParams>();

export function AccessStackScreens(): JSX.Element {
    return (
        <AccessStack.Navigator
            screenOptions={{
                headerTitleStyle: globalStyle.headerTitle,
                headerLeftContainerStyle: { paddingLeft: 20 },
                headerRightContainerStyle: { paddingRight: 20 },
                headerTitleAlign: 'center',
            }}
        >
            <AccessStack.Screen name="Landing" component={LandingScreen} />
            <AccessStack.Screen name="Signup" component={SignupScreen} />
            <AccessStack.Screen name="Login" component={LoginScreen} />
        </AccessStack.Navigator>
    );
}

export default AccessStackScreens;
