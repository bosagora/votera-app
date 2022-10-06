import { Enum_Proposal_Status as EnumProposalStatus } from '../generated/generated';

export enum WhereType {
    PROJECT,
    OPEN,
}

export const OpenWhere = { status: EnumProposalStatus.Assess };

export const ProjectWhere = {
    // eslint-disable-next-line camelcase
    status_nin: [
        EnumProposalStatus.PendingAssess,
        EnumProposalStatus.Assess,
        EnumProposalStatus.Deleted,
        EnumProposalStatus.Cancel,
    ],
};
