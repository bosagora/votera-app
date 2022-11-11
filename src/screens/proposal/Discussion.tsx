import React, { useContext, useState, useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { OpinionFilterType } from '~/types/filterType';
import MultilineInput from '~/components/input/MultiLineInput';
import OpinionCard from '~/components/opinion/OpinionCard';
import { Post, PostStatus } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import ShortButton from '~/components/button/ShortButton';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';

const styles = StyleSheet.create({
    filterRow: { alignItems: 'center', flexDirection: 'row', paddingTop: 12 },
    filterSeparator: { height: 9, marginHorizontal: 5, width: 1 },
    moreButton: { marginTop: 10 },
    newNotice: {
        alignItems: 'center',
        borderRadius: 7,
        height: 15,
        justifyContent: 'center',
        position: 'absolute',
        right: 2,
        top: -7,
        width: 14,
    },
    newNoticeLabel: { color: 'white', fontSize: 7, lineHeight: 8 },
});

interface DiscussionProps {
    id: string;
    commentsCount: number;
    commentsData: Post[];
    commentsStatus: PostStatus[];
    filter: OpinionFilterType;
    setFilter: (value: OpinionFilterType) => void;
    createActivityComment: (value: string) => Promise<void>;
    refetch: () => void;
    fetchMore: () => void;
    newNotice: boolean;
    moveToNotice: () => void;
    isJoined: boolean;
    setJoined: () => Promise<void>;
    focused: boolean;
}

function Discussion(props: DiscussionProps): JSX.Element {
    const {
        id,
        commentsCount,
        commentsData,
        commentsStatus,
        filter,
        setFilter,
        createActivityComment,
        refetch,
        fetchMore,
        newNotice,
        moveToNotice,
        isJoined,
        setJoined,
        focused,
    } = props;
    const { user, isGuest } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();

    const [text, setText] = useState('');

    const createComment = useCallback(
        async (data: string) => {
            try {
                if (isGuest) {
                    dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                    return;
                }
                if (!data) return;
                if (!isJoined) {
                    await setJoined();
                }
                await createActivityComment(data);

                // console.log('createdComment >>> ', createdComment);
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
                // if (commentRefetch) commentRefetch();
            } catch (err) {
                console.log(err);
            }
        },
        [createActivityComment, dispatch, isGuest, isJoined, setJoined],
    );

    const selectFilterTextStyle = useCallback(
        (active: boolean) => {
            return active
                ? [globalStyle.btext, { fontSize: 10, color: themeContext.color.primary }]
                : [globalStyle.rtext, { fontSize: 10, color: themeContext.color.textBlack }];
        },
        [themeContext.color.primary, themeContext.color.textBlack],
    );

    return (
        <View>
            <View style={[globalStyle.flexRowBetween, { marginBottom: 20 }]}>
                <Text style={[globalStyle.gbtext, { color: themeContext.color.black, lineHeight: 13, fontSize: 11 }]}>
                    {user?.username}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                    {/* <ShortButton
                        title={getString('새로고침')}
                        titleStyle={{ fontSize: 10 }}
                        buttonStyle={[globalStyle.shortSmall, { marginRight: 5 }]}
                        onPress={() => {
                            refetch();
                        }}
                    /> */}
                    <ShortButton
                        title={getString('공지보기')}
                        titleStyle={{ fontSize: 10, lineHeight: 19 }}
                        buttonStyle={globalStyle.shortSmall}
                        onPress={moveToNotice}
                    />
                    {newNotice && (
                        <View style={[styles.newNotice, { backgroundColor: themeContext.color.disagree }]}>
                            <Text style={[globalStyle.gmtext, styles.newNoticeLabel]}>N</Text>
                        </View>
                    )}
                </View>
            </View>
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
            <View style={styles.filterRow}>
                <TouchableOpacity
                    onPress={() => {
                        setFilter(OpinionFilterType.LATEST);
                    }}
                >
                    <Text style={selectFilterTextStyle(filter === OpinionFilterType.LATEST)}>
                        {getString(OpinionFilterType.LATEST)}
                    </Text>
                </TouchableOpacity>
                <View style={[styles.filterSeparator, { backgroundColor: themeContext.color.separator }]} />
                <TouchableOpacity
                    onPress={() => {
                        setFilter(OpinionFilterType.POPULATION);
                    }}
                >
                    <Text style={selectFilterTextStyle(filter === OpinionFilterType.POPULATION)}>
                        {getString(OpinionFilterType.POPULATION)}
                    </Text>
                </TouchableOpacity>
            </View>
            {focused &&
                commentsData?.map((comment, index) => (
                    <OpinionCard
                        key={`comment_${comment.id}`}
                        activityId={id}
                        post={comment}
                        status={commentsStatus ? commentsStatus[index] : undefined}
                        isJoined={isJoined}
                        setJoined={setJoined}
                    />
                ))}
            {focused && commentsData && commentsData.length < commentsCount && (
                <Button
                    title={getString('더보기')}
                    onPress={() => {
                        fetchMore();
                    }}
                    buttonStyle={styles.moreButton}
                />
            )}
        </View>
    );
}

export default Discussion;
