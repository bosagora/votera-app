import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Image, ImageURISource } from 'react-native';
import { useAssets } from 'expo-asset';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';
import { BigNumber } from 'ethers';
import dayjs from 'dayjs';
import {
    Proposal,
    VoteStatusPayload,
    Enum_Vote_Proposal_State as EnumVoteProposalState,
    useListMyBallotsQuery,
    MyBallot,
} from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import getString from '~/utils/locales/STRINGS';
import { afterCalc } from '~/utils/time';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import { CloseIcon } from '~/components/icons';

enum EnumIconAsset {
    Abstain = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/prohibit.png')];

const styles = StyleSheet.create({
    ballotText: {
        fontSize: 13,
        lineHeight: 21,
        textAlign: 'right',
        width: 32,
    },
    imageAbstain: {
        height: 16,
        width: 16,
    },
    infoContainer: {
        alignItems: 'center',
        backgroundColor: 'rgb(182,175,198)',
        borderRadius: 25,
        height: 50,
        justifyContent: 'center',
        width: 360,
    },
    infoMsg: { fontSize: 13, marginTop: 13 },
    infoText: { color: 'white', fontSize: 14 },
    itemBallotContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    metaButton: {
        justifyContent: 'center',
        paddingHorizontal: 21,
    },
    metaContainer: {
        alignSelf: 'center',
        borderRadius: 25,
        width: 360,
    },
    metaTitle: {
        marginRight: 12,
    },
    myBallotContainer: {
        borderBottomWidth: 1,
        height: 70,
        paddingTop: 25,
    },
    myBallotLabel: {
        fontSize: 13,
        lineHeight: 21,
    },
    resultAbstain: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    resultAgree: {
        borderRadius: 7,
        borderWidth: 2,
        height: 14,
        marginHorizontal: 3,
        marginTop: 4,
        width: 14,
    },
    resultContainer: {
        marginTop: 30,
        width: '100%',
    },
    resultLabel: { fontSize: 13, lineHeight: 55, width: 50 },
    resultRowBackground: {
        flex: 1,
        height: 13,
    },
    resultRowWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 4,
    },
    resultValue: { fontSize: 12, lineHeight: 55, textAlign: 'right', width: 50 },
    voterLabel: { fontSize: 13, lineHeight: 23 },
    voterValue: { fontSize: 13, lineHeight: 23, marginLeft: 9 },
    withdrawContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginVertical: 40,
    },
});

function selectResultText(state?: EnumVoteProposalState | null) {
    switch (state) {
        case EnumVoteProposalState.Approved:
        case EnumVoteProposalState.Notallowed:
        case EnumVoteProposalState.Withdrawn:
            return getString('??????!');
        case EnumVoteProposalState.InvalidQuorum:
        case EnumVoteProposalState.Rejected:
            return getString('??????!');
        case EnumVoteProposalState.AssessmentFailed:
            return getString('???????????? ??????!');
        case EnumVoteProposalState.Running:
            return getString('?????????');
        default:
            return getString('?????????');
    }
}

function isValidVoteResult(state?: EnumVoteProposalState | null) {
    switch (state) {
        case EnumVoteProposalState.Approved:
        case EnumVoteProposalState.Notallowed:
        case EnumVoteProposalState.Withdrawn:
        case EnumVoteProposalState.InvalidQuorum:
        case EnumVoteProposalState.Rejected:
            return true;
        default:
            return false;
    }
}

function isRejectedVoteResult(state?: EnumVoteProposalState | null) {
    switch (state) {
        case EnumVoteProposalState.InvalidQuorum:
        case EnumVoteProposalState.Rejected:
            return true;
        default:
            return false;
    }
}

function getBigNumberFrom(value?: string | null) {
    return BigNumber.from(value || '0');
}

