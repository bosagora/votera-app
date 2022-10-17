import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { Proposal, Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import Period from '../status/Period';
import StatusMark from '../status/StatusMark';
import DdayMark from '../status/DdayMark';

const styles = StyleSheet.create({
    contents: {
        backgroundColor: 'white',
        borderBottomColor: 'rgb(235, 234, 239)',
        flexDirection: 'column',
        paddingHorizontal: 22,
        paddingVertical: 20,
    },
    fontDescriptions: { color: 'white', fontSize: 13, paddingRight: 65 },
    fontTitles: { color: 'white', fontSize: 14, paddingBottom: 7 },
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
        backgroundColor: 'rgb(112, 58, 222)',
        borderRadius: 21.5,
        bottom: 0,
        height: 43,
        justifyContent: 'center',
        width: 43,
    },
    writeContent: {
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        left: 0,
        paddingHorizontal: 23,
        position: 'absolute',
        right: 18,
    },
});

interface ProposalTopProps {
    item: Proposal;
    onPress: () => void;
}

function ProposalTop(props: ProposalTopProps): JSX.Element {
    const { item, onPress } = props;
    const { name, description, status, assessPeriod, votePeriod, type } = item;

    return (
        <View style={styles.contents}>
            <ImageBackground
                // eslint-disable-next-line global-require, import/extensions, @typescript-eslint/no-unsafe-assignment
                source={require('@assets/images/header/bgLong.png')}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
            >
                <View style={{ alignItems: 'flex-end' }}>
                    <DdayMark color="white" deadline={votePeriod?.end as string} type={type} />
                </View>
                <View style={globalStyle.flexRowBetween}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <StatusMark type={type} transparent />
                    </View>
                </View>
                <View style={{ paddingVertical: Platform.OS === 'android' ? 0 : 13 }}>
                    <Text style={[globalStyle.btext, styles.fontTitles, { paddingBottom: 0 }]}>{name}</Text>
                    <Text numberOfLines={1} style={styles.fontDescriptions}>
                        {description}
                    </Text>
                    <View style={{ paddingTop: Platform.OS === 'android' ? 0 : 13 }}>
                        {type === EnumProposalType.Business && (
                            <Period
                                type={getString('평가기간')}
                                created={assessPeriod?.begin as string}
                                deadline={assessPeriod?.end as string}
                                color="white"
                            />
                        )}
                        <View style={styles.votingPeriodWithBtn}>
                            <Period
                                type={getString('투표기간')}
                                created={votePeriod?.begin as string}
                                deadline={votePeriod?.end as string}
                                color="white"
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
            <View style={styles.writeContent}>
                <TouchableOpacity style={styles.writeButton} onPress={onPress}>
                    <Icon
                        name="chevron-right"
                        color="white"
                        style={{ bottom: 1, left: 1 }}
                        tvParallaxProperties={undefined}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ProposalTop;
