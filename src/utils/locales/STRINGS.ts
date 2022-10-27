import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import moment from 'moment';
import 'moment/locale/ko';
import en from './ko.json';

i18n.fallbacks = true;

i18n.translations = { en };

i18n.locale = Localization.locale;
moment.locale(Localization.locale);

export const getLocale = (): string => i18n.locale;
export const setLocale = (locale = 'ko'): void => {
    if (!locale) i18n.locale = Localization.locale;
    else i18n.locale = locale;
};

const getString = (param: string): string => {
    if (i18n.locale.startsWith('ko')) return param?.replace(/&#46;/gi, '.');
    return i18n.t(param).replace(/&#46;/gi, '.');
};

export default getString;
