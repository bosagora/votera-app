/* eslint-disable import/extensions */
/* eslint-disable global-require */
import React, { useCallback, useContext } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ImageURISource, ActivityIndicator } from 'react-native';
import { useAssets } from 'expo-asset';
import { setStringAsync } from 'expo-clipboard';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import {
    Enum_Proposal_Status as EnumProposalStatus,
    Enum_Proposal_Type as EnumProposalType,
    Proposal,
    Validator,
} from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import ShortButton from '~/components/button/ShortButton';
import Anchor from '~/components/anchor/Anchor';
import getString from '~/utils/locales/STRINGS';
import { getValidatorDateString } from '~/utils/time';
import { VOTE_SELECT } from '~/utils/votera/voterautil';
import { useAppDispatch } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { getBlockExplorerUrl } from '~/utils/votera/agoraconf';
import { CopyIcon, CloseIcon } from '~/components/icons';

const styles = StyleSheet.create({
    anchor: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 10,
    },
    anchorText: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        fontSize: 14,
        lineHeight: 18,
    },
    header: {
        alignItems: 'center',
        height: 35,
    },
    headerFirstLine: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    headerNextLine: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
    },
    headerText: {
        marginRight: 5,
    },
    headerValue: {
        marginLeft: 5,
    },
    itemBallotAgree: {
        borderRadius: 9,
        borderWidth: 2,
        height: 17,
        marginHorizontal: 7,
        width: 17,
    },
    itemBallotContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    itemDate: {
        fontSize: 12,
        left: 0,
        lineHeight: 18,
        position: 'absolute',
        textAlign: 'right',
        top: 60,
        width: '100%',
    },
    itemStatus: {
        fontSize: 14,
        lineHeight: 18,
        textAlign: 'right',
    },
    listHeader: {
        backgroundColor: 'white',
        height: 66,
        width: '100%',
    },
    listHeaderText: {
        marginHorizontal: 19,
        marginVertical: 23,
    },
    moreText: {
        textAlign: 'center',
    },
    nameColumn: {
        flex: 1,
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
    },
    nameGlobeRow: {
        flexDirection: 'row',
    },
    nameKeyRow: {
        flexDirection: 'row',
    },
    rowContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        height: 52,
        width: '100%',
    },
    statusColumn: {
        justifyContent: 'center',
        width: 140,
    },
});

const ELLIPSIS_TAIL_SIZE = -10;

function LineComponent(): JSX.Element {
    return <View style={globalStyle.lineComponent} />;
}

interface HeaderProps {
    onRefresh: () => void;
}

function AssessListHeaderComponent(props: HeaderProps): JSX.Element {
    const { onRefresh } = props;

    return (
        <View style={[globalStyle.flexRowBetween, styles.listHeader]}>
            <Text style={[globalStyle.ltext, styles.listHeaderText]}>{getString('검증자 평가 현황')}</Text>
            <ShortButton
                title={getString('새로고침')}
                buttonStyle={globalStyle.shortSmall}
                titleStyle={{ fontSize: 10 }}
                onPress={onRefresh}
            />
        </View>
    );
}

function VoteListHeaderComponent(props: HeaderProps): JSX.Element {
    const { onRefresh } = props;

    return (
        <View style={[globalStyle.flexRowAlignCenter, styles.listHeader]}>
            <Text style={[globalStyle.ltext, styles.listHeaderText]}>{getString('검증자 투표 현황')}</Text>
            <ShortButton
                title={getString('새로고침')}
                buttonStyle={globalStyle.shortSmall}
                titleStyle={{ fontSize: 10 }}
                onPress={onRefresh}
            />
        </View>
    );
}

function ClosedListHeaderComponent(): JSX.Element {
    return (
        <View style={[globalStyle.flexRowBetween, styles.listHeader]}>
            <Text style={[globalStyle.ltext, styles.listHeaderText]}>{getString('검증자 투표 결과')}</Text>
        </View>
    );
}

enum EnumIconAsset {
    PublicKey = 0,
    Copy,
    Address,
    Abstain,
}

const iconAssets = [
    require('@assets/icons/key.png'),
    require('@assets/icons/copySimple.png'),
    require('@assets/icons/globe.png'),
    require('@assets/icons/prohibit.png'),
];

interface SubProps {
    onLayout: (h: number) => void;
    proposal: Proposal | undefined;
}

function PendingValidatorScreen(props: SubProps): JSX.Element {
    const { proposal, onLayout } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            <View style={styles.header}>
                <Text style={{ color: themeContext.color.primary }}>
                    {getString('제안 생성 절차가 완료된 후, 검증자 리스트가 표시됩니다&#46;')}
                </Text>
            </View>
        </View>
    );
}

