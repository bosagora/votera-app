import React, { useContext } from 'react';
import { View, Image, ImageURISource } from 'react-native';
// import { GBText, BText, RLText } from '~/components/text';
import { DefaultTheme, ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';
import { useAssets } from 'expo-asset';
import dayjs from 'dayjs';
import globalStyle from '~/styles/global';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import getString from '~/utils/locales/STRINGS';
import { CloseIcon } from '~/components/icons';

function getVoteColor(type: VOTE_SELECT, theme: DefaultTheme): string {
    switch (type) {
        case VOTE_SELECT.YES:
            return theme.color.agree;
        case VOTE_SELECT.NO:
            return theme.color.disagree;
        default:
            return theme.color.abstain;
    }
}

function getVoteText(type: VOTE_SELECT): string {
    switch (type) {
        case VOTE_SELECT.YES:
            return getString('찬성');
        case VOTE_SELECT.NO:
            return getString('반대');
        default:
            return getString('기권');
    }
}

enum EnumIconAsset {
    Abstain = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/vote/abstain.png')];

interface Props {
    type: VOTE_SELECT;
    name: string;
    time: Date;
}

function VoteHistoryComponent(props: Props): JSX.Element {
    const { type, name, time } = props;
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(iconAssets);

    const color = getVoteColor(type, themeContext);

    const agreeMark = () => (
        <View
            style={{ borderWidth: 1, borderColor: themeContext.color.agree, width: 12, height: 12, borderRadius: 6 }}
        />
    );

    const renderMark = () => {
        switch (type) {
            case VOTE_SELECT.YES:
                return agreeMark();
            case VOTE_SELECT.NO:
                return <CloseIcon color={themeContext.color.disagree} />;
            default:
                return assets ? (
                    <Image
                        style={{ tintColor: themeContext.color.abstain }}
                        source={assets[EnumIconAsset.Abstain] as ImageURISource}
                    />
                ) : null;
        }
    };

    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'rgb(235,234,239)', paddingVertical: 30 }}>
            <View style={globalStyle.flexRowBetween}>
                <Text style={globalStyle.gbtext}>{name}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {renderMark()}
                    <Text style={[globalStyle.btext, { marginLeft: 8, color }]}>{getVoteText(type)}</Text>
                </View>
            </View>
            <Text style={[globalStyle.rltext, { fontSize: 12 }]}>
                {dayjs(time).format(getString('YYYY년 M월 D일 HH:mm'))}
            </Text>
        </View>
    );
}

export default VoteHistoryComponent;
