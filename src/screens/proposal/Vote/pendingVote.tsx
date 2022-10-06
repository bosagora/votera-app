import React, { useContext } from 'react';
import { View, Image, ImageURISource } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';
import globalStyle from '~/styles/global';
import { Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import { getFullDateTime } from '~/utils/time';

enum EnumIconAsset {
    Vote = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/vote/vote.png')];

function LineComponent() {
    return <View style={globalStyle.lineComponent} />;
}

function PendingVote(): JSX.Element {
    const { proposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const defaultStyle = { lineHeight: 25 };
    const [assets] = useAssets(iconAssets);

    return (
        <View>
            {assets && (
                <View style={{ alignItems: 'center', marginTop: 25 }}>
                    <Image source={assets[EnumIconAsset.Vote] as ImageURISource} />
                </View>
            )}

            <View style={{ marginTop: 30 }}>
                <Text style={globalStyle.btext}>{getString('투표 기간')}</Text>
                <Text style={{ marginTop: 13 }}>
                    {`${getFullDateTime(proposal?.vote_start)} ~ ${getFullDateTime(proposal?.vote_end)}`}
                </Text>
            </View>

            <LineComponent />

            <Text style={[globalStyle.btext, { marginTop: 12, marginBottom: 15 }]}>{getString('제안요약')}</Text>
            {/* <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>Proposal ID</Text>
                <Text style={[globalStyle.ltext, defaultStyle, { marginLeft: 19 }]}>{`${
                    proposal?.proposalId || ''
                }`}</Text>
            </View> */}

            {proposal?.type === EnumProposalType.Business && (
                <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle}>{getString('요청 금액')}</Text>
                    <Text
                        style={[globalStyle.btext, defaultStyle, { color: themeContext.color.primary, marginLeft: 19 }]}
                    >
                        {StringWeiAmountFormat(proposal?.fundingAmount)} BOA
                    </Text>
                </View>
            )}

            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>{getString('사업내용')}</Text>
                <Text style={[globalStyle.ltext, defaultStyle, { marginLeft: 19, flex: 1 }]}>
                    {proposal?.description}
                </Text>
            </View>
        </View>
    );
}

export default PendingVote;
