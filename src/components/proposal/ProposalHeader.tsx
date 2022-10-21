/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
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
    const themeContext = useContext(ThemeContext);
    return (
        <View
            style={[
                globalStyle.flexRowBetween,
                {
                    backgroundColor: 'white',
                    paddingTop: 23,
                    zIndex: 1, // in order to show filterButton
                },
            ]}
        >
            <View style={{ paddingLeft: 15, flexDirection: 'row' }}>
                <Text style={[globalStyle.btext, { fontSize: 13, lineHeight: 21, color: themeContext.color.black }]}>
                    {username}
                </Text>
                <Text
                    style={[globalStyle.rtext, { fontSize: 13, lineHeight: 21, color: themeContext.color.textBlack }]}
                >
                    {getString(' 님 환영합니다!')}
                </Text>
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
