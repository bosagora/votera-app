import React, { useCallback, useContext, useMemo } from 'react';
import {
    Proposal,
    Post,
    Enum_Post_Status as EnumPostStatus,
    Enum_Post_Type as EnumPostType,
    useJoinProposalMutation,
    useReportPostMutation,
    useRestorePostMutation,
    useCreatePostMutation,
    ActivityPostsQuery,
    ActivityPostsQueryVariables,
    ActivityPostsDocument,
    NewPostStatusFragment,
    PostCommentsQueryVariables,
    PostCommentsQuery,
    PostCommentsDocument,
    ProposalInput,
    GetProposalsQueryVariables,
    useCreateProposalMutation,
    GetProposalsQuery,
    GetProposalsDocument,
    NewProposalStatusFragment,
} from '~/graphql/generated/generated';
import { AuthContext } from './AuthContext';

type ProposalContextState = {
    createProposal: (proposalData: ProposalInput, variables?: GetProposalsQueryVariables) => Promise<Proposal | null>;
    canJoinProposal: (proposalState: Proposal | undefined) => boolean;
    joinProposal: (proposalState: Proposal | undefined) => Promise<boolean>;
    reportPost: (activityId: string, postId: string) => Promise<boolean>;
    restorePost: (activityId: string, postId: string) => Promise<boolean>;
    createActivityComment: (
        activityId: string,
        data: string,
        variables?: ActivityPostsQueryVariables,
    ) => Promise<Post | null>;
    createPostComment: (
        activityId: string,
        postId: string,
        data: string,
        variables?: PostCommentsQueryVariables,
    ) => Promise<Post | null>;
    createProposalNotice: (
        activityId: string,
        title: string,
        description: string,
        attachments: (string | undefined)[],
        variables?: ActivityPostsQueryVariables,
    ) => Promise<Post | null>;
};

type ProposalProviderProps = {
    children: React.ReactNode;
};

export const ProposalContext = React.createContext<ProposalContextState>(null);

export const DEFAULT_APP_NAME = 'Votera';

