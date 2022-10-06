import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';
import { BigNumber } from 'ethers';
import dayjs from 'dayjs';
import { VoteStatusPayload, Enum_Vote_Proposal_State as EnumVoteProposalState } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import getString from '~/utils/locales/STRINGS';
import { afterCalc } from '~/utils/time';

const styles = StyleSheet.create({
    metaButton: {
        justifyContent: 'center',
        paddingHorizontal: 21,
    },
    metaContainer: {
        alignSelf: 'center',
        borderRadius: 25,
        width: 360,
    },
    metaDisableTitle: {
        color: 'white',
    },
    metaDisabled: {
        backgroundColor: 'rgb(235,231,245)',
        borderColor: 'rgb(235,231,245)',
    },
    metaTitle: {
        marginRight: 12,
    },
    resultContainer: {
        marginTop: 30,
        width: '100%',
    },
    resultRowBackground: {
        backgroundColor: 'rgb(242,244,250)',
        flex: 1,
        height: 13,
        marginHorizontal: 21,
    },
    resultRowWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 4,
    },
    withdrawContainer: {
        flex: 1,
        justifyContent: 'center',
        marginVertical: 25,
    },
});

function selectResultText(state?: EnumVoteProposalState | null) {
    switch (state) {
        case EnumVoteProposalState.Approved:
        case EnumVoteProposalState.Withdrawn:
            return getString('통과!');
        case EnumVoteProposalState.InvalidQuorum:
        case EnumVoteProposalState.Rejected:
            return getString('탈락!');
        case EnumVoteProposalState.AssessmentFailed:
            return getString('사전평가 탈락!');
        case EnumVoteProposalState.Running:
            return getString('투표중');
        default:
            return getString('투표 준비중');
    }
}

function isValidVoteResult(state?: EnumVoteProposalState | null) {
    switch (state) {
        case EnumVoteProposalState.Approved:
        case EnumVoteProposalState.Withdrawn:
        case EnumVoteProposalState.InvalidQuorum:
        case EnumVoteProposalState.Rejected:
            return true;
        default:
            return false;
    }
}

interface VoteResultProps {
    data: VoteStatusPayload | undefined | null;
    runWithdraw: () => Promise<string>;
}

