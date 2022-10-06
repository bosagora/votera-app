import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-elements';
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
        return assessResultData?.isValidVoter
            ? getString('제안 평가가 완료되었습니다!')
            : getString('제안 평가가 진행 중입니다&#46;');
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
    const navigation = useNavigation<MainNavigationProps<'ProposalDetail'>>();

    return (
        <View>
            <View style={{ alignItems: 'center', marginVertical: 38 }}>
                <Text style={[globalStyle.btext, { fontSize: 20 }]}>{getEvaluationStateTitle(assessResultData)}</Text>
            </View>

            <AssessAvg assessResultData={assessResultData} />
            <LineComponent />

            <View>
                {proposals.length !== 0 && (
                    <>
                        <Text style={{ color: 'rgb(71,71,75)' }}>{getString('다른 제안보기')}</Text>
                        {proposals.map((item: Proposal) => (
                            <ProposalCard
                                key={`otherProposal_${item.id}`}
                                item={item}
                                onPress={() => {
                                    fetchProposal(item.proposalId || '');
                                    navigation.navigate('ProposalDetail', { id: item.proposalId || '' });
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
