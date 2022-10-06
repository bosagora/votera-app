import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Button, Text, Icon } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { getCommonPeriodText } from '~/utils/time';

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    evalButton: {
        alignItems: 'center',
        borderColor: 'rgb(222, 212, 248)',
        borderRadius: 10,
        borderWidth: 2,
        height: 30,
        justifyContent: 'center',
        width: 29,
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
                        {
                            borderWidth: isSelect ? 0 : 2,
                            backgroundColor: isSelect ? themeContext.color.primary : 'white',
                        },
                    ]}
                    key={`button_${i}`}
                    onPress={() => onChange(i)}
                >
                    <Text
                        style={[globalStyle.rmtext, { fontSize: 14, color: isSelect ? 'white' : 'rgb(219,213,235)' }]}
                    >
                        {i + 1}
                    </Text>
                </TouchableOpacity>,
            );
        }
        setButtons(newButtons);
    }, [onChange, score, themeContext.color.primary]);

    return (
        <View style={{ marginBottom: 24 }}>
            <Text>{evalName}</Text>
            <View style={styles.buttonsContainer}>{buttons}</View>
        </View>
    );
}

interface Props {
    onEvaluating: (result: AssessResult[]) => void;
    // reviewData: ReviewProps;
}

function Evaluating(props: Props): JSX.Element {
    const { onEvaluating } = props;
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { proposal } = useContext(ProposalContext);
    const { isGuest } = useContext(AuthContext);
    const [completeness, setCompleteness] = useState<number | undefined>(undefined);
    const [realization, setRealization] = useState<number | undefined>(undefined);
    const [profitability, setProfitability] = useState<number | undefined>(undefined);
    const [attractiveness, setAttractiveness] = useState<number | undefined>(undefined);
    const [expansion, setExpansion] = useState<number | undefined>(undefined);
    const [allCheck, setAllcheck] = useState(false);

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

    return (
        <View>
            <View style={{ alignItems: 'center' }}>
                <Text style={[globalStyle.btext, { fontSize: 20, color: themeContext.color.primary }]}>
                    {getString('제안 적합도 평가하기')}
                </Text>
                {/* <Text style={[globalStyle.ltext, { textAlign: 'center', lineHeight: 25, marginTop: 11.5 }]}>
                    {getString(
                        '해당 제안을 평가해주세요&#46;\n평가 점수가 합격 기준을 통과해야\n정식제안으로 오픈됩니다&#46;',
                    )}
                </Text> */}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}>
                <Text>{getString('평가기간')}</Text>
                <Text style={[globalStyle.ltext, { marginLeft: 19 }]}>
                    {getCommonPeriodText(proposal?.assessPeriod)}
                </Text>
            </View>

            <View style={{ marginTop: 63 }}>
                <EvalComponent evalName={getString('제안완성도')} score={completeness} onChange={setCompleteness} />
                <EvalComponent evalName={getString('실현가능성')} score={realization} onChange={setRealization} />
                <EvalComponent evalName={getString('수익성')} score={profitability} onChange={setProfitability} />
                <EvalComponent evalName={getString('매력도')} score={attractiveness} onChange={setAttractiveness} />
                <EvalComponent evalName={getString('확장가능성')} score={expansion} onChange={setExpansion} />
            </View>

            <View style={{ alignItems: 'center', marginTop: 22 }}>
                <Button
                    onPress={() => {
                        if (isGuest) {
                            dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                        } else if (!allCheck) {
                            dispatch(showSnackBar(getString('필수 항목을 입력해주세요')));
                        } else {
                            onEvaluating([
                                { sequence: EnumAssess.COMPLETENESS, value: (completeness || 0) + 1 },
                                { sequence: EnumAssess.REALIZATION, value: (realization || 0) + 1 },
                                { sequence: EnumAssess.PROFITABILITY, value: (profitability || 0) + 1 },
                                { sequence: EnumAssess.ATTRACTIVENESS, value: (attractiveness || 0) + 1 },
                                { sequence: EnumAssess.EXPANSION, value: (expansion || 0) + 1 },
                            ]);
                        }
                    }}
                    icon={
                        <Icon
                            name="check"
                            color={allCheck ? themeContext.color.primary : 'rgb(219,213,235)'}
                            tvParallaxProperties={undefined}
                        />
                    }
                    title={getString('평가하기')}
                    titleStyle={[
                        globalStyle.btext,
                        {
                            fontSize: 20,
                            color: allCheck ? themeContext.color.primary : 'rgb(219,213,235)',
                            marginLeft: 6,
                        },
                    ]}
                    type="clear"
                />
            </View>
        </View>
    );
}

export default Evaluating;
