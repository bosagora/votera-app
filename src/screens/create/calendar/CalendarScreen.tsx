import React, { useContext, useEffect, useState, useCallback, PropsWithChildren } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarList, DateData, LocaleConfig } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import PeriodDay from 'react-native-calendars/src/calendar/day/period';
import { Button, Text, Icon } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import dayjs from 'dayjs';
import { locale as expoLocale } from 'expo-localization';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { selectDatePicker } from '~/state/features/selectDatePicker';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import ShortButton from '~/components/button/ShortButton';
import { ChevronLeftIcon } from '~/components/icons';

LocaleConfig.locales.ko = {
    monthNames: ['일월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '십일월', '십이월'],
    monthNamesShort: ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = expoLocale.startsWith('ko-') ? 'ko' : '';

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'white',
        borderRadius: 47,
        height: 32,
        marginRight: 23,
        padding: 0,
        width: 63,
    },
    buttonTitle: {
        fontSize: 14,
    },
    calendarCaption: {
        fontSize: 8,
        left: 0,
        position: 'absolute',
        textAlign: 'center',
        top: 34,
        width: '100%',
    },
});

interface SelectedCalendarDate {
    key?: 'start' | 'end';
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    marked?: boolean;
    dotColor?: string;
}

function getToday() {
    const today = dayjs().format('YYYY-MM-DD');
    return dayjs(today);
}

