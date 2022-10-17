import React, { useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import getString from '~/utils/locales/STRINGS';

export const useReport = () => {
    const { reportPost, restorePost } = useContext(ProposalContext);
    const { isGuest } = useContext(AuthContext);
    const dispatch = useAppDispatch();

    const report = useCallback(
        (activityId: string, postId: string) => {
            if (isGuest) {
                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                return;
            }

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
                            reportPost(activityId, postId)
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
        },
        [dispatch, isGuest, reportPost],
    );

    const restore = useCallback(
        (activityId: string, postId: string) => {
            if (isGuest) {
                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                return;
            }

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
                            restorePost(activityId, postId)
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
        },
        [dispatch, isGuest, restorePost],
    );

    return { report, restore };
};

export default useReport;
