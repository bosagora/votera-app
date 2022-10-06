import dayjs from 'dayjs';
import { Maybe, ComponentCommonPeriod, ComponentCommonPeriodInput } from '~/graphql/generated/generated';
import getString from './locales/STRINGS';

export function ddayCalc(time: string | undefined) {
    if (time === undefined) return '';

    const Dday = dayjs(time);
    const now = dayjs(); // 현재(오늘) 날짜를 받아온다.

    const day = Dday.diff(now, 'd');
    if (day < 0) return '';
    return `D - ${day}`;
}

// 과거
export function sinceCalc(time: number | Date | string) {
    if (!time) return '';
    const mTime = dayjs(time);
    const currentTime = dayjs();

    const diffDay = currentTime.diff(mTime, 'd', true);

    if (diffDay >= 1) {
        return getString('#N일 전').replace('#N', Math.floor(diffDay).toString());
    }
    const diffHour = diffDay * 24;
    if (diffHour >= 1) {
        return getString('#N시간 전').replace('#N', Math.floor(diffHour).toString());
    }
    const diffMinute = diffHour * 60;
    if (diffMinute >= 1) {
        return getString('#N분 전').replace('#N', Math.floor(diffMinute).toString());
    }
    return getString('방금 전');
}

export function getPeriodText(startDate: string | undefined | null, endDate: string | undefined | null): string {
    if (!startDate || !endDate) return '';
    const begin = dayjs(startDate);
    const end = dayjs(endDate);
    if (begin.isSame(end, 'y')) {
        return `${begin.format('YYYY.M.D')} - ${end.format('M.D')}`;
    }
    return `${begin.format('YYYY.M.D')} - ${end.format('YYYY.M.D')}`;
}

export function getCommonPeriodText(
    period: Maybe<ComponentCommonPeriod> | ComponentCommonPeriodInput | undefined,
): string {
    if (!period) return '';
    return getPeriodText(period.begin as string, period.end as string);
}

export function getFullDateTime(datetime: Maybe<number> | undefined): string {
    if (!datetime) return '';
    const d = dayjs(datetime * 1000);
    return d.format(getString('YYYY년 M월 D일 HH:mm'));
}

export function afterCalc(diffHour: number) {
    if (diffHour >= 1) {
        const hour = Math.floor(diffHour);
        const hourText = getString('{}시간').replace('{}', hour.toString());
        const minute = Math.floor((diffHour - hour) * 60);
        return minute > 0 ? `${hourText} ${getString('{}분').replace('{}', minute.toString())}` : hourText;
    }
    const minute = Math.ceil(diffHour * 60);
    return getString('{}분').replace('{}', minute.toString());
}

export function getValidatorDateString(date: number): string {
    const d = dayjs(date * 1000);
    return d.format(getString('YYYY년 M월 D일 HH:mm'));
}

export function isValidBusinessVoteDate(startDate?: string, endDate?: string): boolean {
    if (!startDate || !endDate) {
        return false;
    }
    const assessEnd = dayjs().add(7, 'days');
    const voteStart = dayjs(startDate);
    const voteEnd = dayjs(endDate);
    if (assessEnd.isAfter(voteStart) || voteStart.isAfter(voteEnd)) {
        return false;
    }

    return true;
}
