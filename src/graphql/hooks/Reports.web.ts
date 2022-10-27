import React, { useCallback, useContext } from 'react';
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

            if (window.confirm(getString('이 게시물을 신고하시겠습니까?'))) {
                reportPost(activityId, postId)
                    .then((succeeded) => {
                        dispatch(showSnackBar(getString('신고 처리가 완료되었습니다')));
                    })
                    .catch((err) => {
                        console.log('catch exception while reportPost : ', err);
                        dispatch(showSnackBar(getString('신고 처리 중 오류가 발생했습니다')));
                    });
            }
        },
        [dispatch, isGuest, reportPost],
    );

    const restore = useCallback(
        (activityId: string, postId: string) => {
            if (isGuest) {
                dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                return;
            }

            if (window.confirm(getString('신고를 취소하시겠습니까?'))) {
                restorePost(activityId, postId)
                    .then((succeeded) => {
                        dispatch(showSnackBar(getString('신고취소 처리가 완료되었습니다')));
                    })
                    .catch((err) => {
                        console.log('catch exception while restorePost : ', err);
                        dispatch(showSnackBar(getString('신고취소 처리 중 오류가 발생했습니다')));
                    });
            }
        },
        [dispatch, isGuest, restorePost],
    );

    return { report, restore };
};

export default useReport;
