import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Platform, ImageURISource } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';
import globalStyle from '~/styles/global';
import { Proposal, Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import { WhereType } from '~/graphql/hooks/Proposals';
import getString from '~/utils/locales/STRINGS';
import Period from '../status/Period';
import StatusMark from '../status/StatusMark';
import ProgressMark from '../status/ProgressMark';
import DdayMark from '../status/DdayMark';
import { ChevronRightIcon } from '~/components/icons';

enum EnumImageAsset {
    WhereProject = 0,
    WhereOpen,
}

// eslint-disable-next-line global-require, import/extensions
const imageAssets = [require('@assets/images/header/bgLong.png'), require('@assets/images/header/bg_1.png')];

const styles = StyleSheet.create({
    contents: {
        flexDirection: 'column',
        paddingVertical: 20,
    },
    fontDescriptions: { color: 'white', fontSize: 13, lineHeight: 23 },
    fontTitles: { color: 'white', fontSize: 16, lineHeight: 24 },
    imageBackground: {
        paddingHorizontal: 23,
        paddingVertical: 23,
        width: 'auto',
    },
    votingPeriodWithBtn: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 0 : 3,
    },
    writeButton: {
        alignItems: 'center',
        borderRadius: 21.5,
        bottom: 0,
        height: 43,
        justifyContent: 'center',
        padding: 1,
        width: 43,
    },
    writeContent: {
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        left: 0,
        paddingHorizontal: 23,
        position: 'absolute',
        width: '100%',
    },
});

interface ProposalTopProps {
    item: Proposal;
    onPress: () => void;
    where: WhereType;
}

function ProposalTop(props: ProposalTopProps): JSX.Element | null {
    const { where, item, onPress } = props;
    const { name, description, status, assessPeriod, votePeriod, type } = item;
    const themeContext = useContext(ThemeContext);
    const [assets] = useAssets(imageAssets);

    if (!assets) {
        return null;
    }
    return (
        <View style={[styles.contents, { backgroundColor: themeContext.color.white }]}>
            <ImageBackground
                // eslint-disable-next-line global-require, import/extensions, @typescript-eslint/no-unsafe-assignment
                source={assets[EnumImageAsset.WhereProject] as ImageURISource}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
            >
                <View style={{ alignItems: 'flex-end' }}>
                    <DdayMark top deadline={votePeriod?.end as string} type={type} />
                </View>
                <View style={globalStyle.flexRowAlignCenter}>
                    <StatusMark type={type} transparent />
                    <ProgressMark style={{ marginLeft: 10 }} status={status} type={type} transparent />
                </View>
                <View style={{ paddingVertical: Platform.OS === 'android' ? 0 : 13 }}>
                    <Text style={[globalStyle.btext, styles.fontTitles]}>{name}</Text>
                    <Text numberOfLines={1} style={[globalStyle.rtext, styles.fontDescriptions]}>
                        {description}
                    </Text>
                    <View style={{ paddingTop: Platform.OS === 'android' ? 0 : 13 }}>
                        {type === EnumProposalType.Business && (
                            <Period
                                type={getString('평가기간')}
                                created={assessPeriod?.begin as string}
                                deadline={assessPeriod?.end as string}
                                top
                            />
                        )}
                        <View style={styles.votingPeriodWithBtn}>
                            <Period
                                type={getString('투표기간')}
                                created={votePeriod?.begin as string}
                                deadline={votePeriod?.end as string}
                                top
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
            <View style={styles.writeContent}>
                <TouchableOpacity
                    style={[styles.writeButton, { backgroundColor: themeContext.color.primary }]}
                    onPress={onPress}
                >
                    <ChevronRightIcon color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ProposalTop;
