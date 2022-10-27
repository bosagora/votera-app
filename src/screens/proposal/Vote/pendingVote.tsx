import React, { useContext } from 'react';
import { View, Image, ImageURISource } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';
import globalStyle from '~/styles/global';
import { Proposal, Enum_Proposal_Status as EnumProposalStatus } from '~/graphql/generated/generated';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
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

const COLUMN_WIDTH = 70;

interface Props {
    proposal: Proposal | undefined;
}

function PendingVote(props: Props): JSX.Element {
    const { proposal } = props;
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(iconAssets);

    return (
        <View>
            {assets && (
                <View style={{ alignItems: 'center', marginTop: 25 }}>
                    <Image source={assets[EnumIconAsset.Vote] as ImageURISource} />
                </View>
            )}

            {proposal?.status === EnumProposalStatus.Vote && (
                <View style={globalStyle.center}>
                    <Text
                        style={[
                            globalStyle.btext,
                            { fontSize: 18, lineHeight: 28, marginTop: 30, color: themeContext.color.black },
                        ]}
                    >
                        {getString('제안에 대한 투표가 진행 중 입니다&#46;')}
                    </Text>
                </View>
            )}

            <View style={{ marginTop: 30 }}>
                <Text
                    style={[
                        globalStyle.btext,
                        { fontSize: 13, lineHeight: 17, width: COLUMN_WIDTH, color: themeContext.color.black },
                    ]}
                >
                    {getString('투표 기간')}
                </Text>
                <Text
                    style={[
                        globalStyle.rtext,
                        { fontSize: 13, lineHeight: 23, marginTop: 13, color: themeContext.color.textBlack },
                    ]}
                >
                    {`${getFullDateTime(proposal?.vote_start)} ~ ${getFullDateTime(proposal?.vote_end)}`}
                </Text>
            </View>

            <LineComponent />

            <Text
                style={[
                    globalStyle.btext,
                    {
                        fontSize: 13,
                        lineHeight: 17,
                        marginBottom: 13,
                        color: themeContext.color.disagree,
                    },
                ]}
            >
                {getString('주의사항')}
            </Text>
            <Text
                style={[
                    globalStyle.rtext,
                    { fontSize: 13, lineHeight: 23, flex: 1, color: themeContext.color.textBlack },
                ]}
            >
                {getString(
                    '하나의 계정 당 하나의 투표권을 가집니다&#46;\n투표마감일 전까지는 자유롭게 투표 내용을 변경할 수 있으며 기간이 지난 후에는 투표를 할 수 없습니다&#46;',
                )}
            </Text>
        </View>
    );
}

export default PendingVote;
