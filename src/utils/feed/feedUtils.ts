import {
    Enum_Feeds_Type as EnumFeedsType,
    ComponentFeedCotentContent,
    ComponentNavigationNavigation,
} from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

/**
 * Notification 의 Title, Content 데이터를 분기합니다.
 *
 * @param type FeedType
 */
export const getFeed = (type: EnumFeedsType, content: ComponentFeedCotentContent | undefined) => {
    let feedContent: string | undefined;
    if (!content) {
        return { feedContent };
    }
    const { userName, proposalTitle } = content;

    switch (type) {
        case EnumFeedsType.NewProposal:
            feedContent = getString(
                '{proposalTitle}이 등록되었으니 확인해보세요&#46; 사전 평가에도 참여하실 수 있습니다&#46;',
            ).replace('{proposalTitle}', proposalTitle || '');
            break;
        case EnumFeedsType.Assess_24HrDeadline:
            feedContent = getString(
                '{proposalTitle}의 사전 평가 종료까지 24시간 남았습니다! 종료전 참여해보세요',
            ).replace('{proposalTitle}', proposalTitle || '');
            break;
        case EnumFeedsType.AssessClosed:
            feedContent = getString(
                '{proposalTitle} 사전평가가 종료되었습니다&#46; 평가 결과를 확인해보세요&#46;',
            ).replace('{proposalTitle}', proposalTitle || '');
            break;
        case EnumFeedsType.VotingStart:
            feedContent = getString('{proposalTitle}의 투표가 시작되었으니 투표에 참여해보세요&#46;').replace(
                '{proposalTitle}',
                proposalTitle || '',
            );
            break;
        case EnumFeedsType.Voting_24HrDeadline:
            feedContent = getString(
                '{proposalTitle}의 투표 종료까지 24시간 밖에 남지 않았으니 놓치지 말고 투표하세요',
            ).replace('{proposalTitle}', proposalTitle || '');
            break;
        case EnumFeedsType.VotingClosed:
            feedContent = getString('{proposalTitle} 투표가 종료되었습니다&#46; 결과를 확인해보세요&#46;').replace(
                '{proposalTitle}',
                proposalTitle || '',
            );
            break;
        case EnumFeedsType.NewProposalNotice:
            feedContent = getString('{proposalTitle}에 새로운 공지가 등록되었습니다&#46; 확인해보세요&#46;').replace(
                '{proposalTitle}',
                proposalTitle || '',
            );
            break;
        case EnumFeedsType.NewOpinionComment:
            feedContent = getString('{userName}님이 당신의 의견에 댓글을 남겼습니다').replace(
                '{userName}',
                userName || '',
            );
            break;
        case EnumFeedsType.NewOpinionLike:
            feedContent = getString('{userName}님이 당신의 의견을 추천했습니다').replace('{userName}', userName || '');
            break;
        default:
            break;
    }

    return { feedContent };
};

export const getNavigationType = (type: EnumFeedsType, navigationParams: ComponentNavigationNavigation | undefined) => {
    const { proposalId, activityId } = navigationParams || {};

    switch (type) {
        case EnumFeedsType.NewProposalNotice:
            return `/notice/${activityId || ''}`;
        case EnumFeedsType.NewProposal:
        case EnumFeedsType.VotingStart:
        case EnumFeedsType.VotingClosed:
            return `/detail/${proposalId || ''}`;
        case EnumFeedsType.NewOpinionComment:
            return `/detail/${proposalId || ''}`;
        default:
            return undefined;
    }
};