interface ValidatorProps {
    onLayout: (h: number) => void;
    onRefresh: () => void;
    total: number;
    participated: number;
    validators: Validator[];
    loading: boolean;
}

function AssessValidatorScreen(props: ValidatorProps): JSX.Element {
    const { total, participated, validators, onLayout, onRefresh, loading } = props;
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [assets] = useAssets(iconAssets);

    const renderItem = useCallback(
        (item: Validator) => {
            const publicKey = item.publicKey || '';
            const address = item.address || '';
            return (
                <View style={styles.rowContainer}>
                    <View style={styles.nameColumn}>
                        <View style={styles.nameKeyRow}>
                            {assets && <Image source={assets[EnumIconAsset.PublicKey] as ImageURISource} />}
                            <Anchor style={styles.anchor} source={getBlockExplorerUrl(address)}>
                                <Text style={[globalStyle.rtext, styles.anchorText]} numberOfLines={1}>
                                    {publicKey.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.rtext, styles.anchorText]}>
                                    {publicKey.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                            </Anchor>
                            <TouchableOpacity
                                onPress={() => {
                                    setStringAsync(publicKey)
                                        .then(() => {
                                            dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                        })
                                        .catch(console.log);
                                }}
                            >
                                <CopyIcon color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.nameGlobeRow}>
                            {assets && <Image source={assets[EnumIconAsset.Address] as ImageURISource} />}
                            <Anchor style={styles.anchor} source={getBlockExplorerUrl(address)}>
                                <Text style={[globalStyle.rtext, styles.anchorText]} numberOfLines={1}>
                                    {address.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.rtext, styles.anchorText]}>
                                    {address.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                            </Anchor>
                            <TouchableOpacity
                                onPress={() => {
                                    setStringAsync(address)
                                        .then(() => {
                                            dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                        })
                                        .catch(console.log);
                                }}
                            >
                                <CopyIcon color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.statusColumn}>
                        <Text style={[globalStyle.rtext, styles.itemStatus]}>
                            {item.assessUpdate ? getString('평가완료') : getString('미평가')}
                        </Text>
                    </View>
                    {item.assessUpdate && (
                        <Text style={[globalStyle.ltext, { color: themeContext.color.textBlack }, styles.itemDate]}>
                            {getValidatorDateString(item.assessUpdate)}
                        </Text>
                    )}
                </View>
            );
        },
        [assets, themeContext.color.primary, themeContext.color.textBlack, dispatch],
    );

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            <View style={styles.header}>
                <View style={styles.headerFirstLine}>
                    <Text style={[styles.headerText, { color: themeContext.color.primary }]}>
                        {getString('평가에 참여한 검증자 수')}
                    </Text>
                    <Text style={[styles.headerValue, { color: themeContext.color.primary }]}>{participated}</Text>
                </View>

                <View style={styles.headerNextLine}>
                    <Text style={[styles.headerText, { color: themeContext.color.primary }]}>
                        {getString('총 검증자 수')}
                    </Text>
                    <Text style={[styles.headerValue, { color: themeContext.color.primary }]}>{total}</Text>
                </View>
            </View>
            <LineComponent />
            <AssessListHeaderComponent onRefresh={onRefresh} />
            {assets &&
                validators.map((validator) => (
                    <View key={`assess.${validator.id}`}>
                        {renderItem(validator)}
                        <LineComponent />
                    </View>
                ))}
            {loading && <ActivityIndicator />}
            {!loading && total > validators.length && <Text style={styles.moreText}>......</Text>}
        </View>
    );
}

