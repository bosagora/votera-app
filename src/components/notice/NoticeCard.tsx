import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Button, Text, Image } from 'react-native-elements';
import dayjs from 'dayjs';
import globalStyle, { MAX_WIDTH } from '~/styles/global';
import { Post, PostStatus, usePostCommentsLazyQuery, useReadArticleMutation } from '~/graphql/generated/generated';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString, { getLocale } from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { adjustAttachmentImage, AttachmentFile, AttachmentImage, filterAttachment } from '~/utils/attach';
import { ExpandLessIcon } from '~/components/icons';
import MultilineInput from '../input/MultiLineInput';
import DownloadComponent from '../ui/Download';
import CommentCard from '../opinion/CommentCard';
// import ShortButton from '../button/ShortButton';

const styles = StyleSheet.create({
    bottomWrapper: { alignItems: 'center', flexDirection: 'row' },
    commentsHeader: { fontSize: 10, lineHeight: 19 },
    commentsMain: { fontSize: 13, lineHeight: 21 },
    commentsWrapper: {
        alignItems: 'center',
        borderRadius: 6,
        borderStyle: 'solid',
        borderWidth: 1,
        height: 26,
        justifyContent: 'center',
    },
    container: { borderBottomWidth: 3, padding: 23 },
    content: { fontSize: 13, lineHeight: 23 },
    contentWrapper: { marginTop: 30 },
    dotColumn: { flexDirection: 'row', justifyContent: 'flex-end' },
    separator: { borderLeftWidth: 1, height: 11, marginLeft: 9, width: 11 },
    titleText: { flex: 1, fontSize: 14, lineHeight: 22 },
    unreadDot: { borderRadius: 4, height: 7, width: 7 },
    writeDate: { fontSize: 10, lineHeight: 20, marginLeft: 12 },
    writeView: { fontSize: 10, lineHeight: 20 },
    writerName: { fontSize: 9, lineHeight: 11 },
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

function selectCommentsWidth() {
    const locale = getLocale();
    return locale.startsWith('ko') ? 52 : 88;
}

interface NoticeCardProps {
    noticeData: Post;
    noticeStatus: PostStatus | undefined;
    noticeAId: string;
    isJoined: boolean;
    setJoined: () => Promise<void>;
}

function NoticeCard(props: NoticeCardProps): JSX.Element {
    const { noticeAId, noticeData, noticeStatus, isJoined, setJoined } = props;
    const dispatch = useAppDispatch();
    const themeContext = useContext(ThemeContext);
    const { isGuest } = useContext(AuthContext);
    const { createPostComment } = useContext(ProposalContext);

    const [text, setText] = useState<string>('');
    const [expanded, setExpanded] = useState(false);
    const [isRead, setIsRead] = useState(true);

    const [replyCount, setReplyCount] = useState(noticeData.commentCount || 0);
    const [replyData, setReplyData] = useState<Post[]>();
    const [replyStatus, setReplyStatus] = useState<PostStatus[]>();
    const [noticeImgs, setNoticeImgs] = useState<(AttachmentImage | undefined)[]>([]);
    const [noticeFiles, setNoticeFiles] = useState<AttachmentFile[]>([]);
    const [attachLoaded, setAttachLoaded] = useState(false);
    const [isStopFetchMore, setStopFetchMore] = useState(false);
    const [viewWidth, setViewWidth] = useState(MAX_WIDTH);

    const [getNoticeComments, { data: noticeCommentsData, loading, fetchMore }] = usePostCommentsLazyQuery({
        fetchPolicy: 'cache-and-network',
    });
    const [readArticle] = useReadArticleMutation();

    useEffect(() => {
        setIsRead(!!noticeStatus?.isRead);
    }, [noticeStatus]);

    useEffect(() => {
        if (expanded) {
            if (!attachLoaded) {
                setAttachLoaded(true);
            }
        }
    }, [expanded, attachLoaded]);

    useEffect(() => {
        let canceled = false;
        if (attachLoaded) {
            if (noticeData.attachment && noticeData.attachment.length > 0) {
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
    }, [attachLoaded, noticeData.attachment]);

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
                if (!isJoined) {
                    await setJoined();
                }
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
                dispatch(showSnackBar(getString('의견이 등록 되었습니다&#46;')));
            } catch (err) {
                console.log(err);
            }
        },
        [createPostComment, dispatch, isGuest, isJoined, noticeAId, noticeData.id, setJoined],
    );

    const clickRead = useCallback(
        (id: string, read: boolean) => {
            setExpanded(read);
            if (read && !isRead) {
                setIsRead(true);
                readArticle({ variables: { id } }).catch(console.log);
            }
        },
        [isRead, readArticle],
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

    const commentsWidth = selectCommentsWidth();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: themeContext.color.white, borderBottomColor: themeContext.color.gray },
            ]}
            onLayout={(event) => {
                setViewWidth(event.nativeEvent.layout.width);
            }}
        >
            <TouchableOpacity onPress={() => clickRead(noticeData.id, !expanded)}>
                <View style={globalStyle.flexRowBetween}>
                    <Text style={[globalStyle.mtext, styles.titleText, { maxWidth: viewWidth - commentsWidth }]}>
                        {getContentTitle(noticeData)}
                    </Text>
                    <View style={[styles.dotColumn, { width: commentsWidth }]}>
                        {!isRead && (
                            <View style={[styles.unreadDot, { backgroundColor: themeContext.color.disagree }]} />
                        )}
                    </View>
                </View>
                <View style={[globalStyle.flexRowBetween, { marginTop: 18 }]}>
                    <View style={styles.bottomWrapper}>
                        <Text style={[globalStyle.gmtext, { color: themeContext.color.black }, styles.writerName]}>
                            {noticeData.writer?.username || 'username'}
                        </Text>
                        <Text style={[globalStyle.rltext, { color: themeContext.color.textBlack }, styles.writeDate]}>
                            {dayjs(noticeData.createdAt as string).format('YYYY.M.D')}
                        </Text>
                        <View style={[styles.separator, { borderColor: themeContext.color.separator }]} />
                        <Text style={[globalStyle.ltext, { color: themeContext.color.textBlack }, styles.writeView]}>
                            {getString('조회수 #N').replace('#N', noticeData.readCount?.toString() || '')}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.commentsWrapper,
                            { borderColor: themeContext.color.boxBorder, width: commentsWidth },
                        ]}
                    >
                        <Text style={[globalStyle.btext, { color: themeContext.color.primary }, styles.commentsHeader]}>
                            {getString('답글 #N').replace('#N', replyCount?.toString() || '0')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
            {expanded && (
                <View style={styles.contentWrapper}>
                    <Text style={[globalStyle.ltext, { color: themeContext.color.black }, styles.content]}>
                        {getContentText(noticeData)}
                    </Text>
                    {noticeImgs.length > 0 ? (
                        <View style={{ marginTop: 10 }}>
                            {noticeImgs.map((image, index) =>
                                image ? (
                                    <Image
                                        key={`noticeImage.${image.id || index.toString()}`}
                                        style={{ width: image.width, height: image.height, marginTop: 10 }}
                                        source={{ uri: image.url }}
                                    />
                                ) : null,
                            )}
                        </View>
                    ) : null}
                    {noticeFiles.length > 0 ? (
                        <View style={{ marginTop: 20 }}>
                            {noticeFiles.map((file, index) => {
                                return <DownloadComponent key={`file_${file.id || index.toString()}`} file={file} />;
                            })}
                        </View>
                    ) : null}
                    <View style={{ marginVertical: 28 }}>
                        <View style={globalStyle.flexRowBetween}>
                            <Text
                                style={[
                                    globalStyle.rtext,
                                    styles.commentsMain,
                                    { color: themeContext.color.textBlack },
                                ]}
                            >
                                {getString('#N개 답글').replace('#N', replyCount?.toString() || '0')}
                            </Text>
                            {/* <ShortButton
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
                            /> */}
                        </View>
                        {replyData?.map((comment, index) => {
                            return (
                                <CommentCard
                                    key={`noticeComment_${comment.id}`}
                                    post={comment}
                                    status={replyStatus ? replyStatus[index] : undefined}
                                    separator={index < replyData.length - 1}
                                />
                            );
                        })}
                    </View>
                    {renderFetchMoreButton()}

                    <MultilineInput
                        onlyRead={false}
                        value={text}
                        onChangeText={setText}
                        placeholder={getString('이곳에 자유롭게 의견을 남겨주세요')}
                        onPress={() => {
                            createComment(text)
                                .then(() => {
                                    setText('');
                                })
                                .catch(console.log);
                        }}
                        maxInput={300}
                    />

                    <Button
                        onPress={() => setExpanded(false)}
                        icon={<ExpandLessIcon />}
                        buttonStyle={{ marginTop: 30 }}
                        type="clear"
                    />
                </View>
            )}
        </View>
    );
}

export default NoticeCard;
