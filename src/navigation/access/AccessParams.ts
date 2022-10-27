import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';
import { RootStackParams } from '../types/RootStackParams';

export type AccessStackParams = {
    Landing: undefined;
    Signup: undefined;
    Login: undefined;
};

export type AccessScreenProps<T extends keyof AccessStackParams> = CompositeScreenProps<
    StackScreenProps<AccessStackParams, T>,
    StackScreenProps<RootStackParams>
>;

export type AccessNavigationProps<T extends keyof AccessStackParams> = CompositeNavigationProp<
    StackNavigationProp<AccessStackParams, T>,
    StackNavigationProp<RootStackParams>
>;