function VoteValidatorScreen(props: ValidatorProps): JSX.Element {
    const { total, participated, validators, onLayout, onRefresh, loading } = props;
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [assets] = useAssets(iconAssets);

    const renderItem = useCallback(
        (item: Validator) => {
            const publicKey = item.publicKey || '';
            const address = item.address || '';
            return (
                <View style={styles.rowContainer}>
                    <View style={styles.nameColumn}>
                        <View style={styles.nameKeyRow}>
                            {assets && <Image source={assets[EnumIconAsset.PublicKey] as ImageURISource} />}
                            <Anchor style={styles.anchor} source={getBlockExplorerUrl(address)}>
                                <Text style={[globalStyle.rtext, styles.anchorText]} numberOfLines={1}>
                                    {publicKey.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.rtext, styles.anchorText]}>
                                    {publicKey.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                            </Anchor>
                            <TouchableOpacity
                                onPress={() => {
                                    setStringAsync(publicKey)
                                        .then(() => {
                                            dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                        })
                                        .catch(console.log);
                                }}
                            >
                                <CopyIcon color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.nameGlobeRow}>
                            {assets && <Image source={assets[EnumIconAsset.Address] as ImageURISource} />}
                            <Anchor style={styles.anchor} source={getBlockExplorerUrl(address)}>
                                <Text style={[globalStyle.rtext, styles.anchorText]} numberOfLines={1}>
                                    {address.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.rtext, styles.anchorText]}>
                                    {address.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                            </Anchor>
                            <TouchableOpacity
                                onPress={() => {
                                    setStringAsync(address)
                                        .then(() => {
                                            dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                        })
                                        .catch(console.log);
                                }}
                            >
                                <CopyIcon color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.statusColumn}>
                        <Text style={[globalStyle.rtext, styles.itemStatus]}>
                            {item.ballotUpdate ? getString('투표완료') : getString('미투표')}
                        </Text>
                    </View>
                    {item.ballotUpdate && (
                        <Text style={[globalStyle.ltext, { color: themeContext.color.textBlack }, styles.itemDate]}>
                            {getValidatorDateString(item.ballotUpdate)}
                        </Text>
                    )}
                </View>
            );
        },
        [assets, dispatch, themeContext.color.primary, themeContext.color.textBlack],
    );

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            <View style={styles.header}>
                <View style={styles.headerFirstLine}>
                    <Text style={[styles.headerText, { color: themeContext.color.primary }]}>
                        {getString('투표에 참여한 검증자 수')}
                    </Text>
                    <Text style={[styles.headerValue, { color: themeContext.color.primary }]}>{participated}</Text>
                </View>

                <View style={styles.headerNextLine}>
                    <Text style={[styles.headerText, { color: themeContext.color.primary }]}>
                        {getString('총 검증자 수')}
                    </Text>
                    <Text style={[styles.headerValue, { color: themeContext.color.primary }]}>{total}</Text>
                </View>
            </View>
            <LineComponent />
            <VoteListHeaderComponent onRefresh={onRefresh} />
            {assets &&
                validators.map((validator) => (
                    <View key={`vote.${validator.id}`}>
                        {renderItem(validator)}
                        <LineComponent />
                    </View>
                ))}
            {loading && <ActivityIndicator />}
            {!loading && total > validators.length && <Text style={styles.moreText}>......</Text>}
        </View>
    );
}

