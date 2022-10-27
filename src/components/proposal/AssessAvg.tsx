import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { BigNumber } from 'ethers';
import { AssessResultPayload } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

const styles = StyleSheet.create({
    averageCount: { fontSize: 13, lineHeight: 23, marginLeft: 5 },
    averageLabel: { fontSize: 13, lineHeight: 21 },
    averageText: { fontSize: 35, lineHeight: 25 },
    label: { fontSize: 13, lineHeight: 23 },
    value: { fontSize: 13, lineHeight: 23 },
});

interface AssessAvgProps {
    assessResultData: AssessResultPayload;
}

function AssessAvg(props: AssessAvgProps): JSX.Element {
    const { assessResultData } = props;
    const themeContext = useContext(ThemeContext);

    const [avgs, setAvgs] = useState<string[]>(['0', '0', '0', '0', '0']);
    const [nodeCount, setNodeCount] = useState(0);

    useEffect(() => {
        if (assessResultData?.assessParticipantSize) {
            const total = BigNumber.from(assessResultData.assessParticipantSize).toNumber();
            const values = ['0', '0', '0', '0', '0'];
            if (assessResultData.assessData && total > 0) {
                const count = assessResultData.assessData.length;
                for (let i = 0; i < Math.min(count, values.length); i += 1) {
                    const value = BigNumber.from(assessResultData.assessData[i]).toNumber();
                    values[i] = (value / total).toFixed(1);
                }
            }
            setNodeCount(total);
            setAvgs(values);
        }
    }, [assessResultData]);

    const showTotalAvg = () => {
        const total = avgs.reduce((pv, cv) => pv + Number(cv), 0);
        if (total === 0) return 0;
        return (total / 5).toFixed(1);
    };

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={[{ flex: 1 }, globalStyle.center]}>
                <Text style={[globalStyle.gbtext, styles.averageText, { color: themeContext.color.primary }]}>
                    {showTotalAvg()}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Text style={[globalStyle.ltext, styles.averageLabel, { color: themeContext.color.primary }]}>
                        {getString('참여한 검증자 수')}
                    </Text>
                    <Text style={[globalStyle.mtext, styles.averageCount, { color: themeContext.color.primary }]}>
                        {nodeCount}
                    </Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ width: 120 }}>
                    <View style={globalStyle.flexRowBetween}>
                        <Text style={[globalStyle.ltext, styles.label]}>{getString('제안완성도')}</Text>
                        <Text style={[globalStyle.gmtext, styles.value]}>{avgs[0]}</Text>
                    </View>
                    <View style={globalStyle.flexRowBetween}>
                        <Text style={[globalStyle.ltext, styles.label]}>{getString('실현가능성')}</Text>
                        <Text style={[globalStyle.gmtext, styles.value]}>{avgs[1]}</Text>
                    </View>
                    <View style={globalStyle.flexRowBetween}>
                        <Text style={[globalStyle.ltext, styles.label]}>{getString('수익성')}</Text>
                        <Text style={[globalStyle.gmtext, styles.value]}>{avgs[2]}</Text>
                    </View>
                    <View style={globalStyle.flexRowBetween}>
                        <Text style={[globalStyle.ltext, styles.label]}>{getString('매력도')}</Text>
                        <Text style={[globalStyle.gmtext, styles.value]}>{avgs[3]}</Text>
                    </View>
                    <View style={globalStyle.flexRowBetween}>
                        <Text style={[globalStyle.ltext, styles.label]}>{getString('확장가능성')}</Text>
                        <Text style={[globalStyle.gmtext, styles.value]}>{avgs[4]}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default AssessAvg;
