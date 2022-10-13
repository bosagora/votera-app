import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from 'styled-components/native';
import { View, StyleSheet } from 'react-native';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import { Button, Text, Icon } from 'react-native-elements';
import globalStyle from '~/styles/global';
import ProposalCard from '~/components/proposal/ProposalCard';
import { Post, Proposal, useGetProposalsQuery } from '~/graphql/generated/generated';
import ShortButton from '~/components/button/ShortButton';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import VoteItem, { getVoteString } from '~/components/vote/VoteItem';
import VoteItemGroup from '~/components/vote/VoteItemGroup';
import VoteHistoryComponent from './voteHIstoryComponent';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { MainNavigationProps } from '~/navigation/main/MainParams';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 41,
    },
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
    const { user, isGuest } = useContext(AuthContext);
    const navigation = useNavigation<MainNavigationProps<'ProposalDetail'>>();
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const linkTo = useLinkTo();

    const [vote, setVote] = useState<VOTE_SELECT | undefined>(undefined);
    const [oldVote, setOldVote] = useState<VOTE_SELECT>();
    const [isSelected, setIsSelected] = useState(false);
    const [voteComplete, setVoteComplete] = useState(!needVote);
    const [otherProposals, setOtherProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        if (oldVote) {
            if (oldVote !== vote) {
                setIsSelected(true);
            } else {
                setIsSelected(false);
            }
        } else if (vote) {
            setIsSelected(true);
        }
    }, [vote, oldVote]);

    const renderOtherProposals = ({ item }: { item: Proposal }) => {
        const { proposalId } = item;
        return (
            <ProposalCard
                key={`otherProposal_${item.id}`}
                item={item}
                onPress={() => {
                    if (!proposalId) {
                        dispatch(showSnackBar(getString('제안서 정보에 오류가 있습니다')));
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            linkTo('/home');
                        }
                    } else {
                        fetchProposal(proposalId);
                        linkTo(`/detail/${proposalId}`);
                    }
                }}
            />
        );
    };

    if (!canVote) {
        return (
            <View style={styles.container}>
                <Text style={{ marginTop: 13 }}>{getString('제안에 대한 투표가 진행 중 입니다&#46;')}</Text>
            </View>
        );
    }

    if (voteComplete) {
        return (
            <View style={styles.container}>
                <Text style={[globalStyle.btext, { color: themeContext.color.primary, marginTop: 5 }]}>
                    {getString('투표 완료')}
                </Text>

                <ShortButton
                    title={getString('수정하기')}
                    buttonStyle={{ marginTop: 17 }}
                    onPress={() => {
                        setVoteComplete(false);
                    }}
                    filled
                />

                <View style={{ width: '100%', height: 1, backgroundColor: 'rgb(235,234,239)', marginTop: 38 }} />
                {/* <View style={{ width: '100%' }}>
                    {otherProposals.map((op) => renderOtherProposals({ item: op }))}
                </View> */}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {vote === undefined && (
                <Text style={{ marginTop: 13 }}>{getString('제안에 대한 투표를 진행해주세요&#46;')}</Text>
            )}
            {vote === VOTE_SELECT.BLANK && (
                <Text style={{ marginTop: 13, color: themeContext.color.abstain }}>
                    {getString('제안에 기권합니다!')}
                </Text>
            )}
            {vote === VOTE_SELECT.YES && (
                <Text style={{ marginTop: 13, color: themeContext.color.agree }}>
                    {getString('제안에 찬성합니다!')}
                </Text>
            )}
            {vote === VOTE_SELECT.NO && (
                <Text style={{ marginTop: 13, color: themeContext.color.disagree }}>
                    {getString('제안에 반대합니다!')}
                </Text>
            )}

            <VoteItemGroup onPress={(type: VOTE_SELECT) => setVote(type)} vote={vote} />
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
                        color: isSelected ? themeContext.color.primary : themeContext.color.disabled,
                        marginLeft: 6,
                    },
                ]}
                icon={
                    <Icon
                        name="check"
                        color={isSelected ? themeContext.color.primary : themeContext.color.disabled}
                        tvParallaxProperties={undefined}
                    />
                }
                type="clear"
                disabled={!isSelected}
            />
            {/* {otherVotes?.length ? (
                <View
                    style={{
                        width: '100%',
                        borderTopWidth: 3,
                        borderTopColor: themeContext.color.gray,
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