function getRejectedTooltip(state?: EnumVoteProposalState | null, voteResult?: (string | null)[] | null) {
    if (state === EnumVoteProposalState.InvalidQuorum) {
        return getString('?????????(??? ????????? ?????? 1/3)??? ????????? ???????????????&#46;');
    }
    if (state === EnumVoteProposalState.Rejected) {
        const yesCount = getBigNumberFrom(voteResult ? voteResult[VOTE_SELECT.YES] : '0');
        const noCount = getBigNumberFrom(voteResult ? voteResult[VOTE_SELECT.NO] : '0');
        return yesCount.gt(noCount)
            ? getString('????????? ??????(???????????? ???????????? ????????? ?????? ???????????????\n10%??????)?????? ?????????????????????&#46;')
            : getString('????????? ???????????? ?????????????????????&#46;');
    }
    return '';
}

interface VoteResultProps {
    proposal: Proposal | undefined;
    data: VoteStatusPayload | undefined | null;
    runWithdraw: () => Promise<string>;
}

function VoteResult(props: VoteResultProps): JSX.Element {
    const { proposal, data, runWithdraw } = props;
    const themeContext = useContext(ThemeContext);
    const { isGuest, user, metamaskStatus, metamaskProvider, metamaskConnect, metamaskSwitch } =
        useContext(AuthContext);
    const [graphMaxWidth, setGraphMaxWidth] = useState(0);
    const [total, setTotal] = useState(0);
    const [participated, setParticipated] = useState(0);
    const [runningTx, setRunningTx] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [showTooltip, setShowTooltip] = useState(false);
    const [assets] = useAssets(iconAssets);
    const [count, setCount] = useState(0);
    const [myBallots, setMyBallots] = useState<MyBallot[]>([]);
    const {
        data: myBallotsData,
        fetchMore,
        loading,
    } = useListMyBallotsQuery({
        fetchPolicy: 'cache-and-network',
        skip: isGuest || !user || !proposal,
        variables: { proposalId: proposal?.proposalId || '', actor: user?.memberId || '', sort: 'createdAt:desc' },
    });

    useEffect(() => {
        if (data?.validatorSize) {
            setTotal(BigNumber.from(data.validatorSize).toNumber());
        } else {
            setTotal(0);
        }
        if (data?.voteResult) {
            let value = 0;
            for (let i = 0; i < data.voteResult.length; i += 1) {
                value += BigNumber.from(data.voteResult[i]).toNumber();
            }
            setParticipated(value);
        } else {
            setParticipated(0);
        }
    }, [data?.voteResult, data?.validatorSize]);

    useEffect(() => {
        if (myBallotsData?.listMyBallots) {
            setCount(myBallotsData.listMyBallots.count ?? 0);
            setMyBallots(myBallotsData.listMyBallots.values as MyBallot[]);
        }
    }, [myBallotsData]);

    const selectResultColor = (state?: EnumVoteProposalState | null) => {
        switch (state) {
            case EnumVoteProposalState.Approved:
            case EnumVoteProposalState.Notallowed:
            case EnumVoteProposalState.Withdrawn:
                return themeContext.color.agree;
            case EnumVoteProposalState.InvalidQuorum:
            case EnumVoteProposalState.Rejected:
                return themeContext.color.disagree;
            case EnumVoteProposalState.AssessmentFailed:
                return themeContext.color.abstain;
            default:
                return themeContext.color.primary;
        }
    };

    const calcWidth = useCallback(
        (value?: string | null) => {
            if (!value) return 0;
            const v = BigNumber.from(value);
            if (!graphMaxWidth || v.isZero()) return 0;
            return (graphMaxWidth * v.toNumber()) / participated;
        },
        [graphMaxWidth, participated],
    );

    useEffect(() => {
        let tm: NodeJS.Timeout | undefined;
        if (showTooltip) {
            tm = setTimeout(() => {
                setShowTooltip(false);
            }, 3000);
        }
        return () => {
            if (tm) {
                clearTimeout(tm);
            }
        };
    }, [showTooltip]);

    const renderVoteResult = useCallback((): JSX.Element | null => {
        if (!isValidVoteResult(data?.voteProposalState)) {
            return null;
        }

        return (
            <>
                <View style={styles.resultContainer}>
                    <View style={styles.resultRowWrapper}>
                        <Text style={[globalStyle.mtext, styles.resultLabel, { color: themeContext.color.agree }]}>
                            {getString('??????')}
                        </Text>
                        <View
                            style={[styles.resultRowBackground, { backgroundColor: themeContext.color.gray }]}
                            onLayout={(event) => {
                                const { width } = event.nativeEvent.layout;
                                if (!graphMaxWidth) setGraphMaxWidth(width);
                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    backgroundColor: themeContext.color.agree,
                                    width: calcWidth(data?.voteResult ? data.voteResult[VOTE_SELECT.YES] : null),
                                    height: 13,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.mtext, styles.resultValue, { color: themeContext.color.agree }]}>
                            {data?.voteResult ? data.voteResult[VOTE_SELECT.YES] : '0'}
                        </Text>
                    </View>
                    <View style={styles.resultRowWrapper}>
                        <Text style={[globalStyle.mtext, styles.resultLabel, { color: themeContext.color.disagree }]}>
                            {getString('??????')}
                        </Text>
                        <View style={[styles.resultRowBackground, { backgroundColor: themeContext.color.gray }]}>
                            <View
                                style={{
                                    position: 'absolute',
                                    backgroundColor: themeContext.color.disagree,
                                    width: calcWidth(data?.voteResult ? data.voteResult[VOTE_SELECT.NO] : null),
                                    height: 13,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.mtext, styles.resultValue, { color: themeContext.color.disagree }]}>
                            {data?.voteResult ? data.voteResult[VOTE_SELECT.NO] : '0'}
                        </Text>
                    </View>
                    <View style={styles.resultRowWrapper}>
                        <Text style={[globalStyle.mtext, styles.resultLabel, { color: themeContext.color.abstain }]}>
                            {getString('??????')}
                        </Text>
                        <View style={[styles.resultRowBackground, { backgroundColor: themeContext.color.gray }]}>
                            <View
                                style={{
                                    position: 'absolute',
                                    backgroundColor: themeContext.color.abstain,
                                    width: calcWidth(data?.voteResult ? data.voteResult[VOTE_SELECT.BLANK] : null),
                                    height: 13,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.mtext, styles.resultValue, { color: themeContext.color.abstain }]}>
                            {data?.voteResult ? data.voteResult[VOTE_SELECT.BLANK] : '0'}
                        </Text>
                    </View>
                </View>

                <View style={[globalStyle.flexRowAlignCenter, { marginTop: 20 }]}>
                    <Text style={[globalStyle.rtext, styles.voterLabel, { color: themeContext.color.primary }]}>
                        {getString('????????? ????????? ????????? ???')}
                    </Text>
                    <Text style={[globalStyle.rtext, styles.voterValue, { color: themeContext.color.primary }]}>
                        {participated}
                    </Text>
                </View>

                <View style={[globalStyle.flexRowAlignCenter, { marginTop: 5, marginBottom: 20 }]}>
                    <Text style={[globalStyle.rtext, styles.voterLabel, { color: themeContext.color.primary }]}>
                        {getString('??? ????????? ???')}
                    </Text>
                    <Text style={[globalStyle.rtext, styles.voterValue, { color: themeContext.color.primary }]}>
                        {total}
                    </Text>
                </View>
            </>
        );
    }, [
        calcWidth,
        data?.voteProposalState,
        data?.voteResult,
        graphMaxWidth,
        participated,
        themeContext.color.abstain,
        themeContext.color.agree,
        themeContext.color.disagree,
        themeContext.color.gray,
        themeContext.color.primary,
        total,
    ]);

    const callWithdraw = useCallback(() => {
        setRunningTx(true);
        runWithdraw()
            .then((msg) => {
                setErrorMessage(msg);
            })
            .catch((err) => {
                console.log('runWithdraw error = ', err);
                setErrorMessage(getString('???????????? ??? ??? ??? ?????? ????????? ??????????????????&#46;'));
            })
            .finally(() => {
                setRunningTx(false);
            });
    }, [runWithdraw]);

    const renderWithdraw = useCallback(() => {
        if (!data?.isProposer) {
            return null;
        }

        if (data.voteProposalState === EnumVoteProposalState.Withdrawn) {
            return (
                <View style={styles.withdrawContainer}>
                    <View style={styles.infoContainer}>
                        <Text style={[globalStyle.btext, styles.infoText]}>{getString('??????????????????')}</Text>
                    </View>
                </View>
            );
        }
        if (data.voteProposalState === EnumVoteProposalState.Notallowed) {
            return (
                <View style={styles.withdrawContainer}>
                    <View style={styles.infoContainer}>
                        <Text style={[globalStyle.btext, styles.infoText]}>
                            {getString('???????????? ???????????? ???????????? ??????')}
                        </Text>
                    </View>
                </View>
            );
        }
        if (data.voteProposalState === EnumVoteProposalState.Approved) {
            if (runningTx) {
                return (
                    <View style={styles.withdrawContainer}>
                        <View style={styles.infoContainer}>
                            <Text style={[globalStyle.btext, styles.infoText]}>{getString('?????????????????????')}</Text>
                        </View>
                    </View>
                );
            }
            if (data.canWithdrawAt) {
                const now = dayjs();
                const countingTime = dayjs(data.canWithdrawAt * 1000);
                const diff = countingTime.diff(now, 'h', true);
                if (diff > 0) {
                    return (
                        <View style={styles.withdrawContainer}>
                            <View style={styles.infoContainer}>
                                <Text style={[globalStyle.btext, styles.infoText]}>
                                    {getString('{} ????????? ??????????????????').replace('{}', afterCalc(diff))}
                                </Text>
                            </View>
                            <Text style={[globalStyle.rtext, styles.infoMsg]}>
                                {getString('????????? ?????? ?????? ?????? 24?????? ???????????? ????????? ??? ????????????&#46;')}
                            </Text>
                        </View>
                    );
                }
            }
            if (!metamaskProvider) {
                return null;
            }
            switch (metamaskStatus) {
                case MetamaskStatus.INITIALIZING:
                case MetamaskStatus.CONNECTING:
                    return (
                        <View style={styles.withdrawContainer}>
                            <ActivityIndicator style={{ height: 50 }} />
                        </View>
                    );
                case MetamaskStatus.NOT_CONNECTED:
                    return (
                        <View style={styles.withdrawContainer}>
                            <CommonButton
                                title={getString('??????????????? ????????????')}
                                buttonStyle={globalStyle.metaButton}
                                filled
                                onPress={metamaskConnect}
                                raised
                            />
                        </View>
                    );
                case MetamaskStatus.OTHER_CHAIN:
                    return (
                        <View style={styles.withdrawContainer}>
                            <CommonButton
                                title={getString('??????????????? ?????? ??????')}
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
                <View style={styles.withdrawContainer}>
                    <CommonButton
                        title={getString('??????????????????')}
                        containerStyle={styles.metaContainer}
                        buttonStyle={styles.metaButton}
                        titleStyle={styles.metaTitle}
                        filled
                        onPress={() => {
                            callWithdraw();
                        }}
                        raised
                    />
                    {errorMessage && (
                        <Text style={[globalStyle.rtext, styles.infoMsg, { color: themeContext.color.error }]}>
                            {errorMessage}
                        </Text>
                    )}
                </View>
            );
        }
        return null;
    }, [
        callWithdraw,
        data?.canWithdrawAt,
        data?.isProposer,
        data?.voteProposalState,
        errorMessage,
        metamaskConnect,
        metamaskProvider,
        metamaskStatus,
        metamaskSwitch,
        runningTx,
        themeContext.color.error,
    ]);

    const showBallotResult = useCallback(
        (choice?: number | null): JSX.Element => {
            if (choice === VOTE_SELECT.YES) {
                return (
                    <View style={styles.itemBallotContainer}>
                        <View style={[styles.resultAgree, { borderColor: themeContext.color.agree }]} />
                        <Text style={[globalStyle.btext, styles.ballotText, { color: themeContext.color.agree }]}>
                            {getString('??????')}
                        </Text>
                    </View>
                );
            }
            if (choice === VOTE_SELECT.NO) {
                return (
                    <View style={styles.itemBallotContainer}>
                        <CloseIcon color={themeContext.color.disagree} size={20} />
                        <Text style={[globalStyle.btext, styles.ballotText, { color: themeContext.color.disagree }]}>
                            {getString('??????')}
                        </Text>
                    </View>
                );
            }
            return (
                <View style={styles.itemBallotContainer}>
                    {assets && (
                        <View style={styles.resultAbstain}>
                            <Image
                                source={assets[EnumIconAsset.Abstain] as ImageURISource}
                                resizeMode="contain"
                                style={styles.imageAbstain}
                            />
                        </View>
                    )}
                    <Text style={[globalStyle.btext, styles.ballotText, { color: themeContext.color.abstain }]}>
                        {getString('??????')}
                    </Text>
                </View>
            );
        },
        [assets, themeContext.color.abstain, themeContext.color.agree, themeContext.color.disagree],
    );

    const renderMyBallots = useCallback(() => {
        if (isGuest || !user) {
            return null;
        }
        if (loading) {
            return (
                <View style={[globalStyle.center, { height: 50 }]}>
                    <ActivityIndicator />
                </View>
            );
        }
        return (
            <View style={{ justifyContent: 'flex-start', width: '100%' }}>
                <View style={globalStyle.lineComponent} />
                <Text style={[globalStyle.rtext, styles.myBallotLabel, { color: themeContext.color.textBlack }]}>
                    {getString('????????? ??????')}
                </Text>
                {myBallots.map((myBallot, index) => (
                    <View
                        style={[styles.myBallotContainer, { borderBottomColor: themeContext.color.divider }]}
                        key={`myBallot.${myBallot.id}`}
                    >
                        <View style={[globalStyle.flexRowBetween]}>
                            <Text
                                style={[
                                    globalStyle.ltext,
                                    styles.myBallotLabel,
                                    { color: themeContext.color.textBlack },
                                ]}
                            >
                                {dayjs(myBallot.createdAt as string).format(getString('YYYY??? M??? D??? HH:mm'))}
                            </Text>
                            {showBallotResult(myBallot.choice)}
                        </View>
                    </View>
                ))}
            </View>
        );
    }, [isGuest, user, loading, themeContext.color.textBlack, themeContext.color.divider, myBallots, showBallotResult]);

    return (
        <View style={{ backgroundColor: 'white' }}>
            <View
                style={{
                    paddingHorizontal: 22,
                    alignItems: 'center',
                    marginBottom: 3,
                    paddingVertical: 30,
                }}
            >
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text
                        style={[
                            globalStyle.btext,
                            { fontSize: 31, lineHeight: 29, color: selectResultColor(data?.voteProposalState) },
                        ]}
                    >
                        {selectResultText(data?.voteProposalState)}
                    </Text>
                    {isRejectedVoteResult(data?.voteProposalState) && (
                        <View style={{ marginLeft: 12 }}>
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    height: 16,
                                    width: 16,
                                    backgroundColor: themeContext.color.primary,
                                }}
                                onPress={() => {
                                    setShowTooltip(!showTooltip);
                                }}
                            >
                                <Text
                                    style={[
                                        globalStyle.btext,
                                        { fontSize: 12, lineHeight: 12, color: themeContext.color.white },
                                    ]}
                                >
                                    ?
                                </Text>
                            </TouchableOpacity>
                            {showTooltip && (
                                <TouchableOpacity
                                    style={{
                                        position: 'absolute',
                                        left: -182,
                                        top: 16,
                                        width: 304,
                                        height: 52,
                                        borderRadius: 70,
                                        backgroundColor: themeContext.color.white,
                                        shadowColor: 'rgba(162,163,187,0.29)',
                                        shadowOffset: { width: 0, height: 10 },
                                        shadowRadius: 20,
                                        shadowOpacity: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        setShowTooltip(!showTooltip);
                                    }}
                                >
                                    <Text
                                        style={[
                                            globalStyle.rtext,
                                            { fontSize: 12, lineHeight: 21, color: themeContext.color.textBlack },
                                        ]}
                                    >
                                        {getRejectedTooltip(data?.voteProposalState, data?.voteResult)}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
                {renderVoteResult()}
                {renderWithdraw()}
                {renderMyBallots()}
            </View>
        </View>
    );
}

export default VoteResult;
