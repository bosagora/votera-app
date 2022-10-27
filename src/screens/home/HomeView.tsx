/* eslint-disable import/extensions */
/* eslint-disable global-require */
import React, { useEffect, useState, useContext } from 'react';
import { RefreshControl, ScrollView, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import ProposalCard from '~/components/proposal/ProposalCard';
import ProposalTop from '~/components/proposal/ProposalTop';
import ProposalHeader from '~/components/proposal/ProposalHeader';
import { Proposal, useGetProposalsLazyQuery } from '~/graphql/generated/generated';
import { MainNavigationProps } from '~/navigation/main/MainParams';
import { isLargeScreen } from '~/styles/global';
import { ProposalFilterType } from '~/types/filterType';
import { isCloseToBottom } from '~/utils';
import { OpenWhere, ProjectWhere, WhereType } from '~/graphql/hooks/Proposals';

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;

function getVariablesForQuery(filter: ProposalFilterType, where: WhereType, address: string | null) {
    return {
        limit: FETCH_INIT_LIMIT,
        sort: filter === ProposalFilterType.LATEST ? 'createdAt:desc' : 'memberCount:desc',
        where: where === WhereType.OPEN ? OpenWhere(address) : ProjectWhere,
    };
}

interface HomeViewProps {
    where: WhereType;
}

function HomeView(props: HomeViewProps): JSX.Element {
    const { where } = props;
    const { user, isGuest, metamaskAccount } = useContext(AuthContext);
    const { fetchProposal } = useContext(ProposalContext);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [topProposal, setTopProposal] = useState<Proposal>();
    const [filter, setFilter] = useState<ProposalFilterType>(ProposalFilterType.LATEST);
    const [isStopFetchMore, setStopFetchMore] = useState(false);
    const [pullRefresh, setPullRefresh] = useState(false);
    const { width } = useWindowDimensions();
    const navigation = useNavigation<MainNavigationProps<'Home'>>();

    const [getProposals, { data: resProposalsData, fetchMore, loading, client }] = useGetProposalsLazyQuery({
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
        onError: (error) => {
            console.log('getProposal error : ', error);
            setPullRefresh(false);
        },
    });

    useEffect(() => {
        if (resProposalsData) {
            const count = resProposalsData.listProposal?.count ?? 0;
            const [proposal, ...otherProposals] = resProposalsData.listProposal?.values as Proposal[];
            setProposals(otherProposals);
            setTopProposal(proposal);
            setPullRefresh(false);
            setStopFetchMore(otherProposals?.length ? count === otherProposals.length + 1 : true);
        }
    }, [resProposalsData]);

    useEffect(() => {
        if (filter) {
            const variables = getVariablesForQuery(filter, where, metamaskAccount);
            getProposals({ variables }).catch(console.log);
        }
    }, [filter, getProposals, where, metamaskAccount]);

    return (
        <ScrollView
            onScroll={({ nativeEvent }) => {
                if (isCloseToBottom(nativeEvent) && !isStopFetchMore && !loading) {
                    const currentLength = proposals.length || 0;

                    if (fetchMore) {
                        fetchMore({
                            variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                        }).catch(console.log);
                    }
                }
            }}
            scrollEventThrottle={500}
            refreshControl={
                <RefreshControl
                    refreshing={pullRefresh}
                    onRefresh={() => {
                        setPullRefresh(true);
                        const variables = getVariablesForQuery(filter, where, metamaskAccount);
                        client.cache.evict({
                            fieldName: 'listProposal',
                            args: variables,
                            broadcast: false,
                        });
                        getProposals({ variables }).catch(console.log);
                    }}
                />
            }
        >
            {topProposal?.proposalId && (
                <ProposalTop
                    item={topProposal}
                    onPress={() => {
                        fetchProposal(topProposal.proposalId as string);
                        navigation.push('RootUser', {
                            screen: 'ProposalDetail',
                            params: { id: topProposal.proposalId as string },
                        });
                        // linkTo({ screen: 'ProposalDetail', params: { id: topProposal.proposalId as string } });
                    }}
                    where={where}
                />
            )}
            <View style={[{ backgroundColor: 'white' }, isLargeScreen(width) ? { paddingRight: 22 } : undefined]}>
                <ProposalHeader
                    username={isGuest || !user ? 'Guest' : user.username || ''}
                    currentFilter={filter}
                    setFilter={setFilter}
                />
                {proposals
                    .filter((p) => !!p.proposalId)
                    .map((proposal) => (
                        <ProposalCard
                            key={`proposalCard_${proposal.id}`}
                            item={proposal}
                            onPress={() => {
                                fetchProposal(proposal.proposalId as string);
                                navigation.push('RootUser', {
                                    screen: 'ProposalDetail',
                                    params: { id: proposal.proposalId as string },
                                });
                                // linkTo({ screen: 'ProposalDetail', params: { id: proposal.proposalId as string } });
                            }}
                        />
                    ))}
                {loading && <ActivityIndicator style={{ marginTop: 5 }} size="large" />}
            </View>
        </ScrollView>
    );
}

export default HomeView;
