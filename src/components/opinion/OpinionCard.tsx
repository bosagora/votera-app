/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Divider, Button } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { debounce } from 'lodash';
import MultilineInput from '~/components/input/MultiLineInput';
import CommentCard from '~/components/opinion/CommentCard';
import { Post, PostStatus, usePostCommentsQuery } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import { sinceCalc } from '~/utils/time';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { useInteraction } from '~/graphql/hooks/Interactions';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import useReport from '~/graphql/hooks/Reports';
import { ExpandLessIcon } from '~/components/icons';
import CommentButton from '../button/CommentButton';
import CommentLikeButton from '../button/CommentLikeButton';
import ShortButton from '../button/ShortButton';

function getContentText(postData: Post): string {
    if (postData.content?.length) {
        // eslint-disable-next-line no-underscore-dangle
        switch (postData.content[0]?.__typename) {
            case 'ComponentPostArticle':
            case 'ComponentPostCommentOnActivity':
            case 'ComponentPostCommentOnPost':
            case 'ComponentPostReply':
                return postData.content[0].text || '';
            default:
                break;
        }
    }
    return '';
}

const styles = StyleSheet.create({
    bottomWrapper: { alignItems: 'center', flexDirection: 'row', paddingBottom: 35 },
    container: { paddingTop: 35 },
    content: { fontSize: 13, lineHeight: 21 },
    contentWrapper: { paddingBottom: 18 },
    headerButton: { fontSize: 10, lineHeight: 20 },
    headerWrapper: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 11 },
    likeButton: { marginLeft: 6.5 },
    report: { alignItems: 'center', height: 72, justifyContent: 'center' },
    separator: {
        borderLeftWidth: 1,
        height: 11,
        marginLeft: 9,
        width: 11,
    },
    writerName: { fontSize: 10, lineHeight: 12 },
});

const FETCH_INIT_LIMIT = 10;
const FETCH_MORE_LIMIT = 10;

function getPostCommentsVariable(id: string) {
    return {
        id,
        sort: 'createdAt:desc',
        limit: FETCH_INIT_LIMIT,
    };
}

interface ReplyProps {
    activityId: string;
    post: Post;
    closeReply: () => void;
}

function Reply(props: ReplyProps): JSX.Element {
    const { activityId, post, closeReply } = props;
    const dispatch = useAppDispatch();
    const { isGuest } = useContext(AuthContext);
    const { createPostComment } = useContext(ProposalContext);
    const [text, setText] = useState('');
    const [replyCount, setReplyCount] = useState(post.commentCount || 0);
    const [replyData, setReplyData] = useState<Post[]>();
    const [replyStatus, setReplyStatus] = useState<PostStatus[]>();
    const [isStopFetchMore, setStopFetchMore] = useState(false);

    const {
        data: replyQueryData,
        loading,
        fetchMore,
        refetch,
        client,
    } = usePostCommentsQuery({
        variables: getPostCommentsVariable(post.id),
    });

    useEffect(() => {
        if (replyQueryData?.postComments) {
            setReplyCount(replyQueryData.postComments.count || 0);
            setReplyData(replyQueryData.postComments.values as Post[]);
            setReplyStatus(replyQueryData.postComments.statuses as PostStatus[]);
            setStopFetchMore(replyQueryData.postComments.count === replyQueryData.postComments.values?.length);
        } else {
            setReplyData([]);
            setReplyStatus([]);
            setStopFetchMore(true);
        }
    }, [replyQueryData]);

    const createReply = useCallback(
        async (data?: string) => {
            if (isGuest) {
                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                return;
            }
            if (!data) return;
            await createPostComment(activityId, post.id, data, {
                id: post.id,
                sort: 'createdAt:desc',
            });
            /*
            if (!isJoined) {
                const pushData = await push.getCurrentPushLocalStorage();
                await createFollow(
                    feedAddress,
                    [createdComment.data?.createPost?.post?.activity?.proposal?.id!],
                    pushData?.id,
                    pushData?.enablePush,
                ).catch(console.log);
            }
            */
            dispatch(showSnackBar(getString('답글이 등록 되었습니다&#46;')));
        },
        [activityId, createPostComment, dispatch, isGuest, post.id],
    );

    if (loading) return <ActivityIndicator style={{ marginVertical: 10 }} />;

    const renderFetchMoreButton = () => {
        if (isStopFetchMore || loading || !replyData) return null;
        return (
            <Button
                title={getString('더보기')}
                onPress={() => {
                    if (fetchMore) {
                        const currentLength = replyData?.length || 0;
                        fetchMore({
                            variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                        }).catch(console.log);
                    }
                }}
                buttonStyle={{ marginVertical: 10 }}
            />
        );
    };

    return (
        <>
            <View style={globalStyle.flexRowBetween}>
                <Text style={[globalStyle.rrtext, { fontSize: 13, lineHeight: 21 }]}>
                    {getString('#N개 답글').replace('#N', replyCount.toString() || '0')}
                </Text>
                {/* <ShortButton
                    title={getString('새로고침')}
                    titleStyle={{ fontSize: 10 }}
                    buttonStyle={[globalStyle.shortSmall, { marginRight: 5 }]}
                    onPress={() => {
                        const variables = getPostCommentsVariable(post.id);
                        client.cache.evict({
                            fieldName: 'postComments',
                            args: variables,
                            broadcast: false,
                        });
                        refetch(variables).catch(console.log);
                    }}
                /> */}
            </View>
            {replyData?.map((reply, index) => {
                return (
                    <CommentCard
                        key={`reply_${reply.id}`}
                        post={reply}
                        status={replyStatus ? replyStatus[index] : undefined}
                        separator={index < replyData.length - 1}
                    />
                );
            })}
            {renderFetchMoreButton()}
            <MultilineInput
                componentStyle={{ marginTop: 30 }}
                onlyRead={false}
                value={text}
                onChangeText={setText}
                placeholder={getString('이곳에 답글을 남겨주세요')}
                onPress={() => {
                    createReply(text)
                        .then(() => {
                            setText('');
                        })
                        .catch(console.log);
                }}
                maxInput={300}
            />
            <Button onPress={closeReply} icon={<ExpandLessIcon />} buttonStyle={{ marginVertical: 10 }} type="clear" />
        </>
    );
}

