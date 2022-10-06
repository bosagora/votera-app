import React, { useContext, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FilterButton from '~/components/button/FilterButton';
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
    onLayout: (h: number) => void;
    moveToNotice: () => void;
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
        moveToNotice,
        onLayout,
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
                dispatch(showSnackBar(getString('글이 등록 되었습니다&#46;')));
                setText('');
                // if (commentRefetch) commentRefetch();
            } catch (err) {
                console.log(err);
            }
        },
        [createActivityComment, dispatch, isGuest],
    );

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
            <View style={[globalStyle.flexRowBetween, { marginBottom: 20 }]}>
                <Text style={[globalStyle.gbtext, { lineHeight: 20, fontSize: 12 }]}>{user?.username}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <ShortButton
                        title={getString('새로고침')}
                        titleStyle={{ fontSize: 10 }}
                        buttonStyle={[globalStyle.shortSmall, { marginRight: 5 }]}
                        onPress={() => {
                            refetch();
                        }}
                    />
                    <ShortButton
                        title={getString('공지보기')}
                        titleStyle={{ fontSize: 10 }}
                        buttonStyle={globalStyle.shortSmall}
                        onPress={moveToNotice}
                    />
                </View>
            </View>
            <MultilineInput
                onlyRead={false}
                value={text}
                onChangeText={setText}
                placeholder={getString('이곳에 자유롭게 글을 남겨주세요')}
                placeholderTextColor={themeContext.color.disabled}
                onPress={() => {
                    createComment(text).catch(console.log);
                }}
            />
            <View style={{ alignItems: 'flex-start', paddingTop: 12, zIndex: 1 }}>
                <FilterButton
                    filterType={OpinionFilterType}
                    currentFilter={filter}
                    setFilter={(value) => {
                        setFilter(value as OpinionFilterType);
                    }}
                />
            </View>
            {commentsData?.map((comment, index) => (
                <OpinionCard
                    key={`comment_${comment.id}`}
                    activityId={id}
                    post={comment}
                    status={commentsStatus ? commentsStatus[index] : undefined}
                />
            ))}
            {commentsData && commentsData.length < commentsCount && (
                <Button
                    title={getString('더보기')}
                    onPress={() => {
                        fetchMore();
                    }}
                    buttonStyle={{ marginTop: 10 }}
                />
            )}
        </View>
    );
}

export default Discussion;
