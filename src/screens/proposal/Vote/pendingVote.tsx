import React, { useContext, useEffect, useState } from 'react';
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

const MAX_HEIGHT = 200;
const COLUMN_WIDTH = 70;

function PendingVote(): JSX.Element {
    const { proposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(iconAssets);
    const [maxWidth, setMaxWidth] = useState(0);
    const [clientSize, setClientSize] = useState([0, 0]);
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        if (clientSize[0] > maxWidth) {
            setHidden(false);
        } else if (clientSize[1] > MAX_HEIGHT) {
            setHidden(false);
        } else {
            setHidden(true);
        }
    }, [maxWidth, clientSize]);

    return (
        <View
            onLayout={(event) => {
                setMaxWidth(event.nativeEvent.layout.width - COLUMN_WIDTH);
            }}
        >
            {assets && (
                <View style={{ alignItems: 'center', marginTop: 25 }}>
                    <Image source={assets[EnumIconAsset.Vote] as ImageURISource} />
                </View>
            )}

            <View style={{ marginTop: 30 }}>
                <Text style={[globalStyle.btext, { fontSize: 13, lineHeight: 17, color: themeContext.color.black }]}>
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

            <LineComponent />

            <Text
                style={[
                    globalStyle.btext,
                    { fontSize: 13, lineHeight: 17, marginBottom: 15, color: themeContext.color.black },
                ]}
            >
                {getString('제안요약')}
            </Text>

            {proposal?.type === EnumProposalType.Business && (
                <View style={{ flexDirection: 'row' }}>
                    <Text
                        style={[
                            globalStyle.rtext,
                            { fontSize: 13, lineHeight: 24, width: COLUMN_WIDTH, color: themeContext.color.black },
                        ]}
                    >
                        {getString('요청금액')}
                    </Text>
                    <Text
                        style={[
                            globalStyle.btext,
                            { fontSize: 13, lineHeight: 24, flex: 1, color: themeContext.color.primary },
                        ]}
                    >
                        {StringWeiAmountFormat(proposal?.fundingAmount)} BOA
                    </Text>
                </View>
            )}

            <View style={{ flexDirection: 'row' }}>
                <Text
                    style={[
                        globalStyle.rtext,
                        { fontSize: 13, lineHeight: 24, width: COLUMN_WIDTH, color: themeContext.color.black },
                    ]}
                >
                    {getString('사업내용')}
                </Text>
                <View style={{ overflow: hidden ? 'hidden' : 'scroll', maxHeight: MAX_HEIGHT, maxWidth }}>
                    <Text
                        style={[
                            globalStyle.ltext,
                            {
                                fontSize: 13,
                                lineHeight: 24,
                                color: themeContext.color.textBlack,
                            },
                        ]}
                        onLayout={(event) => {
                            if (event.nativeEvent?.layout) {
                                const { width, height } = event.nativeEvent.layout;
                                setClientSize([width, height]);
                            }
                        }}
                    >
                        {proposal?.description}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default PendingVote;