interface OpinionCardProps {
    activityId: string;
    post: Post;
    status: PostStatus | undefined;
}

function OpinionCard(props: OpinionCardProps): JSX.Element {
    const { activityId, post, status } = props;
    const { isGuest } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [showReply, setShowReply] = useState(false);
    const [isReported] = useState(post.status === 'DELETED' || !!status?.isReported);
    const [showContent, setShowContent] = useState<boolean>();
    const [localIsLiked, setLocalIsLiked] = useState<boolean>(status?.isLike ?? false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const { runToggleLike } = useInteraction();
    const [cardWidth, setCardWidth] = useState(0);
    const { restore, report } = useReport();

    const handler = useMemo(
        () =>
            debounce((toValue: boolean) => {
                runToggleLike({ isLike: toValue, postId: post.id }).catch(console.log);
            }, 300),
        [post.id, runToggleLike],
    );

    useEffect(() => {
        return () => {
            handler.cancel();
        };
    }, [handler]);

    useEffect(() => {
        if (post.status === 'DELETED' || !!status?.isReported) {
            setShowContent(false);
        } else {
            setShowContent(true);
        }
    }, [post.status, status?.isReported]);

    useEffect(() => {
        setLikeCount(post.likeCount || 0);
        setCommentCount(post.commentCount || 0);
    }, [post.likeCount, post.commentCount]);

    const toggleLike = () => {
        if (isGuest) {
            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
            return;
        }
        setLocalIsLiked(!localIsLiked);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        handler(!localIsLiked);
    };

    const commentHeader = () => {
        if (status?.isReported) {
            return (
                <View style={globalStyle.flexRowBetween}>
                    <TouchableOpacity
                        onPress={() => {
                            setShowContent(!showContent);
                        }}
                    >
                        {showContent && (
                            <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('내용숨기기')}</Text>
                        )}
                        {!showContent && (
                            <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('내용보기')}</Text>
                        )}
                    </TouchableOpacity>
                    <View style={[styles.separator, { borderColor: themeContext.color.separator }]} />
                    <TouchableOpacity
                        onPress={() => {
                            restore(activityId, post.id);
                        }}
                    >
                        <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('신고취소')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (post.status === 'DELETED') {
            return (
                <View style={globalStyle.flexRowBetween}>
                    <TouchableOpacity
                        onPress={() => {
                            setShowContent(!showContent);
                        }}
                    >
                        {showContent && (
                            <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('내용숨기기')}</Text>
                        )}
                        {!showContent && (
                            <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('내용보기')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={globalStyle.flexRowBetween}>
                <Text style={[globalStyle.rtext, styles.headerButton]}>{sinceCalc(post.createdAt as string)}</Text>
                <View style={[styles.separator, { borderColor: themeContext.color.separator }]} />
                <TouchableOpacity
                    onPress={() => {
                        report(activityId, post.id);
                    }}
                >
                    <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('신고')}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View
            style={[styles.container, { backgroundColor: themeContext.color.white }]}
            onLayout={(event) => {
                setCardWidth(event.nativeEvent.layout.width);
            }}
        >
            <View style={styles.headerWrapper}>
                <Text style={[globalStyle.gbtext, { color: themeContext.color.black }, styles.writerName]}>
                    {post.writer?.username || ''}
                </Text>
                {commentHeader()}
            </View>
            <View style={styles.contentWrapper}>
                {showContent && (
                    <Text style={[globalStyle.rtext, { color: themeContext.color.textBlack }, styles.content]}>
                        {getContentText(post)}
                    </Text>
                )}
                {!showContent && (
                    <View style={styles.report}>
                        <Text style={[globalStyle.rtext, { color: themeContext.color.textBlack }, styles.content]}>
                            {status?.isReported
                                ? getString('내가 신고한 게시물입니다&#46;')
                                : getString('신고된 게시물입니다&#46;')}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.bottomWrapper}>
                <CommentButton
                    commentCount={commentCount}
                    onPress={() => {
                        setShowReply(!showReply);
                    }}
                    arrowUp={showReply}
                />
                {!isReported && (
                    <CommentLikeButton
                        buttonStyle={styles.likeButton}
                        likeCount={likeCount}
                        onPress={() => {
                            toggleLike();
                        }}
                        isLiked={localIsLiked}
                    />
                )}
            </View>
            {showReply ? <Reply post={post} activityId={activityId} closeReply={() => setShowReply(false)} /> : null}
            <Divider
                style={{ left: -22, height: 3, width: cardWidth + 44, backgroundColor: themeContext.color.gray }}
            />
        </View>
    );
}

export default OpinionCard;
