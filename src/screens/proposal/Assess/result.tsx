import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import AssessAvg from '~/components/proposal/AssessAvg';
import ProposalCard from '~/components/proposal/ProposalCard';
import {
    Proposal,
    AssessResultPayload,
    Enum_Assess_Proposal_State as EnumAssessProposalState,
} from '~/graphql/generated/generated';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import { MainNavigationProps } from '~/navigation/main/MainParams';

function LineComponent(): JSX.Element {
    return <View style={globalStyle.lineComponent} />;
}

interface Props {
    assessResultData: AssessResultPayload;
}

function getEvaluationStateTitle(assessResultData: AssessResultPayload): string {
    if (assessResultData?.proposalState === EnumAssessProposalState.Created) {
        return getString('제안 평가가 진행 중입니다&#46;');
    }
    if (assessResultData?.proposalState === EnumAssessProposalState.Rejected) {
        return getString('제안 평가에서 탈락했습니다!');
    }
    return getString('제안 평가가 완료되었습니다!');
}

function EvaluationResult(props: Props): JSX.Element {
    const { assessResultData } = props;
    const [proposals, setProposals] = useState([]);
    const { fetchProposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const navigation = useNavigation<MainNavigationProps<'ProposalDetail'>>();
    const rejected = assessResultData?.proposalState === EnumAssessProposalState.Rejected;

    return (
        <View>
            <View style={{ alignItems: 'center', marginVertical: 38 }}>
                {!rejected && (
                    <Text
                        style={[globalStyle.btext, { fontSize: 18, lineHeight: 28, color: themeContext.color.black }]}
                    >
                        {getEvaluationStateTitle(assessResultData)}
                    </Text>
                )}
                {rejected && (
                    <Text
                        style={[
                            globalStyle.btext,
                            { fontSize: 31, lineHeight: 29, color: themeContext.color.disagree },
                        ]}
                    >
                        {getString('탈락!')}
                    </Text>
                )}
            </View>

            <AssessAvg assessResultData={assessResultData} />

            <LineComponent />

            <View>
                {proposals.length !== 0 && (
                    <>
                        <Text
                            style={[
                                globalStyle.rtext,
                                { fontSize: 13, lineHeight: 21, color: themeContext.color.textBlack },
                            ]}
                        >
                            {getString('다른 제안보기')}
                        </Text>
                        {proposals.map((item: Proposal) => (
                            <ProposalCard
                                key={`otherProposal_${item.id}`}
                                item={item}
                                onPress={() => {
                                    fetchProposal(item.proposalId || '');
                                    navigation.push('RootUser', {
                                        screen: 'ProposalDetail',
                                        params: { id: item.proposalId || '' },
                                    });
                                }}
                            />
                        ))}
                    </>
                )}
            </View>
        </View>
    );
}

export default EvaluationResult;
