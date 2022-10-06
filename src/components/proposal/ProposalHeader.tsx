/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

import globalStyle from '~/styles/global';
import { ProposalFilterType } from '~/types/filterType';
import getString from '~/utils/locales/STRINGS';
import FilterButton from '../button/FilterButton';

interface ProposalHeaderProps {
    username: string;
    currentFilter: ProposalFilterType;
    setFilter: React.Dispatch<React.SetStateAction<ProposalFilterType>>;
}

function ProposalHeader(props: ProposalHeaderProps): JSX.Element {
    const { username, currentFilter, setFilter } = props;
    return (
        <View
            style={[
                globalStyle.flexRowBetween,
                {
                    backgroundColor: 'white',
                    paddingTop: 23,
                    paddingHorizontal: 22,
                    zIndex: 1, // in order to show filterButton
                },
            ]}
        >
            <View style={{ paddingLeft: 15, flexDirection: 'row' }}>
                <Text style={[globalStyle.btext, { textAlignVertical: 'center' }]}>{username}</Text>
                <Text>{getString(' 님 환영합니다!')}</Text>
            </View>
            <FilterButton
                filterType={ProposalFilterType}
                currentFilter={currentFilter}
                setFilter={(filter) => {
                    setFilter(filter as ProposalFilterType);
                }}
            />
        </View>
    );
}

export default ProposalHeader;
