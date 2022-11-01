import { gql, SubscriptionHookOptions, useSubscription } from '@apollo/client';
import {
    Enum_Proposal_Type as EnumProposalType,
    Enum_Proposal_Status as EnumProposalStatus,
} from '../generated/generated';

export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export enum EnumNotificationType {
    NewProposal = 'NEW_PROPOSAL',
    Assess24hrDeadline = 'ASSESS_24HR_DEADLINE',
    AssessClosed = 'ASSESS_CLOSED',
    VotingStart = 'VOTING_START',
    Voting24hrDeadline = 'VOTING_24HR_DEADLINE',
    VotingClosed = 'VOTING_CLOSED',
    NewProposalNotice = 'NEW_PROPOSAL_NOTICE',
    NewOpinionComment = 'NEW_OPINION_COMMENT',
    NewOpinionLike = 'NEW_OPINION_LIKE',
}

export type ListenFeedSubscriptionVariables = {
    target: Scalars['String'];
};

export const ListenFeedDocument = gql`
    subscription OnListenFeed($target: String!) {
        listenFeed(target: $target) {
            id
            target
            type
        }
    }
`;

export type ListenFeedSubscription = {
    listenFeed?: {
        id: string;
        target: string;
        type: EnumNotificationType;
    };
};

export function useListenFeedSubscription(
    baseOptions?: SubscriptionHookOptions<ListenFeedSubscription, ListenFeedSubscriptionVariables>,
) {
    return useSubscription<ListenFeedSubscription, ListenFeedSubscriptionVariables>(ListenFeedDocument, baseOptions);
}

export type ProposalChangedSubscriptionVariables = {
    proposalId: Scalars['String'];
};

export const ProposalChangedDocument = gql`
    subscription OnProposalChanged($proposalId: String!) {
        proposalChanged(proposalId: $proposalId) {
            id
            name
            type
            status
            proposalId
        }
    }
`;

export type ProposalChangedSubscription = {
    proposalChanged?: {
        id: string;
        name: string;
        type: EnumProposalType;
        status: EnumProposalStatus;
        proposalId?: string;
    };
};

export function useProposalChangedSubscription(
    baseOptions?: SubscriptionHookOptions<ProposalChangedSubscription, ProposalChangedSubscriptionVariables>,
) {
    return useSubscription<ProposalChangedSubscription, ProposalChangedSubscriptionVariables>(
        ProposalChangedDocument,
        baseOptions,
    );
}
