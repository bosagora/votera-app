/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import dayjs from 'dayjs';
import { ThemeContext } from 'styled-components/native';
import globalStyle, { MAX_WIDTH } from '~/styles/global';
import { Feeds } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import { getFeed, ComponentFeedCotentContent } from '~/utils/feed/feedUtils';

const ISREAD_WIDTH = 70;

const styles = StyleSheet.create({
    contents: { borderBottomWidth: 1, paddingVertical: 32 },
    dotColumn: { flexDirection: 'row', justifyContent: 'flex-end', width: ISREAD_WIDTH },
    fontContent: { fontSize: 14, lineHeight: 22 },
    period: { fontSize: 10, lineHeight: 20 },
    readDot: { borderRadius: 4, height: 7, width: 7 },
});

interface FeedCardProps {
    item: Feeds;
    onPress: () => void;
}

function FeedCard(props: FeedCardProps): JSX.Element {
    const { item, onPress } = props;
    const { createdAt, isRead = false, type } = item;
    const { feedContent } = getFeed(type, (item.content as ComponentFeedCotentContent) || undefined);
    const themeContext = useContext(ThemeContext);
    const [viewWidth, setViewWidth] = useState(MAX_WIDTH);

    return (
        <TouchableOpacity
            style={[styles.contents, { borderBottomColor: themeContext.color.divider }]}
            onPress={onPress}
            onLayout={(event) => {
                setViewWidth(event.nativeEvent.layout.width);
            }}
        >
            <View style={globalStyle.flexRowBetween}>
                <Text style={[globalStyle.rtext, styles.fontContent, { maxWidth: viewWidth - ISREAD_WIDTH }]}>
                    {feedContent || getString('오류')}
                </Text>
                <View style={styles.dotColumn}>
                    {!isRead && <View style={[styles.readDot, { backgroundColor: themeContext.color.disagree }]} />}
                </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 13 }}>
                <Text style={[globalStyle.ltext, styles.period]}>
                    {dayjs(createdAt as string).format(getString('YYYY년 M월 D일 HH:mm'))}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default FeedCard;
