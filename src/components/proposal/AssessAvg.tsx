import { BigNumber } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { AssessResultPayload } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface AssessAvgProps {
    assessResultData: AssessResultPayload;
}

function AssessAvg(props: AssessAvgProps): JSX.Element {
    const { assessResultData } = props;
    const themeContext = useContext(ThemeContext);
    const defaultStyle = { lineHeight: 25 };

    const [avgs, setAvgs] = useState<string[]>(['0', '0', '0', '0', '0']);
    const [nodeCount, setNodeCount] = useState(0);

    useEffect(() => {
        if (assessResultData) {
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
        return total / 5;
    };

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[globalStyle.gbtext, { fontSize: 37, color: themeContext.color.primary }]}>
                    {showTotalAvg()}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Text style={[globalStyle.ltext, { color: themeContext.color.primary }]}>
                        {getString('참여한 검증자 수')}
                    </Text>
                    <Text style={[globalStyle.mtext, { marginLeft: 5, color: themeContext.color.primary }]}>
                        {nodeCount}
                    </Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[globalStyle.ltext, defaultStyle]}>{getString('제안완성도')}</Text>
                    <Text style={globalStyle.mtext}>{avgs[0]}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[globalStyle.ltext, defaultStyle]}>{getString('실현가능성')}</Text>
                    <Text style={globalStyle.mtext}>{avgs[1]}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[globalStyle.ltext, defaultStyle]}>{getString('수익성')}</Text>
                    <Text style={globalStyle.mtext}>{avgs[2]}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[globalStyle.ltext, defaultStyle]}>{getString('매력도')}</Text>
                    <Text style={globalStyle.mtext}>{avgs[3]}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[globalStyle.ltext, defaultStyle]}>{getString('확장가능성')}</Text>
                    <Text style={globalStyle.mtext}>{avgs[4]}</Text>
                </View>
            </View>
        </View>
    );
}

export default AssessAvg;
