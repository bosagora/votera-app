import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Button, Icon, Text, Image } from 'react-native-elements';
import dayjs from 'dayjs';
import globalStyle from '~/styles/global';
import { Post, PostStatus, usePostCommentsLazyQuery } from '~/graphql/generated/generated';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { adjustAttachmentImage, AttachmentFile, AttachmentImage, downloadFile, filterAttachment } from '~/utils/attach';
import MultilineInput from '../input/MultiLineInput';
import DownloadComponent from '../ui/Download';
import CommentCard from '../opinion/CommentCard';
import ShortButton from '../button/ShortButton';

const styles = StyleSheet.create({
    noticeContainer: {
        backgroundColor: 'white',
        borderBottomColor: 'rgb(242,244,250)',
        borderBottomWidth: 3,
        padding: 23,
    },
    regularButton: {
        alignItems: 'center',
        borderColor: 'rgb(222, 212, 248)',
        borderRadius: 6,
        borderWidth: 1,
        height: 26,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    titleText: {
        flex: 1,
        fontSize: 16,
    },
});

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_MAX_WIDTH = SCREEN_WIDTH - 46;

function getContentTitle(noticeData: Post): string {
    // eslint-disable-next-line no-underscore-dangle
    if (noticeData.content && noticeData.content.length) {
        // eslint-disable-next-line no-underscore-dangle
        switch (noticeData.content[0]?.__typename) {
            case 'ComponentPostArticle':
                return noticeData.content[0].title || '';
            default:
                break;
        }
    }
    return '';
}

function getContentText(noticeData: Post): string {
    // eslint-disable-next-line no-underscore-dangle
    if (noticeData.content && noticeData.content.length) {
        // eslint-disable-next-line no-underscore-dangle
        switch (noticeData.content[0]?.__typename) {
            case 'ComponentPostArticle':
                return noticeData.content[0].text || '';
            case 'ComponentPostCommentOnActivity':
                return noticeData.content[0].text || '';
            case 'ComponentPostCommentOnPost':
                return noticeData.content[0].text || '';
            case 'ComponentPostReply':
                return noticeData.content[0].text || '';
            default:
                break;
        }
    }
    return '';
}

function getNoticeCommentsVariables(id: string) {
    return {
        id,
        sort: 'createdAt:desc',
        limit: FETCH_INIT_LIMIT,
    };
}

interface NoticeCardProps {
    noticeData: Post;
    noticeStatus: PostStatus | undefined;
    noticeAId: string;
}

function NoticeCard(props: NoticeCardProps): JSX.Element {
    const { noticeAId, noticeData, noticeStatus } = props;
    const dispatch = useAppDispatch();
    const themeContext = useContext(ThemeContext);
    const { user, isGuest } = useContext(AuthContext);
    const { createPostComment } = useContext(ProposalContext);

    const [text, setText] = useState<string>('');
    const [expanded, setExpanded] = useState(false);

    const [replyCount, setReplyCount] = useState(noticeData.commentCount || 0);
    const [replyData, setReplyData] = useState<Post[]>();
    const [replyStatus, setReplyStatus] = useState<PostStatus[]>();
    const [noticeImgs, setNoticeImgs] = useState<(AttachmentImage | undefined)[]>([]);
    const [noticeFiles, setNoticeFiles] = useState<AttachmentFile[]>([]);
    const [isStopFetchMore, setStopFetchMore] = useState(false);

    const [getNoticeComments, { data: noticeCommentsData, loading, fetchMore, client }] = usePostCommentsLazyQuery({
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        let canceled = false;
        if (expanded) {
            if (
                noticeData.attachment &&
                noticeData.attachment?.length > 0 &&
                noticeImgs.length === 0 &&
                noticeFiles.length === 0
            ) {
                const filter = filterAttachment(noticeData.attachment);
                setNoticeFiles(filter.files);
                Promise.all(filter.images.map((a) => adjustAttachmentImage(a, IMAGE_MAX_WIDTH)))
                    .then((result) => {
                        if (!canceled) {
                            setNoticeImgs(result);
                        }
                    })
                    .catch(console.log);
            }
        }
        return () => {
            canceled = true;
        };
    }, [noticeData, expanded, noticeImgs, noticeFiles]);

    useEffect(() => {
        if (noticeCommentsData?.postComments) {
            setReplyCount(noticeCommentsData.postComments.count || 0);
            setReplyData(noticeCommentsData.postComments.values as Post[]);
            setReplyStatus(noticeCommentsData.postComments.statuses as PostStatus[]);
            setStopFetchMore(noticeCommentsData.postComments.count === noticeCommentsData.postComments.values?.length);
        } else {
            setReplyData([]);
            setReplyStatus([]);
            setStopFetchMore(true);
        }
    }, [noticeCommentsData]);

    useEffect(() => {
        if (expanded) {
            getNoticeComments({
                variables: getNoticeCommentsVariables(noticeData.id),
            }).catch((err) => {
                console.log('getNoticeComments error', err);
            });
            // if (noticeData.attachment?.length) {
            //     noticeData.attachment.map((a) => console.log('mime : ', a?.mime));
            // }
            // if (props.noticeData.attachment?.) {
            //     getImageSize(props.mainImage.url).then((result) => {
            //         if (result.width > SCREEN_WIDTH - 46) {
            //             const imageRatio = (SCREEN_WIDTH - 46) / result.width;
            //             setImageSize({ width: SCREEN_WIDTH - 46, height: result.height * imageRatio });
            //         } else {
            //             setImageSize(result);
            //         }
            //     });
            // }
        }
    }, [expanded, getNoticeComments, noticeData.id]);

    const createComment = useCallback(
        async (data?: string) => {
            try {
                if (isGuest) {
                    dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                    return;
                }

                if (!data) return;

                await createPostComment(noticeAId, noticeData.id, data, {
                    id: noticeData.id,
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
                dispatch(showSnackBar(getString('글이 등록 되었습니다&#46;')));
                setText('');
            } catch (err) {
                console.log(err);
            } finally {
                // dispatch(ActionCreators.loadingAniModal({ visibility: false }));
            }
        },
        [createPostComment, dispatch, isGuest, noticeAId, noticeData.id],
    );

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
        <View style={styles.noticeContainer}>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <View style={globalStyle.flexRowBetween}>
                    <Text style={[globalStyle.mtext, styles.titleText]}>{getContentTitle(noticeData)}</Text>
                    <View style={styles.regularButton}>
                        <Text style={[globalStyle.btext, { fontSize: 12, color: themeContext.color.primary }]}>
                            {getString('답글 #N').replace('#N', replyCount?.toString() || '0')}
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
                    <Text style={[globalStyle.gmtext, { fontSize: 11, color: 'black', lineHeight: 15 }]}>
                        {noticeData.writer?.username || 'username'}
                    </Text>
                    <Text style={[globalStyle.rltext, { fontSize: 12, marginLeft: 12 }]}>
                        {dayjs(noticeData.createdAt as string).format('YYYY.M.D')}
                    </Text>
                    {/** TODO */}
                    {/* <View style={{ height: 9, width: 1, backgroundColor: 'rgb(220,217,227)', marginHorizontal: 10 }} /> */}
                    {/* <RLText style={{ fontSize: 12 }}>조회수</RLText> */}
                </View>
            </TouchableOpacity>
            {expanded && (
                <View style={{ paddingVertical: 30 }}>
                    <Text style={[globalStyle.ltext, { color: 'black' }]}>{getContentText(noticeData)}</Text>
                    <View>
                        {noticeImgs?.map((image) =>
                            image ? (
                                <Image
                                    key={`noticeImage.${image.id || ''}`}
                                    style={{ width: image.width, height: image.height }}
                                    source={{ uri: image.url }}
                                />
                            ) : null,
                        )}
                    </View>
                    <View style={{ marginTop: 20 }}>
                        {noticeFiles.map((file) => {
                            return (
                                <DownloadComponent
                                    key={`file_${file.name || ''}`}
                                    label={file?.name || 'filename'}
                                    onPress={() => {
                                        if (file) {
                                            downloadFile(file.url, file.name)
                                                .then(() => {
                                                    dispatch(showSnackBar(getString('다운로드가 완료 되었습니다')));
                                                })
                                                .catch((err) => {
                                                    console.log('downloadFile error', err);
                                                });
                                        }
                                    }}
                                />
                            );
                        })}
                    </View>
                    <View style={{ marginVertical: 28 }}>
                        <View style={globalStyle.flexRowBetween}>
                            <Text>{getString('#N개 답글').replace('#N', replyCount?.toString() || '0')}</Text>
                            <ShortButton
                                title={getString('새로고침')}
                                titleStyle={{ fontSize: 10 }}
                                buttonStyle={[globalStyle.shortSmall, { marginRight: 5 }]}
                                onPress={() => {
                                    const variables = getNoticeCommentsVariables(noticeData.id);
                                    client.cache.evict({
                                        fieldName: 'postComments',
                                        args: variables,
                                        broadcast: false,
                                    });
                                    getNoticeComments({ variables }).catch(console.log);
                                }}
                            />
                        </View>
                        {replyData?.map((comment, index) => {
                            return (
                                <CommentCard
                                    key={`noticeComment_${comment.id}`}
                                    post={comment}
                                    status={replyStatus ? replyStatus[index] : undefined}
                                />
                            );
                        })}
                    </View>
                    {renderFetchMoreButton()}

                    <MultilineInput
                        onlyRead={false}
                        value={text}
                        onChangeText={setText}
                        placeholder={getString('이곳에 자유롭게 글을 남겨주세요')}
                        onPress={() => {
                            createComment(text).catch(console.log);
                        }}
                    />

                    <Button
                        onPress={() => setExpanded(false)}
                        icon={<Icon name="expand-less" tvParallaxProperties={undefined} />}
                        buttonStyle={{ marginTop: 30 }}
                        type="clear"
                    />
                </View>
            )}
        </View>
    );
}

export default NoticeCard;
