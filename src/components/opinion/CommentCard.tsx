/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Divider } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { Post, PostStatus } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import globalStyle from '~/styles/global';
import { sinceCalc } from '~/utils/time';
import useReport from '~/graphql/hooks/Reports';

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
    container: { paddingTop: 35 },
    content: { fontSize: 13, lineHeight: 21 },
    contentWrapper: { paddingBottom: 18 },
    headerButton: { fontSize: 10, lineHeight: 20 },
    headerWrapper: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 11 },
    report: { alignItems: 'center', height: 72, justifyContent: 'center' },
    separator: {
        borderLeftWidth: 1,
        height: 11,
        marginLeft: 9,
        width: 11,
    },
    writerName: { fontSize: 10, lineHeight: 12 },
});

interface CommentCardProps {
    post: Post;
    status: PostStatus | undefined;
    separator: boolean;
}

function CommentCard(props: CommentCardProps): JSX.Element {
    const { post, status, separator } = props;
    const themeContext = useContext(ThemeContext);
    const [showContent, setShowContent] = useState<boolean>();
    const { report, restore } = useReport();

    useEffect(() => {
        if (post.status === 'DELETED' || !!status?.isReported) {
            setShowContent(false);
        } else {
            setShowContent(true);
        }
    }, [post.status, status?.isReported]);

    const commentCardInfo = () => {
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
                            restore(post.activity?.id || '', post.id);
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
                        report(post.activity?.id || '', post.id);
                    }}
                >
                    <Text style={[globalStyle.rtext, styles.headerButton]}>{getString('신고')}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: themeContext.color.white }]}>
            <View style={styles.headerWrapper}>
                <Text style={[globalStyle.gmtext, { color: themeContext.color.black }, styles.writerName]}>
                    {post.writer?.username || ''}
                </Text>
                {commentCardInfo()}
            </View>
            <View style={styles.contentWrapper}>
                {showContent && (
                    <Text style={[globalStyle.ltext, { color: themeContext.color.textBlack }, styles.content]}>
                        {getContentText(post)}
                    </Text>
                )}
                {!showContent && (
                    <View style={styles.report}>
                        <Text style={[globalStyle.ltext, { color: themeContext.color.textBlack }, styles.content]}>
                            {status?.isReported
                                ? getString('내가 신고한 답글입니다&#46;')
                                : getString('신고된 답글입니다&#46;')}
                        </Text>
                    </View>
                )}
            </View>
            {separator && <Divider />}
        </View>
    );
}

export default CommentCard;
