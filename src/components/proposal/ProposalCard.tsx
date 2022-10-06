import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, ImageURISource } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import dayjs from 'dayjs';
import { useAssets } from 'expo-asset';
import globalStyle from '~/styles/global';
import { Proposal, Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import StatusBar from '../status/StatusBar';
import Period from '../status/Period';

const styles = StyleSheet.create({
    contents: {
        borderBottomColor: 'rgb(235, 234, 239)',
        borderBottomWidth: 1,
        // paddingHorizontal: 22,
        paddingVertical: 33,
    },
    // dividers: { backgroundColor: , marginTop: 34 },
    fontDescriptions: { fontSize: 13, paddingRight: 65 },
    fontTitles: { color: 'black', fontSize: 14, paddingBottom: 7 },
    votingPeriodWithBtn: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 0 : 3,
    },
});

enum EnumIconAsset {
    ArrowGrad = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/icons/arrow/arrowGrad.png')];

interface ProposalCardProps {
    item: Proposal;
    temp?: boolean;
    onPress: () => void;
    onDelete?: () => void;
    savedTime?: number;
}

function ProposalCard(props: ProposalCardProps): JSX.Element {
    const { item, temp, savedTime, onPress, onDelete } = props;
    const { name: title, description, type, status, assessPeriod, votePeriod } = item;
    const [assets] = useAssets(iconAssets);

    return (
        <TouchableOpacity style={styles.contents} onPress={onPress}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <StatusBar type={type} status={status} deadline={votePeriod?.end as string} temp={!!temp} />
                {temp && (
                    <Button
                        icon={<Icon name="clear" tvParallaxProperties={undefined} />}
                        type="clear"
                        onPress={() => {
                            if (onDelete) onDelete();
                        }}
                    />
                )}
            </View>
            <View style={{ paddingVertical: Platform.OS === 'android' ? 13 : 13 }}>
                <Text style={[globalStyle.btext, styles.fontTitles]}>{title}</Text>
                <Text numberOfLines={1} style={styles.fontDescriptions}>
                    {description}
                </Text>
                {temp ? (
                    <View style={{ flexDirection: 'row', marginTop: Platform.OS === 'android' ? 0 : 10 }}>
                        <Text style={[globalStyle.ltext, { fontSize: 10 }]}>{getString('마지막 저장일')}</Text>
                        <Text style={[globalStyle.ltext, { fontSize: 10, marginLeft: 12 }]}>
                            {dayjs(savedTime).format(getString('YYYY년 M월 D일 HH:mm'))}
                        </Text>
                    </View>
                ) : (
                    <View style={{ paddingTop: Platform.OS === 'android' ? 0 : 13 }}>
                        {type === EnumProposalType.Business && assessPeriod && (
                            <Period
                                type={getString('제안기간')}
                                created={assessPeriod?.begin as string}
                                deadline={assessPeriod?.end as string}
                            />
                        )}
                        <View style={styles.votingPeriodWithBtn}>
                            <Period
                                type={getString('투표기간')}
                                created={votePeriod?.begin as string}
                                deadline={votePeriod?.end as string}
                            />
                            {assets && (
                                <Image
                                    style={{ marginLeft: 17 }}
                                    source={assets[EnumIconAsset.ArrowGrad] as ImageURISource}
                                />
                            )}
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default ProposalCard;

ProposalCard.defaultProps = {
    temp: false,
    onDelete: undefined,
    savedTime: undefined,
};
