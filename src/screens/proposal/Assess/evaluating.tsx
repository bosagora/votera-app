import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Button, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { getCommonPeriodText } from '~/utils/time';
import CommonButton from '~/components/button/CommonButton';
import { CheckIcon } from '~/components/icons';
import { Proposal } from '~/graphql/generated/generated';

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    evalButton: {
        alignItems: 'center',
        borderRadius: 10,
        height: 30,
        justifyContent: 'center',
        width: 29,
    },
    evalLabel: {
        fontSize: 12,
        lineHeight: 51,
    },
});

export interface AssessResult {
    sequence: number;
    value: number;
}

export enum EnumAssess {
    COMPLETENESS = 0,
    REALIZATION,
    PROFITABILITY,
    ATTRACTIVENESS,
    EXPANSION,
}

const EVAL_LENGTH = 10;

interface EvalProps {
    evalName: string;
    score: number | undefined;
    onChange: (value: number) => void;
}

function EvalComponent(props: EvalProps): JSX.Element {
    const { evalName, score, onChange } = props;
    const themeContext = useContext(ThemeContext);
    const [buttons, setButtons] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const newButtons: JSX.Element[] = [];
        for (let i = 0; i < EVAL_LENGTH; i += 1) {
            const isSelect = score === i;
            newButtons.push(
                <TouchableOpacity
                    style={[
                        styles.evalButton,
                        isSelect
                            ? { borderWidth: 0, backgroundColor: themeContext.color.primary }
                            : {
                                  borderWidth: 2,
                                  borderColor: themeContext.color.boxBorder,
                                  backgroundColor: themeContext.color.white,
                              },
                    ]}
                    key={`button_${evalName}_${i}`}
                    onPress={() => onChange(i)}
                >
                    <Text
                        style={[
                            globalStyle.rmtext,
                            styles.evalLabel,
                            { color: isSelect ? 'white' : 'rgb(219,213,235)' },
                        ]}
                    >
                        {i + 1}
                    </Text>
                </TouchableOpacity>,
            );
        }
        setButtons(newButtons);
    }, [evalName, onChange, score, themeContext.color.boxBorder, themeContext.color.primary, themeContext.color.white]);

    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={[globalStyle.rtext, { fontSize: 13, lineHeight: 24, color: themeContext.color.black }]}>
                {evalName}
            </Text>
            <View style={styles.buttonsContainer}>{buttons}</View>
        </View>
    );
}

interface Props {
    onEvaluating: (result: AssessResult[]) => Promise<void>;
    proposal: Proposal | undefined;
}

