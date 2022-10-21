import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, Icon } from 'react-native-elements';
import globalStyle from '~/styles/global';
import ProposalCard from '~/components/proposal/ProposalCard';
import { Post, Proposal, useGetProposalsQuery } from '~/graphql/generated/generated';
import ShortButton from '~/components/button/ShortButton';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import VoteItem, { getVoteString } from '~/components/vote/VoteItem';
import VoteItemGroup from '~/components/vote/VoteItemGroup';
import VoteHistoryComponent from './voteHIstoryComponent';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { MainNavigationProps, replaceToHome } from '~/navigation/main/MainParams';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 41,
    },
    runningMessage: { fontSize: 13, lineHeight: 23, marginTop: 13 },
    warningMessage: { fontSize: 18, lineHeight: 28, marginTop: 13 },
});

// function getVoteSelect(post: Post): VOTE_SELECT | undefined {
//     if (!post.content || !post.content[0]) {
//         return undefined;
//     }
//     if (post.content[0].__typename !== 'ComponentPostSingleChoiceAnswer') {
//         return undefined;
//     }
//     const content = post.content[0];
//     if (!content.selection || !content.selection[0]) {
//         return undefined;
//     }
//     return content.selection[0].value || undefined;
// }

interface Props {
    runVote: (vote: VOTE_SELECT) => Promise<boolean>;
    canVote: boolean;
    needVote: boolean;
}

