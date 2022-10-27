/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';

interface FeedCardProps {
    id: string;
    content: string;
    date: Date;
    isRead: boolean;
    onPress: () => void;
    // id 네비게이션 용도
}

function ProposalCard(props: FeedCardProps): JSX.Element {
    const { id, content, date, isRead, onPress } = props;
    const created = new Date(date);
    const createdString = `${created.getFullYear()}년 ${
        created.getMonth() + 1
    }월 ${created.getDate()}일 ${created.getHours()}:${created.getMinutes() < 10 ? '0' : ''}${created.getMinutes()}`;
    return (
        <TouchableOpacity
            style={{
                paddingBottom: 33,
                paddingTop: 29,
                borderBottomWidth: 1,
                borderColor: 'rgb(235, 234, 239)',
            }}
            onPress={() => {
                onPress();
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ marginRight: 59 }}>
                    <Text>{content}</Text>
                </View>
                {!isRead && (
                    <View
                        style={{
                            top: 5,
                            width: 7,
                            height: 7,
                            backgroundColor: 'rgb(240,109,63)',
                            borderRadius: 10,
                            right: 10,
                        }}
                    />
                )}
            </View>
            <View style={{ flexDirection: 'row', paddingTop: 13 }}>
                <Text style={{ fontSize: 10 }}>{createdString}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default ProposalCard;