function Evaluating(props: Props): JSX.Element {
    const { proposal, onEvaluating } = props;
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { isGuest, metamaskStatus, metamaskProvider, metamaskConnect, metamaskSwitch } = useContext(AuthContext);
    const [completeness, setCompleteness] = useState<number | undefined>(undefined);
    const [realization, setRealization] = useState<number | undefined>(undefined);
    const [profitability, setProfitability] = useState<number | undefined>(undefined);
    const [attractiveness, setAttractiveness] = useState<number | undefined>(undefined);
    const [expansion, setExpansion] = useState<number | undefined>(undefined);
    const [allCheck, setAllcheck] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (
            completeness !== undefined &&
            realization !== undefined &&
            profitability !== undefined &&
            attractiveness !== undefined &&
            expansion !== undefined
        ) {
            setAllcheck(true);
        } else {
            setAllcheck(false);
        }
    }, [completeness, realization, profitability, attractiveness, expansion]);

    const renderButton = useCallback(() => {
        if (!metamaskProvider) {
            return null;
        }

        switch (metamaskStatus) {
            case MetamaskStatus.INITIALIZING:
            case MetamaskStatus.CONNECTING:
                return (
                    <View style={[globalStyle.flexRowCenter, { marginTop: 63 }]}>
                        <ActivityIndicator size="large" />
                    </View>
                );
            case MetamaskStatus.NOT_CONNECTED:
                return (
                    <View style={[globalStyle.flexRowCenter, { marginTop: 63 }]}>
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
                    <View style={[globalStyle.flexRowCenter, { marginTop: 63 }]}>
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
            <>
                <View style={{ marginTop: 63 }}>
                    <EvalComponent evalName={getString('제안완성도')} score={completeness} onChange={setCompleteness} />
                    <EvalComponent evalName={getString('실현가능성')} score={realization} onChange={setRealization} />
                    <EvalComponent evalName={getString('수익성')} score={profitability} onChange={setProfitability} />
                    <EvalComponent evalName={getString('매력도')} score={attractiveness} onChange={setAttractiveness} />
                    <EvalComponent evalName={getString('확장가능성')} score={expansion} onChange={setExpansion} />
                </View>

                <View style={{ alignItems: 'center', marginTop: 22 }}>
                    {loading && <ActivityIndicator style={{ height: 50 }} />}
                    {!loading && (
                        <Button
                            onPress={() => {
                                if (isGuest) {
                                    dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                                } else if (!allCheck) {
                                    dispatch(showSnackBar(getString('필수 항목을 입력해주세요')));
                                } else {
                                    setLoading(true);
                                    onEvaluating([
                                        { sequence: EnumAssess.COMPLETENESS, value: (completeness || 0) + 1 },
                                        { sequence: EnumAssess.REALIZATION, value: (realization || 0) + 1 },
                                        { sequence: EnumAssess.PROFITABILITY, value: (profitability || 0) + 1 },
                                        { sequence: EnumAssess.ATTRACTIVENESS, value: (attractiveness || 0) + 1 },
                                        { sequence: EnumAssess.EXPANSION, value: (expansion || 0) + 1 },
                                    ])
                                        .then(() => {
                                            setLoading(false);
                                        })
                                        .catch((err) => {
                                            setLoading(false);
                                        });
                                }
                            }}
                            icon={<CheckIcon color={allCheck ? themeContext.color.primary : 'rgb(219,213,235)'} />}
                            title={getString('평가하기')}
                            titleStyle={[
                                globalStyle.btext,
                                {
                                    fontSize: 18,
                                    lineHeight: 24,
                                    color: allCheck ? themeContext.color.primary : 'rgb(219,213,235)',
                                    marginLeft: 6,
                                },
                            ]}
                            type="clear"
                        />
                    )}
                </View>
            </>
        );
    }, [
        allCheck,
        attractiveness,
        completeness,
        dispatch,
        expansion,
        isGuest,
        loading,
        metamaskConnect,
        metamaskProvider,
        metamaskStatus,
        metamaskSwitch,
        onEvaluating,
        profitability,
        realization,
        themeContext.color.primary,
    ]);

    return (
        <View>
            <View style={{ alignItems: 'center' }}>
                <Text style={[globalStyle.btext, { fontSize: 18, lineHeight: 28, color: themeContext.color.primary }]}>
                    {getString('제안 적합도 평가하기')}
                </Text>
                <Text
                    style={[
                        globalStyle.ltext,
                        {
                            textAlign: 'center',
                            fontSize: 13,
                            lineHeight: 23,
                            marginTop: 12,
                            color: themeContext.color.black,
                        },
                    ]}
                >
                    {getString('해당 제안을 평가해주세요&#46;\n평가된 평균점수가 ')}
                    <Text style={{ color: themeContext.color.primary }}>{getString('7점 이상일 경우')}</Text>
                    {getString('에 한해\n정식제안으로 오픈됩니다&#46;')}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}>
                <Text style={[globalStyle.rtext, { fontSize: 13, lineHeight: 24, color: themeContext.color.black }]}>
                    {getString('평가기간')}
                </Text>
                <Text
                    style={[
                        globalStyle.ltext,
                        { fontSize: 13, lineHeight: 24, color: themeContext.color.black, marginLeft: 19 },
                    ]}
                >
                    {getCommonPeriodText(proposal?.assessPeriod)}
                </Text>
            </View>
            {renderButton()}
        </View>
    );
}

export default Evaluating;
