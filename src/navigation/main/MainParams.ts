import { DrawerNavigationProp, DrawerScreenProps } from '@react-navigation/drawer';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';
import { RootStackParams } from '../types/RootStackParams';
import { WhereType } from '~/graphql/hooks/Proposals';

export type MainDrawerParams = {
    Home: { where: WhereType };
    Feed: undefined;
    Search: undefined;
    ProposalDetail: { id: string };
    TempProposalList: undefined;
    MyProposalList: undefined;
    JoinProposalList: undefined;
    Notice: { id: string };
    CreateNotice: { id: string };

    Settings: undefined;
    AccountInfo: undefined;
    Alarm: undefined;

    CreateProposal: { tempId?: string };
    ProposalPayment: { id: string };
    ProposalPreview: undefined;
    Calendar: {
        isAssess: boolean;
        startDate?: string;
        endDate?: string;
    };
};

export type MainScreenProps<T extends keyof MainDrawerParams> = CompositeScreenProps<
    DrawerScreenProps<MainDrawerParams, T>,
    StackScreenProps<RootStackParams>
>;

export type MainNavigationProps<T extends keyof MainDrawerParams> = CompositeNavigationProp<
    DrawerNavigationProp<MainDrawerParams, T>,
    StackNavigationProp<RootStackParams>
>;
