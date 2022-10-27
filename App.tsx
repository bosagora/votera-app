import './shims';
import React from 'react';
import { ThemeProvider } from 'react-native-elements';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/react-hooks';
import { MetaMaskProvider } from 'metamask-react';
import * as SplashScreen from 'expo-splash-screen';
import Routes from '~/navigation/Routes';
import store from '~/state/store';
import theme from '~/theme/theme';
import { theme as sTheme } from '~/theme/styledTheme';
import apolloClient from '~/graphql/client';
import { AuthProvider } from '~/contexts/AuthContext';
import { ProposalProvider } from '~/contexts/ProposalContext';

let preventCalled = false;

if (!preventCalled) {
    // console.log('Call prevent splash');
    SplashScreen.preventAutoHideAsync().catch(console.log); // it's good to explicitly catch and inspect any error
    preventCalled = true;
}

export default function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <StyledThemeProvider theme={sTheme}>
                        <MetaMaskProvider>
                            <AuthProvider>
                                <ProposalProvider>
                                    <Routes />
                                </ProposalProvider>
                            </AuthProvider>
                        </MetaMaskProvider>
                    </StyledThemeProvider>
                </ThemeProvider>
            </Provider>
        </ApolloProvider>
    );
}
