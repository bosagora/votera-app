import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';
import { RootStackParams } from '../types/RootStackParams';

export type CommonStackParams = {
    Privacy: undefined;
    UserService: undefined;
};

export type CommonScreenProps<T extends keyof CommonStackParams> = CompositeScreenProps<
    StackScreenProps<CommonStackParams, T>,
    StackScreenProps<RootStackParams>
>;

export type CommonNavigationProps<T extends keyof CommonStackParams> = CompositeNavigationProp<
    StackNavigationProp<CommonStackParams, T>,
    StackNavigationProp<RootStackParams>
>;