function CalendarScreen({ navigation, route }: MainScreenProps<'Calendar'>): JSX.Element | null {
    const isAssess = !!route.params?.isAssess;
    const startDate = route.params?.startDate;
    const endDate = route.params?.endDate;
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [assessCaption, setAssessCaption] = useState<string>();
    const [startSelected, setStartSelected] = useState<string>();
    const [endSelected, setEndSelected] = useState<string>();
    const [minDate, setMinDate] = useState<string>();
    const [maxDate, setMaxDate] = useState<string>();
    const [markedDates, setMarkedDates] = useState<Record<string, SelectedCalendarDate>>({});

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.pop();
                    } else {
                        navigation.dispatch(replaceToHome());
                    }
                }}
                icon={<ChevronLeftIcon color="black" />}
                type="clear"
            />
        );
    }, [navigation]);

    const headerRight = useCallback(() => {
        return (
            <ShortButton
                title={getString('완료')}
                onPress={() => {
                    if (startSelected && endSelected) {
                        dispatch(selectDatePicker({ startDate: startSelected, endDate: endSelected }));
                        if (navigation.canGoBack()) {
                            navigation.pop();
                        } else {
                            navigation.dispatch(replaceToHome());
                        }
                    }
                }}
                disabled={!startSelected || !endSelected}
                buttonStyle={styles.button}
                titleStyle={styles.buttonTitle}
                disabledStyle={styles.button}
            />
        );
    }, [startSelected, endSelected, dispatch, navigation]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: getString('투표기간 선택'),
            headerTitleStyle: globalStyle.headerTitle,
            headerTitleAlign: 'center',
            headerLeft,
            headerRight,
            headerShown: true,
        });
    }, [navigation, headerLeft, headerRight]);

    useFocusEffect(
        useCallback(() => {
            setStartSelected(startDate);
            setEndSelected(endDate);
        }, [startDate, endDate]),
    );

    const setMark = useCallback(
        (start?: string, end?: string) => {
            const evaluation: SelectedCalendarDate = {
                color: 'rgb(242,244,250)',
                textColor: themeContext.color.placeholder,
                disabled: true,
                disableTouchEvent: true,
            };
            const deliberation: SelectedCalendarDate = {
                color: 'rgb(235,231,245)',
                textColor: themeContext.color.placeholder,
                disabled: true,
                disableTouchEvent: true,
            };
            const voting: SelectedCalendarDate = {
                color: themeContext.color.primary,
                textColor: 'white',
            };
            const voteEnd: SelectedCalendarDate = {
                color: 'rgb(242,145,229)',
                textColor: 'white',
            };
            const today = getToday();
            const obj: Record<string, SelectedCalendarDate> = {};
            if (isAssess) {
                // assess period ~ 6 days
                for (let i = 0; i < 7; i += 1) {
                    const dateString = today.add(i, 'd').format('YYYY-MM-DD');
                    obj[dateString] = { ...evaluation };
                    if (i === 0) {
                        obj[dateString].startingDay = true;
                        obj[dateString].marked = true;
                        obj[dateString].dotColor = 'rgb(29,197,220)';
                    }
                    if (i === 6) {
                        obj[dateString].endingDay = true;
                    }
                }
            }
            const index = isAssess ? 7 : 0;
            const maxDeliberation = start ? dayjs(start) : today.add(index + (isAssess ? 2 : 3), 'd');
            const deliberationEnd = maxDeliberation.diff(today, 'd') - 1;
            for (
                let i = index, indexDate = today.add(index, 'd');
                indexDate.isBefore(maxDeliberation, 'd');
                i += 1, indexDate = indexDate.add(1, 'd')
            ) {
                const dateString = indexDate.format('YYYY-MM-DD');
                obj[dateString] = { ...deliberation };
                if (i === index) {
                    obj[dateString].startingDay = true;
                    if (!isAssess) {
                        obj[dateString].marked = true;
                        obj[dateString].dotColor = 'rgb(29,197,220)';
                    }
                } else if (i === deliberationEnd) {
                    obj[dateString].endingDay = true;
                }
            }

            const minDateTime = today.add(index + 2, 'd');
            const maxDateTime = start ? dayjs(start).add(13, 'd') : today.add(index + (isAssess ? 13 : 14), 'd');
            setMinDate(minDateTime.format('YYYY-MM-DD'));
            setMaxDate(maxDateTime.format('YYYY-MM-DD'));
            if (start) {
                for (let i = 0, indexDate = dayjs(start); i < 2; i += 1, indexDate = indexDate.add(1, 'd')) {
                    const dateString = indexDate.format('YYYY-MM-DD');
                    if (i === 0) {
                        obj[dateString] = { ...voting, startingDay: true, endingDay: true };
                    } else {
                        obj[dateString] = { disabled: true, disableTouchEvent: true };
                    }
                }
            }
            if (end) {
                const endMaxDate = dayjs(end);
                const dateString = endMaxDate.format('YYYY-MM-DD');
                obj[dateString] = { ...voteEnd, startingDay: true, endingDay: true };
            }

            setMarkedDates(obj);
        },
        [isAssess, themeContext.color.placeholder, themeContext.color.primary],
    );

    useEffect(() => {
        const today = getToday();
        if (isAssess) {
            setAssessCaption(today.add(2, 'd').format('YYYY-MM-DD'));
        } else {
            setAssessCaption(undefined);
        }
        if (!startSelected && !endSelected) {
            setMark();
            return;
        }
        // check validity of selected date
        if (endSelected) {
            if (!startSelected) {
                // invalid input: cannot select end without start
                setEndSelected(undefined);
                return;
            }
            // check end between 3 days and 14 days after start
            const daysBetween = dayjs(endSelected).diff(startSelected, 'd');
            if (daysBetween < 2 || daysBetween > 13) {
                setEndSelected(undefined);
                return;
            }
        }
        if (startSelected) {
            const base = today.add(isAssess ? 7 + 2 : 0 + 3, 'd');
            // check if vote start between 3 days and 14 days after end of assess
            const daysBetween = dayjs(startSelected).diff(base, 'd');
            if (daysBetween < 0 || daysBetween > 11) {
                setStartSelected(undefined);
                setEndSelected(undefined);
                return;
            }
        }
        setMark(startSelected, endSelected);
    }, [isAssess, startSelected, endSelected, setMark]);

    const onPressDay = (day: DateData) => {
        if (!startSelected) {
            // 맨 처음 눌렀을때
            setStartSelected(day.dateString);
        } else if (startSelected === day.dateString) {
            setStartSelected(undefined);
            setEndSelected(undefined);
        } else if (endSelected === day.dateString) {
            setEndSelected(undefined);
        } else {
            setEndSelected(day.dateString);
        }
    };

    const dayComponent = useCallback(
        // eslint-disable-next-line react/require-default-props
        (props: PropsWithChildren<DayProps & { date?: DateData }>) => {
            const { date, marking, ...others } = props;
            return (
                <View style={{ alignItems: 'center', alignSelf: 'stretch' }}>
                    <PeriodDay
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...others}
                        marking={marking}
                        date={date?.dateString}
                    />
                    {date?.dateString === startSelected && (
                        <Text style={[styles.calendarCaption, { color: marking?.color }]}>{getString('시작일')}</Text>
                    )}
                    {date?.dateString === endSelected && (
                        <Text style={[styles.calendarCaption, { color: marking?.color }]}>{getString('종료일')}</Text>
                    )}
                    {assessCaption && date?.dateString === assessCaption && (
                        <Text style={[styles.calendarCaption, { color: marking?.textColor }]}>
                            {getString('사전평가')}
                        </Text>
                    )}
                </View>
            );
        },
        [startSelected, endSelected, assessCaption],
    );

    if (!minDate || !maxDate) return null;
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{
                    paddingVertical: 30,
                    paddingHorizontal: 22,
                }}
            >
                <Text style={[globalStyle.rtext, { fontSize: 14, lineHeight: 23 }]}>
                    {isAssess
                        ? getString(
                              '투표 시작일과 종료일을 아래에서 선택해주세요&#46; 제안 등록일 포함 7일 동안 사전 평가가 진행되며, 사전평가 종료일 기준 3일 후, 14일 이내 투표를 시작할 수 있습니다&#46;',
                          )
                        : getString(
                              '투표 시작일과 종료일을 아래에서 선택해주세요&#46; 제안 등록일 기준 3일 후, 14일 이내 투표를 시작할 수 있습니다&#46;',
                          )}
                    {'\n\n'}
                    <Text style={{ color: themeContext.color.primary }}>
                        {getString('투표 기간은 최소 3일에서 최대 14일까지 등록 가능합니다&#46;')}
                    </Text>
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <CalendarList
                    dayComponent={dayComponent}
                    pastScrollRange={0}
                    futureScrollRange={1}
                    markedDates={markedDates}
                    calendarHeight={400}
                    monthFormat="M"
                    minDate={minDate}
                    maxDate={maxDate}
                    markingType="period"
                    onDayPress={(day) => onPressDay(day)}
                    theme={{
                        'stylesheet.calendar.header': {
                            monthText: {
                                fontFamily: 'GmarketSansTTFBold',
                                fontSize: 56,
                                color: themeContext.color.primary,
                            },
                        },
                        textDayFontFamily: Platform.OS === 'web' ? 'Robot' : 'RobotoRegular',
                        textDayFontSize: 14,
                        textDayStyle: {
                            fontFamily: Platform.OS === 'web' ? 'Robot' : 'RobotoRegular',
                            fontSize: 14,
                            color: themeContext.color.textBlack,
                        },
                        textSectionTitleColor: themeContext.color.textBlack,
                    }}
                />
            </View>
        </View>
    );
}

export default CalendarScreen;
