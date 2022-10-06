import 'styled-components/native';

declare module 'styled-components/native' {
    export interface DefaultTheme {
        color: {
            base: string;
            white: string;
            primary: string;
            textLight: string;
            error: string;
            black: string;
            textBlack: string;
            textGray: string;
            agree: string;
            disagree: string;
            abstain: string;
            disabled: string;
            boxBorder: string;
            system: string;
            business: string;
            gray: string;
            placeholder: string;
        };
    }
}