function VoteResult(props: VoteResultProps): JSX.Element {
    const { data, runWithdraw } = props;
    const themeContext = useContext(ThemeContext);
    const [graphMaxWidth, setGraphMaxWidth] = useState(0);
    const [total, setTotal] = useState(0);
    const [participated, setParticipated] = useState(0);
    const [runningTx, setRunningTx] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

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

    const selectResultColor = (state?: EnumVoteProposalState | null) => {
        switch (state) {
            case EnumVoteProposalState.Approved:
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

    const calcWidth = (value?: string | null) => {
        if (!value) return 0;
        const v = BigNumber.from(value);
        if (!graphMaxWidth || v.isZero()) return 0;
        return (graphMaxWidth * v.toNumber()) / participated;
    };

    const renderVoteResult = (): JSX.Element | null => {
        if (!isValidVoteResult(data?.voteProposalState)) {
            return null;
        }

        return (
            <>
                <View style={styles.resultContainer}>
                    <View style={styles.resultRowWrapper}>
                        <Text style={[globalStyle.mtext, { color: themeContext.color.agree }]}>
                            {getString('찬성')}
                        </Text>
                        <View
                            style={styles.resultRowBackground}
                            onLayout={(event) => {
                                const { width } = event.nativeEvent.layout;
                                if (!graphMaxWidth) setGraphMaxWidth(width);
                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    backgroundColor: themeContext.color.agree,
                                    width: calcWidth(data?.voteResult ? data.voteResult[1] : null),
                                    height: 13,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.mtext, { color: themeContext.color.agree }]}>
                            {data?.voteResult ? data.voteResult[1] : '0'}
                        </Text>
                    </View>
                    <View style={styles.resultRowWrapper}>
                        <Text style={[globalStyle.mtext, { color: themeContext.color.disagree }]}>
                            {getString('반대')}
                        </Text>
                        <View style={styles.resultRowBackground}>
                            <View
                                style={{
                                    position: 'absolute',
                                    backgroundColor: themeContext.color.disagree,
                                    width: calcWidth(data?.voteResult ? data.voteResult[2] : null),
                                    height: 13,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.mtext, { color: themeContext.color.disagree }]}>
                            {data?.voteResult ? data.voteResult[2] : '0'}
                        </Text>
                    </View>
                    <View style={styles.resultRowWrapper}>
                        <Text style={[globalStyle.mtext, { color: themeContext.color.abstain }]}>기권</Text>
                        <View style={styles.resultRowBackground}>
                            <View
                                style={{
                                    position: 'absolute',
                                    backgroundColor: themeContext.color.abstain,
                                    width: calcWidth(data?.voteResult ? data.voteResult[0] : null),
                                    height: 13,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.mtext, { color: themeContext.color.abstain }]}>
                            {data?.voteResult ? data.voteResult[0] : '0'}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ color: themeContext.color.primary }}>{getString('투표에 참여한 노드 수')}</Text>
                    <Text style={{ color: themeContext.color.primary, marginLeft: 9 }}>{participated}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Text style={{ color: themeContext.color.primary }}>{getString('총 노드 수')}</Text>
                    <Text style={{ color: themeContext.color.primary, marginLeft: 9 }}>{total}</Text>
                </View>
            </>
        );
    };

    const renderWithdraw = () => {
        if (!data?.isProposer) {
            return null;
        }

        if (data.voteProposalState === EnumVoteProposalState.Withdrawn) {
            return (
                <View style={styles.withdrawContainer}>
                    <CommonButton
                        title={getString('자금인출완료')}
                        containerStyle={styles.metaContainer}
                        buttonStyle={styles.metaButton}
                        titleStyle={styles.metaTitle}
                        filled
                        disabledStyle={styles.metaDisabled}
                        disabledTitleStyle={styles.metaDisableTitle}
                        disabled
                        raised
                    />
                </View>
            );
        }
        if (data.voteProposalState === EnumVoteProposalState.Approved) {
            if (runningTx) {
                return (
                    <View style={styles.withdrawContainer}>
                        <CommonButton
                            title={getString('자금인출처리중')}
                            containerStyle={styles.metaContainer}
                            buttonStyle={styles.metaButton}
                            titleStyle={styles.metaTitle}
                            filled
                            disabledStyle={styles.metaDisabled}
                            disabledTitleStyle={styles.metaDisableTitle}
                            disabled
                            raised
                        />
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
                            <CommonButton
                                title={getString('{} 후부터 자금인출가능').replace('{}', afterCalc(diff))}
                                containerStyle={styles.metaContainer}
                                buttonStyle={styles.metaButton}
                                titleStyle={styles.metaTitle}
                                filled
                                disabledStyle={styles.metaDisabled}
                                disabledTitleStyle={styles.metaDisableTitle}
                                disabled
                                raised
                            />
                            <Text style={{ marginTop: 13 }}>
                                {getString('자금은 개표 마감 시간 24시간 이후부터 인출할 수 있습니다&#46;')}
                            </Text>
                        </View>
                    );
                }
            }
            return (
                <View style={styles.withdrawContainer}>
                    <CommonButton
                        title={getString('자금인출하기')}
                        containerStyle={styles.metaContainer}
                        buttonStyle={styles.metaButton}
                        titleStyle={styles.metaTitle}
                        filled
                        disabledStyle={styles.metaDisabled}
                        disabledTitleStyle={styles.metaDisableTitle}
                        onPress={() => {
                            setRunningTx(true);
                            runWithdraw()
                                .then((msg) => {
                                    setErrorMessage(msg);
                                })
                                .catch((err) => {
                                    console.log('runWithdraw error = ', err);
                                    setErrorMessage(getString('자금인출 시 알 수 없는 오류가 발생헀습니다&#46;'));
                                })
                                .finally(() => {
                                    setRunningTx(false);
                                });
                        }}
                        raised
                    />
                    {errorMessage && (
                        <Text style={{ marginTop: 13, color: themeContext.color.error }}>{errorMessage}</Text>
                    )}
                </View>
            );
        }
        return null;
    };

    return (
        <View style={{ backgroundColor: 'white' }}>
            <View
                style={{
                    paddingHorizontal: 22,
                    alignItems: 'center',
                    backgroundColor: 'white',
                    marginBottom: 3,
                    paddingVertical: 30,
                }}
            >
                <Text style={[globalStyle.btext, { fontSize: 33, color: selectResultColor(data?.voteProposalState) }]}>
                    {selectResultText(data?.voteProposalState)}
                </Text>
                {renderVoteResult()}
                {renderWithdraw()}
            </View>
        </View>
    );
}

export default VoteResult;
