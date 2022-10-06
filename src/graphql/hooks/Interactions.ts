import React, { useCallback, useContext } from 'react';
import { AuthContext } from '~/contexts/AuthContext';
import { useTogglePostLikeMutation } from '../generated/generated';

export const useInteraction = () => {
    const { user } = useContext(AuthContext);
    const [toggleLike] = useTogglePostLikeMutation();

    const runToggleLike = useCallback(
        async (value: { isLike: boolean; postId: string }) => {
            try {
                await toggleLike({
                    variables: {
                        input: {
                            data: {
                                isLike: value.isLike,
                                postId: value.postId,
                                memberId: user?.memberId || '',
                            },
                        },
                    },
                });
            } catch (error) {
                console.log('🚀  Interaction.ts ~ runToggleLike ~ error', error);
            }
        },
        [toggleLike, user?.memberId],
    );

    return { runToggleLike };
};

export default useInteraction;
