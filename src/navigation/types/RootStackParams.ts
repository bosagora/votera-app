import type { NavigatorScreenParams } from '@react-navigation/native';
import { AccessStackParams } from '~/navigation/access/AccessParams';
import { CommonStackParams } from '~/navigation/common/CommonParams';
import { MainDrawerParams } from '~/navigation/main/MainParams';

export type RootStackParams = {
    RootUser: NavigatorScreenParams<MainDrawerParams>;
    RootAuth: NavigatorScreenParams<AccessStackParams>;
    Common: NavigatorScreenParams<CommonStackParams>;
};
