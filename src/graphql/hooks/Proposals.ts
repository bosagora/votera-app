/* eslint-disable camelcase */
import { Enum_Proposal_Status as EnumProposalStatus } from '../generated/generated';

export enum WhereType {
    PROJECT,
    OPEN,
}

export const OpenWhere = (address: string | null) => {
    return address
        ? {
              _or: [
                  { status: EnumProposalStatus.PendingAssess },
                  { status: EnumProposalStatus.Assess },
                  { status: EnumProposalStatus.Created, proposer_address: address.toLowerCase() },
              ],
          }
        : {
              _or: [{ status: EnumProposalStatus.PendingAssess }, { status: EnumProposalStatus.Assess }],
          };
};

export const ProjectWhere = {
    status_in: [
        EnumProposalStatus.PendingVote,
        EnumProposalStatus.Vote,
        EnumProposalStatus.Reject,
        EnumProposalStatus.Closed,
    ],
};
