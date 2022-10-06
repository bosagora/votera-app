/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Divider } from 'react-native-elements';
import { Post, PostStatus } from '~/graphql/generated/generated';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import getString from '~/utils/locales/STRINGS';
import globalStyle from '~/styles/global';
import { sinceCalc } from '~/utils/time';

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
    contents: { backgroundColor: 'white', paddingTop: 35 },
    font: { color: 'rgb(71, 71, 75)', fontSize: 13 },
    report: { alignItems: 'center', height: 72, justifyContent: 'center' },
    separator: {
        borderColor: 'rgb(220, 217, 227)',
        borderLeftWidth: 1,
        height: 11,
        marginLeft: 9,
        width: 11,
    },
    writer: { color: 'black', fontFamily: 'GmarketSansTTFMedium', fontSize: 10 },
});

interface CommentCardProps {
    post: Post;
    status: PostStatus | undefined;
}

function CommentCard(props: CommentCardProps): JSX.Element {
    const { post, status } = props;
    const { isGuest } = useContext(AuthContext);
    const { reportPost, restorePost } = useContext(ProposalContext);
    const dispatch = useAppDispatch();
    const [showContent, setShowContent] = useState<boolean>();

    useEffect(() => {
        if (post.status === 'DELETED' || !!status?.isReported) {
            setShowContent(false);
        } else {
            setShowContent(true);
        }
    }, [post.status, status?.isReported]);

    const report = useCallback(() => {
        if (isGuest) {
            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
            return;
        }

        if (Platform.OS === 'web') {
            if (window.confirm(getString('이 게시물을 신고하시겠습니까?'))) {
                reportPost(post.activity?.id || '', post.id)
                    .then((succeeded) => {
                        dispatch(showSnackBar(getString('신고 처리가 완료되었습니다')));
                    })
                    .catch((err) => {
                        console.log('catch exception while reportPost : ', err);
                        dispatch(showSnackBar(getString('신고 처리 중 오류가 발생했습니다')));
                    });
            }
        } else {
            Alert.alert(
                getString('이 게시물을 신고하시겠습니까?'),
                getString(
                    '신고할 경우, 이 게시물은 회원님께 숨김 처리 됩니다&#46; 신고가 누적되면 다른 참여자들에게도 숨김처리가 될 예정입니다&#46;',
                ),
                [
                    {
                        text: getString('취소'),
                        onPress: () => {
                            console.log('cancel pressed');
                        },
                        style: 'cancel',
                    },
                    {
                        text: getString('신고'),
                        onPress: () => {
                            reportPost(post.activity?.id || '', post.id)
                                .then((succeeded) => {
                                    dispatch(showSnackBar(getString('신고 처리가 완료되었습니다')));
                                })
                                .catch((err) => {
                                    console.log('catch exception while reportPost : ', err);
                                    dispatch(showSnackBar(getString('신고 처리 중 오류가 발생했습니다')));
                                });
                        },
                    },
                ],
            );
        }
    }, [dispatch, isGuest, post.activity?.id, post.id, reportPost]);

    const restore = useCallback(() => {
        if (isGuest) {
            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
            return;
        }
        if (Platform.OS === 'web') {
            if (window.confirm(getString('신고를 취소하시겠습니까?'))) {
                restorePost(post.activity?.id || '', post.id)
                    .then((succeeded) => {
                        dispatch(showSnackBar(getString('신고취소 처리가 완료되었습니다')));
                    })
                    .catch((err) => {
                        console.log('catch exception while restorePost : ', err);
                        dispatch(showSnackBar(getString('신고취소 처리 중 오류가 발생했습니다')));
                    });
            }
        } else {
            Alert.alert(
                getString('신고를 취소하시겠습니까?'),
                getString('신고를 취소하더라도 신고가 누적되어 있으면 여전히 숨김처리 되어 있습니다&#46;'),
                [
                    {
                        text: getString('No'),
                        onPress: () => {
                            console.log('cancel pressed');
                        },
                        style: 'cancel',
                    },
                    {
                        text: getString('Yes'),
                        onPress: () => {
                            restorePost(post.activity?.id || '', post.id)
                                .then((succeeded) => {
                                    dispatch(showSnackBar(getString('신고취소 처리가 완료되었습니다')));
                                })
                                .catch((err) => {
                                    console.log('catch exception while restorePost : ', err);
                                    dispatch(showSnackBar(getString('신고취소 처리 중 오류가 발생했습니다')));
                                });
                        },
                    },
                ],
            );
        }
    }, [dispatch, isGuest, post.activity?.id, post.id, restorePost]);

    const commentCardInfo = () => {
        if (status?.isReported) {
            return (
                <View style={globalStyle.flexRowBetween}>
                    <TouchableOpacity
                        onPress={() => {
                            setShowContent(!showContent);
                        }}
                    >
                        {showContent && <Text style={{ fontSize: 10 }}>{getString('내용숨기기')}</Text>}
                        {!showContent && <Text style={{ fontSize: 10 }}>{getString('내용보기')}</Text>}
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity
                        onPress={() => {
                            restore();
                        }}
                    >
                        <Text style={{ fontSize: 10 }}>{getString('신고취소')}</Text>
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
                        {showContent && <Text style={{ fontSize: 10 }}>{getString('내용숨기기')}</Text>}
                        {!showContent && <Text style={{ fontSize: 10 }}>{getString('내용보기')}</Text>}
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={globalStyle.flexRowBetween}>
                <Text style={{ fontSize: 10 }}>{sinceCalc(post.createdAt as string)}</Text>
                <View style={styles.separator} />
                <TouchableOpacity
                    onPress={() => {
                        report();
                    }}
                >
                    <Text style={{ fontSize: 10 }}>{getString('신고')}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.contents}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 11 }}>
                <Text style={styles.writer}>{post.writer?.username || ''}</Text>
                {commentCardInfo()}
            </View>
            <View style={{ paddingBottom: 18 }}>
                {showContent && <Text style={styles.font}>{getContentText(post)}</Text>}
                {!showContent && (
                    <View style={styles.report}>
                        <Text style={styles.font}>
                            {status?.isReported
                                ? getString('내가 신고한 답글입니다&#46;')
                                : getString('신고된 답글입니다&#46;')}
                        </Text>
                    </View>
                )}
            </View>
            <Divider />
        </View>
    );
}

export default CommentCard;
