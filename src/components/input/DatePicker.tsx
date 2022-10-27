import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';
import dayjs from 'dayjs';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgb(252, 251, 255)',
        borderColor: 'rgb(235, 234, 239)',
        borderRadius: 5,
        borderWidth: 2,
        flexDirection: 'row',
        height: 52,
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
});

export interface Day {
    startDate?: string;
    endDate?: string;
}

interface Props {
    title: string;
    // onChange: (date: Day) => void;
    onNavigate: (value: { isAssess: boolean; startDate?: string; endDate?: string }) => void;
    isAssess: boolean;
    value: Day;
}

function dateDataToString(value?: string): string {
    if (!value) return '';
    return dayjs(value).format('YYYY.MM.DD');
}

function calcDate(value: Day): string {
    if (!value.startDate && !value.endDate) return getString('날짜를 선택해주세요');
    return `${dateDataToString(value.startDate)} ~ ${dateDataToString(value.endDate)}`;
}

function DatePickerComponent(props: Props): JSX.Element {
    const { value, isAssess, onNavigate, ...others } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View
            style={styles.container}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
        >
            <Text
                style={{
                    fontSize: 14,
                    color: !(value.startDate || value.endDate)
                        ? themeContext.color.placeholder
                        : themeContext.color.textBlack,
                }}
            >
                {calcDate(value)}
            </Text>
            <TouchableOpacity
                onPress={() => {
                    onNavigate({
                        startDate: value.startDate,
                        endDate: value.endDate,
                        isAssess,
                    });
                }}
            >
                <Text style={[globalStyle.btext, { color: themeContext.color.primary }]}>{getString('날짜선택')}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default DatePickerComponent;
