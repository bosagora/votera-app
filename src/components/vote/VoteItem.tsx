import React, { useContext } from 'react';
import { View, Image, StyleSheet, ImageURISource } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';
import globalStyle from '~/styles/global';
import { VOTE_SELECT } from '~/utils/votera/voterautil';

enum EnumIconAsset {
    Abstain = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/vote/abstain.png')];

export function getVoteString(select?: VOTE_SELECT | undefined) {
    switch (select) {
        case VOTE_SELECT.YES:
            return 'agree';
        case VOTE_SELECT.NO:
            return 'disagree';
        default:
            return 'abstain';
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderRadius: 40,
        height: 79,
        justifyContent: 'center',
        width: 80,
    },
});

interface VoteItemProps {
    text: string;
    type: VOTE_SELECT | undefined;
    isSelect: boolean;
    disabled: boolean;
    onPress: (type: VOTE_SELECT) => void;
}

function VoteItem(props: VoteItemProps): JSX.Element {
    const { type, isSelect, text, disabled, onPress } = props;
    const themeContext = useContext(ThemeContext);
    const tintColor = isSelect ? themeContext.color.white : themeContext.color.unchecked;
    const [assets] = useAssets(iconAssets);

    const voteBackgroundColor = () => {
        if (!isSelect) return themeContext.color.white;
        switch (type) {
            case VOTE_SELECT.YES:
                return themeContext.color.agree;
            case VOTE_SELECT.NO:
                return themeContext.color.disagree;
            default:
                return themeContext.color.abstain;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: voteBackgroundColor(),
                    borderColor: tintColor,
                    borderWidth: isSelect ? 0 : 2,
                },
            ]}
            onPress={() => {
                if (type !== undefined) onPress(type);
            }}
            disabled={disabled}
        >
            {type === VOTE_SELECT.YES && (
                <View style={{ width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: tintColor }} />
            )}
            {type === VOTE_SELECT.NO && <Icon name="close" color={tintColor} tvParallaxProperties={undefined} />}
            {type === VOTE_SELECT.BLANK && assets && (
                <Image style={{ tintColor }} source={assets[EnumIconAsset.Abstain] as ImageURISource} />
            )}
            <Text style={[globalStyle.btext, { fontSize: 13, lineHeight: 21, color: tintColor, marginTop: 2 }]}>
                {text}
            </Text>
        </TouchableOpacity>
    );
}

export default VoteItem;
