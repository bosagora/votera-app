import React from 'react';
import { View } from 'react-native';
import getString from '~/utils/locales/STRINGS';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import VoteItem from './VoteItem';

interface VoteItemGroupProps {
    onPress: (type: VOTE_SELECT) => void;
    vote: VOTE_SELECT | undefined;
    disabled: boolean;
}

function VoteItemGroup(props: VoteItemGroupProps): JSX.Element {
    const { vote, disabled, onPress } = props;
    return (
        <View
            style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: 59,
            }}
        >
            <VoteItem
                text={getString('찬성')}
                type={VOTE_SELECT.YES}
                onPress={() => onPress(VOTE_SELECT.YES)}
                isSelect={vote === VOTE_SELECT.YES}
                disabled={disabled}
            />
            <VoteItem
                text={getString('반대')}
                type={VOTE_SELECT.NO}
                onPress={() => onPress(VOTE_SELECT.NO)}
                isSelect={vote === VOTE_SELECT.NO}
                disabled={disabled}
            />
            <VoteItem
                text={getString('기권')}
                type={VOTE_SELECT.BLANK}
                onPress={() => onPress(VOTE_SELECT.BLANK)}
                isSelect={vote === VOTE_SELECT.BLANK}
                disabled={disabled}
            />
        </View>
    );
}

export default VoteItemGroup;