function Voting(props: Props): JSX.Element {
    const { canVote, needVote, runVote } = props;
    const { proposal, fetchProposal } = useContext(ProposalContext);
    const { user, isGuest, metamaskStatus, metamaskProvider, metamaskConnect, metamaskSwitch } =
        useContext(AuthContext);
    const navigation = useNavigation<MainNavigationProps<'ProposalDetail'>>();
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();

    const [vote, setVote] = useState<VOTE_SELECT>();
    const [oldVote, setOldVote] = useState<VOTE_SELECT>();
    const [isSelected, setIsSelected] = useState(false);
    const [voteComplete, setVoteComplete] = useState(!needVote);
    const [otherProposals, setOtherProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        if (oldVote !== undefined) {
            if (oldVote !== vote) {
                setIsSelected(true);
            } else {
                setIsSelected(false);
            }
        } else if (vote !== undefined) {
            setIsSelected(true);
        }
    }, [vote, oldVote]);

    // const renderOtherProposals = ({ item }: { item: Proposal }) => {
    //     const { proposalId } = item;
    //     return (
    //         <ProposalCard
    //             key={`otherProposal_${item.id}`}
    //             item={item}
    //             onPress={() => {
    //                 if (!proposalId) {
    //                     dispatch(showSnackBar(getString('제안서 정보에 오류가 있습니다')));
    //                     if (navigation.canGoBack()) {
    //                         navigation.pop();
    //                     } else {
    //                         navigation.dispatch(replaceToHome());
    //                     }
    //                 } else {
    //                     fetchProposal(proposalId);
    //                     navigation.push('RootUser', { screen: 'ProposalDetail', params: { id: proposalId } });
    //                 }
    //             }}
    //         />
    //     );
    // };

    const renderMessage = useCallback(() => {
        if (!canVote) {
            return (
                <Text style={[globalStyle.rtext, styles.warningMessage, { color: themeContext.color.textBlack }]}>
                    {getString('제안에 대한 투표가 진행 중 입니다&#46;')}
                </Text>
            );
        }
        if (voteComplete) {
            return (
                <Text style={[globalStyle.btext, styles.warningMessage, { color: themeContext.color.primary }]}>
                    {getString('투표 완료')}
                </Text>
            );
        }
        switch (vote) {
            case VOTE_SELECT.BLANK:
                return (
                    <Text style={[globalStyle.rtext, styles.runningMessage, { color: themeContext.color.abstain }]}>
                        {getString('제안에 기권합니다!')}
                    </Text>
                );
            case VOTE_SELECT.YES:
                return (
                    <Text style={[globalStyle.rtext, styles.runningMessage, { color: themeContext.color.agree }]}>
                        {getString('제안에 찬성합니다!')}
                    </Text>
                );
            case VOTE_SELECT.NO:
                return (
                    <Text style={[globalStyle.rtext, styles.runningMessage, { color: themeContext.color.disagree }]}>
                        {getString('제안에 반대합니다!')}
                    </Text>
                );
            default:
                break;
        }

        return (
            <Text style={[globalStyle.rtext, styles.runningMessage, { color: themeContext.color.textBlack }]}>
                {getString('제안에 대한 투표를 진행해주세요&#46;')}
            </Text>
        );
    }, [
        canVote,
        themeContext.color.abstain,
        themeContext.color.agree,
        themeContext.color.disagree,
        themeContext.color.primary,
        themeContext.color.textBlack,
        vote,
        voteComplete,
    ]);

    const renderButton = useCallback(() => {
        if (!canVote) {
            return null;
        }
        if (voteComplete) {
            return (
                <ShortButton
                    title={getString('수정하기')}
                    buttonStyle={{ marginTop: 100 }}
                    onPress={() => {
                        setVoteComplete(false);
                    }}
                    filled
                    titleStyle={{ fontSize: 13, lineHeight: 23 }}
                />
            );
        }
        if (!metamaskProvider) {
            return null;
        }

        switch (metamaskStatus) {
            case MetamaskStatus.INITIALIZING:
            case MetamaskStatus.CONNECTING:
                return (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 35 }}>
                        <ActivityIndicator />
                    </View>
                );
            case MetamaskStatus.NOT_CONNECTED:
                return (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 35 }}>
                        <CommonButton
                            title={getString('메타마스크 연결하기')}
                            buttonStyle={globalStyle.metaButton}
                            filled
                            onPress={metamaskConnect}
                            raised
                        />
                    </View>
                );
            case MetamaskStatus.OTHER_CHAIN:
                return (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 35 }}>
                        <CommonButton
                            title={getString('메타마스크 체인 변경')}
                            buttonStyle={globalStyle.metaButton}
                            filled
                            onPress={metamaskSwitch}
                            raised
                        />
                    </View>
                );
            default:
                break;
        }

        return (
            <Button
                onPress={() => {
                    if (isGuest) {
                        dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                        return;
                    }
                    if (typeof vote === 'number') {
                        runVote(vote)
                            .then((result) => {
                                if (result) setVoteComplete(true);
                            })
                            .catch((err) => {
                                dispatch(showSnackBar(getString('투표 처리 중 오류가 발생했습니다&#46;')));
                            });
                    } else {
                        setVoteComplete(true);
                    }
                }}
                buttonStyle={{ marginTop: 100 }}
                title={!needVote ? getString('수정하기') : getString('투표하기')}
                titleStyle={[
                    globalStyle.btext,
                    {
                        fontSize: 20,
                        color: isSelected ? themeContext.color.primary : themeContext.color.unchecked,
                        marginLeft: 6,
                    },
                ]}
                icon={
                    <Icon
                        name="check"
                        color={isSelected ? themeContext.color.primary : themeContext.color.unchecked}
                        tvParallaxProperties={undefined}
                    />
                }
                type="clear"
                disabled={!isSelected}
            />
        );
    }, [
        canVote,
        dispatch,
        isGuest,
        isSelected,
        metamaskConnect,
        metamaskProvider,
        metamaskStatus,
        metamaskSwitch,
        needVote,
        runVote,
        themeContext.color.primary,
        themeContext.color.unchecked,
        vote,
        voteComplete,
    ]);

    return (
        <View style={styles.container}>
            {renderMessage()}

            <VoteItemGroup
                onPress={(type: VOTE_SELECT) => {
                    if (metamaskStatus !== MetamaskStatus.CONNECTED) return;
                    if (!canVote) return;
                    if (voteComplete) return;
                    setVote(type);
                }}
                vote={vote}
                disabled={voteComplete}
            />

            {renderButton()}

            {/* {otherVotes?.length ? (
                <View
                    style={{
                        width: '100%',
                        borderTopWidth: 3,
                        borderTopColor: themeContext.color.divider,
                        paddingTop: 30,
                        marginTop: 30,
                    }}
                >
                    <Text>내 투표 기록</Text>
                    {otherVotes?.map((ov) => (
                        <VoteHistoryComponent
                            key={`voteHistory_${ov.id}`}
                            type={getVoteSelect(ov) || VOTE_SELECT.BLANK}
                            name={ov.writer?.username || ''}
                            time={new Date(ov.updatedAt as string)}
                        />
                    ))}
                </View>
            ) : null} */}
        </View>
    );
}

export default Voting;