export function ProposalProvider({ children }: ProposalProviderProps): JSX.Element {
    const { user } = useContext(AuthContext);

    const [createProposalMutation] = useCreateProposalMutation();
    const [joinProposalMutation] = useJoinProposalMutation();
    const [reportPostMutation] = useReportPostMutation();
    const [restorePostMutation] = useRestorePostMutation();
    const [createCommentMutation] = useCreatePostMutation();

    const canJoinProposal = useCallback(
        (proposalState: Proposal | undefined) => {
            return !!(user?.memberId && proposalState?.id);
        },
        [user?.memberId],
    );

    const joinProposal = useCallback(
        async (proposalState: Proposal | undefined) => {
            try {
                if (user?.memberId && proposalState?.id) {
                    const result = await joinProposalMutation({
                        variables: {
                            input: {
                                data: {
                                    actor: user?.memberId,
                                    id: proposalState?.id,
                                },
                            },
                        },
                    });
                    if (result.data?.joinProposal?.proposal) {
                        return true;
                    }

                    return false;
                }
                return false;
            } catch (e) {
                console.log('Join Failed... : ', e);
                return false;
            }
        },
        [user?.memberId, joinProposalMutation],
    );

    const createProposal = useCallback(
        async (proposalData: ProposalInput, variables?: GetProposalsQueryVariables) => {
            const response = await createProposalMutation({
                variables: {
                    input: {
                        data: proposalData,
                    },
                },
                update(cache, { data: updateData }) {
                    if (!variables || !updateData) return;
                    const { createProposal: createResult } = updateData;
                    if (!createResult?.proposal?.id) return;

                    const cacheReads = cache.readQuery<GetProposalsQuery, GetProposalsQueryVariables>({
                        query: GetProposalsDocument,
                        variables,
                    });
                    const newProposalStatus: NewProposalStatusFragment = {
                        __typename: 'ProposalStatus',
                        id: createResult.proposal.id,
                        isJoined: true,
                        isLike: false,
                    };
                    const newCacheWrite: GetProposalsQuery = {
                        __typename: 'Query',
                        listProposal: {
                            __typename: 'ListProposalPayload',
                            count: (cacheReads?.listProposal?.count || 0) + 1,
                            values: cacheReads?.listProposal?.values
                                ? [createResult.proposal, ...cacheReads.listProposal.values]
                                : [createResult.proposal],
                            statuses: cacheReads?.listProposal?.statuses
                                ? [newProposalStatus, ...cacheReads.listProposal.statuses]
                                : [newProposalStatus],
                        },
                    };
                    cache.writeQuery({
                        query: GetProposalsDocument,
                        variables,
                        data: newCacheWrite,
                    });
                },
            });
            return (response.data?.createProposal?.proposal as Proposal) || null;
        },
        [createProposalMutation],
    );

    const reportPost = useCallback(
        async (activityId: string, postId: string): Promise<boolean> => {
            const data = await reportPostMutation({
                variables: {
                    input: {
                        data: {
                            postId,
                            activityId,
                            actor: user?.memberId || '',
                        },
                    },
                },
            });
            if (data.data?.reportPost?.interaction?.id) {
                return true;
            }
            return false;
        },
        [user?.memberId, reportPostMutation],
    );

    const restorePost = useCallback(
        async (activityId: string, postId: string): Promise<boolean> => {
            const data = await restorePostMutation({
                variables: {
                    input: {
                        data: {
                            postId,
                            activityId,
                            actor: user?.memberId || '',
                        },
                    },
                },
            });
            if (data.data?.restorePost?.interaction?.id) {
                return true;
            }
            return false;
        },
        [user?.memberId, restorePostMutation],
    );

    const createActivityComment = useCallback(
        async (activityId: string, data: string, variables?: ActivityPostsQueryVariables) => {
            const createdComment = await createCommentMutation({
                variables: {
                    input: {
                        data: {
                            type: EnumPostType.CommentOnActivity,
                            activity: activityId,
                            status: EnumPostStatus.Open,
                            content: [
                                {
                                    __typename: 'ComponentPostCommentOnActivity',
                                    text: data,
                                },
                            ],
                            writer: user?.memberId,
                        },
                    },
                },
                update(cache, { data: updateData }) {
                    if (!variables || !updateData) return;
                    const { createPost } = updateData;
                    if (!createPost?.post?.id) return;

                    const cacheReads = cache.readQuery<ActivityPostsQuery, ActivityPostsQueryVariables>({
                        query: ActivityPostsDocument,
                        variables,
                    });
                    const newPostStatus: NewPostStatusFragment = {
                        __typename: 'PostStatus',
                        id: createPost.post.id,
                        isLike: false,
                        isReported: false,
                        isRead: false,
                    };
                    const newCacheWrite: ActivityPostsQuery = {
                        __typename: 'Query',
                        activityPosts: {
                            __typename: 'ActivityPostsPayload',
                            count: (cacheReads?.activityPosts?.count || 0) + 1,
                            values: cacheReads?.activityPosts?.values
                                ? [createPost.post, ...cacheReads.activityPosts.values]
                                : [createPost.post],
                            statuses: cacheReads?.activityPosts?.statuses
                                ? [newPostStatus, ...cacheReads.activityPosts.statuses]
                                : [newPostStatus],
                        },
                    };
                    cache.writeQuery({
                        query: ActivityPostsDocument,
                        variables,
                        data: newCacheWrite,
                    });
                },
            });
            return (createdComment.data?.createPost?.post as Post) || null;
        },
        [createCommentMutation, user?.memberId],
    );

    const createPostComment = useCallback(
        async (activityId: string, postId: string, data: string, variables?: PostCommentsQueryVariables) => {
            const createdComment = await createCommentMutation({
                variables: {
                    input: {
                        data: {
                            type: EnumPostType.CommentOnPost,
                            activity: activityId,
                            parentPost: postId,
                            status: EnumPostStatus.Open,
                            content: [
                                {
                                    __typename: 'ComponentPostCommentOnPost',
                                    text: data,
                                },
                            ],
                            writer: user?.memberId,
                        },
                    },
                },
                update(cache, { data: updateData }) {
                    if (!variables || !updateData) return;
                    const { createPost } = updateData;
                    if (!createPost?.post?.id) return;

                    const cacheReads = cache.readQuery<PostCommentsQuery, PostCommentsQueryVariables>({
                        query: PostCommentsDocument,
                        variables,
                    });
                    const newPostStatus: NewPostStatusFragment = {
                        __typename: 'PostStatus',
                        id: createPost.post.id,
                        isLike: false,
                        isReported: false,
                        isRead: false,
                    };
                    const newCacheWrite: PostCommentsQuery = {
                        __typename: 'Query',
                        postComments: {
                            __typename: 'PostCommentsPayload',
                            count: (cacheReads?.postComments?.count || 0) + 1,
                            values: cacheReads?.postComments?.values
                                ? [createPost.post, ...cacheReads.postComments.values]
                                : [createPost.post],
                            statuses: cacheReads?.postComments?.statuses
                                ? [newPostStatus, ...cacheReads.postComments.statuses]
                                : [newPostStatus],
                        },
                    };
                    cache.writeQuery({
                        query: PostCommentsDocument,
                        variables,
                        data: newCacheWrite,
                    });
                },
            });
            return (createdComment.data?.createPost?.post as Post) || null;
        },
        [createCommentMutation, user?.memberId],
    );

    const createProposalNotice = useCallback(
        async (
            activityId: string,
            title: string,
            description: string,
            attachments: (string | undefined)[],
            variables?: ActivityPostsQueryVariables,
        ) => {
            const createdComment = await createCommentMutation({
                variables: {
                    input: {
                        data: {
                            type: EnumPostType.BoardArticle,
                            activity: activityId,
                            attachment: attachments as string[],
                            status: EnumPostStatus.Open,
                            content: [
                                {
                                    __typename: 'ComponentPostArticle',
                                    title,
                                    text: description,
                                },
                            ],
                            writer: user?.memberId,
                        },
                    },
                },
                update(cache, { data: updateData }) {
                    if (!variables || !updateData) return;
                    const { createPost } = updateData;
                    if (!createPost?.post?.id) return;

                    const cacheReads = cache.readQuery<ActivityPostsQuery, ActivityPostsQueryVariables>({
                        query: ActivityPostsDocument,
                        variables,
                    });
                    const newPostStatus: NewPostStatusFragment = {
                        __typename: 'PostStatus',
                        id: createPost.post.id,
                        isLike: false,
                        isReported: false,
                        isRead: false,
                    };
                    const newCacheWrite: ActivityPostsQuery = {
                        __typename: 'Query',
                        activityPosts: {
                            __typename: 'ActivityPostsPayload',
                            count: (cacheReads?.activityPosts?.count || 0) + 1,
                            values: cacheReads?.activityPosts?.values
                                ? [createPost.post, ...cacheReads.activityPosts.values]
                                : [createPost.post],
                            statuses: cacheReads?.activityPosts?.statuses
                                ? [newPostStatus, ...cacheReads.activityPosts.statuses]
                                : [newPostStatus],
                        },
                    };
                    cache.writeQuery({
                        query: ActivityPostsDocument,
                        variables,
                        data: newCacheWrite,
                    });
                },
            });
            return (createdComment.data?.createPost?.post as Post) || null;
        },
        [createCommentMutation, user?.memberId],
    );

    const value = useMemo(
        () => ({
            canJoinProposal,
            joinProposal,
            createProposal,
            reportPost,
            restorePost,
            createActivityComment,
            createPostComment,
            createProposalNotice,
        }),
        [
            canJoinProposal,
            createActivityComment,
            createPostComment,
            createProposalNotice,
            createProposal,
            joinProposal,
            reportPost,
            restorePost,
        ],
    );

    return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>;
}