function ClosedValidatorScreen(props: ValidatorProps): JSX.Element {
    const { total, participated, validators, onLayout, onRefresh, loading } = props;
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(iconAssets);
    const dispatch = useAppDispatch();

    const showBallotResult = useCallback(
        (choice?: number | null): JSX.Element => {
            if (choice === VOTE_SELECT.YES) {
                return (
                    <View style={styles.itemBallotContainer}>
                        <View style={[styles.itemBallotAgree, { borderColor: themeContext.color.agree }]} />
                        <Text style={[globalStyle.rtext, { color: themeContext.color.agree }]}>
                            {getString('찬성')}
                        </Text>
                    </View>
                );
            }
            if (choice === VOTE_SELECT.NO) {
                return (
                    <View style={styles.itemBallotContainer}>
                        <CloseIcon color={themeContext.color.disagree} />
                        <Text style={[globalStyle.rtext, { color: themeContext.color.disagree }]}>
                            {getString('반대')}
                        </Text>
                    </View>
                );
            }
            return (
                <View style={styles.itemBallotContainer}>
                    {assets && <Image source={assets[EnumIconAsset.Abstain] as ImageURISource} />}
                    <Text style={[globalStyle.rtext, { color: themeContext.color.abstain }]}>{getString('기권')}</Text>
                </View>
            );
        },
        [assets, themeContext.color.abstain, themeContext.color.agree, themeContext.color.disagree],
    );

    const renderItem = useCallback(
        (item: Validator) => {
            const publicKey = item.publicKey || '';
            const address = item.address || '';
            return (
                <View style={styles.rowContainer}>
                    <View style={styles.nameColumn}>
                        <View style={styles.nameKeyRow}>
                            {assets && <Image source={assets[EnumIconAsset.PublicKey] as ImageURISource} />}
                            <Anchor style={styles.anchor} source={getBlockExplorerUrl(address)}>
                                <Text style={[globalStyle.rtext, styles.anchorText]} numberOfLines={1}>
                                    {publicKey.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.rtext, styles.anchorText]}>
                                    {publicKey.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                            </Anchor>
                            <TouchableOpacity
                                onPress={() => {
                                    setStringAsync(publicKey)
                                        .then(() => {
                                            dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                        })
                                        .catch(console.log);
                                }}
                            >
                                <CopyIcon color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.nameGlobeRow}>
                            {assets && <Image source={assets[EnumIconAsset.Address] as ImageURISource} />}
                            <Anchor style={styles.anchor} source={getBlockExplorerUrl(address)}>
                                <Text style={[globalStyle.rtext, styles.anchorText]} numberOfLines={1}>
                                    {address.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.rtext, styles.anchorText]}>
                                    {address.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                            </Anchor>
                            <TouchableOpacity
                                onPress={() => {
                                    setStringAsync(address)
                                        .then(() => {
                                            dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                        })
                                        .catch(console.log);
                                }}
                            >
                                <CopyIcon color={themeContext.color.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.statusColumn}>
                        {item.ballotUpdate ? (
                            showBallotResult(item.choice)
                        ) : (
                            <Text style={[globalStyle.rtext, styles.itemStatus]}>{getString('미투표')}</Text>
                        )}
                    </View>
                    {item.ballotUpdate && (
                        <Text style={[globalStyle.ltext, { color: themeContext.color.textBlack }, styles.itemDate]}>
                            {getValidatorDateString(item.ballotUpdate)}
                        </Text>
                    )}
                </View>
            );
        },
        [assets, themeContext.color.primary, themeContext.color.textBlack, showBallotResult, dispatch],
    );

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            <View style={styles.header}>
                <View style={styles.headerFirstLine}>
                    <Text style={[styles.headerText, { color: themeContext.color.primary }]}>
                        {getString('투표에 참여한 검증자 수')}
                    </Text>
                    <Text style={[styles.headerValue, { color: themeContext.color.primary }]}>{participated}</Text>
                </View>

                <View style={styles.headerNextLine}>
                    <Text style={[styles.headerText, { color: themeContext.color.primary }]}>
                        {getString('총 검증자 수')}
                    </Text>
                    <Text style={[styles.headerValue, { color: themeContext.color.primary }]}>{total}</Text>
                </View>
            </View>
            <LineComponent />
            <ClosedListHeaderComponent />
            {assets &&
                validators.map((validator) => (
                    <View key={`closed.${validator.id}`}>
                        {renderItem(validator)}
                        <LineComponent />
                    </View>
                ))}
            {loading && <ActivityIndicator />}
            {!loading && total > validators.length && <Text style={styles.moreText}>......</Text>}
        </View>
    );
}

interface Props {
    onLayout: (h: number) => void;
    onRefresh: () => void;
    proposal: Proposal | undefined;
    total: number;
    participated: number;
    validators: Validator[];
    loading: boolean;
}

function ValidatorScreen(props: Props): JSX.Element {
    const { onLayout, onRefresh, proposal, total, participated, validators, loading } = props;

    if (!proposal || proposal?.status === EnumProposalStatus.Created) {
        return <PendingValidatorScreen proposal={proposal} onLayout={onLayout} />;
    }

    switch (proposal.status) {
        case EnumProposalStatus.PendingAssess:
        case EnumProposalStatus.Assess:
        case EnumProposalStatus.Reject:
            return (
                <AssessValidatorScreen
                    total={total}
                    participated={participated}
                    validators={validators}
                    onLayout={onLayout}
                    onRefresh={onRefresh}
                    loading={loading}
                />
            );
        case EnumProposalStatus.PendingVote:
            if (proposal.type === EnumProposalType.Business) {
                return (
                    <AssessValidatorScreen
                        total={total}
                        participated={participated}
                        validators={validators}
                        onLayout={onLayout}
                        onRefresh={onRefresh}
                        loading={loading}
                    />
                );
            }
            return (
                <VoteValidatorScreen
                    total={total}
                    participated={participated}
                    validators={validators}
                    onLayout={onLayout}
                    onRefresh={onRefresh}
                    loading={loading}
                />
            );
        case EnumProposalStatus.Vote:
            return (
                <VoteValidatorScreen
                    total={total}
                    participated={participated}
                    validators={validators}
                    onLayout={onLayout}
                    onRefresh={onRefresh}
                    loading={loading}
                />
            );
        case EnumProposalStatus.Closed:
            return (
                <ClosedValidatorScreen
                    total={total}
                    participated={participated}
                    validators={validators}
                    onLayout={onLayout}
                    onRefresh={onRefresh}
                    loading={loading}
                />
            );
        default:
            return (
                <VoteValidatorScreen
                    total={total}
                    participated={participated}
                    validators={validators}
                    onLayout={onLayout}
                    onRefresh={onRefresh}
                    loading={loading}
                />
            );
    }
}

export default ValidatorScreen;
