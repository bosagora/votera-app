export enum FeedStatusType {
    MY_PROPOSALS_NEWS = 'isMyProposalsNews',
    LIKE_PROPOSALS_NEWS = 'isLikeProposalsNews',
    NEW_PROPOSAL_NEWS = 'isNewProposalNews',
    MY_COMMENT_NEWS = 'isMyCommentsNews',
    ETC_NEWS = 'isEtcNews',
}

export interface FeedProps {
    isMyProposalsNews?: boolean | null;
    isLikeProposalsNews?: boolean | null;
    isNewProposalNews?: boolean | null;
    isMyCommentNews?: boolean | null;
    isEtcNews?: boolean | null;
}
