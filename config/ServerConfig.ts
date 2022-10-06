import { Platform } from 'react-native';

export const httpLinkURI = Platform.OS === 'web' ? '' : process.env.SERVER_URL;
export const webSocketURI = process.env.WEBSOCKET_URL;
export const serverChainID = process.env.CHAIN_ID;
export const httpServerURI = process.env.SERVER_URL;
