import { ImagePickerResult } from 'expo-image-picker';
import dayjs from 'dayjs';
import { Enum_Proposal_Type as EnumProposalType, ComponentCommonPeriodInput } from '~/graphql/generated/generated';

export enum ProposalListType {
    MY = 'MY',
    TEMP = 'TEMP',
    JOIN = 'JOIN',
}

export interface PreviewProposal {
    name: string;
    description: string;
    type: EnumProposalType;
    votePeriod?: { begin?: string; end?: string };
    fundingAmount?: string;
    logoImage?: ImagePickerResult;
    mainImage?: ImagePickerResult;
}

export function getDefaultAssessPeriod(): ComponentCommonPeriodInput {
    const today = dayjs();
    return {
        begin: today.format('YYYY-MM-DD'),
        end: today.add(6, 'd').format('YYYY-MM-DD'),
    };
}
