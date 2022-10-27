/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * 변수의 빈 값인지 확인합니다.
 * '', null, 'null', undefined, Object Key properties
 *
 * @param value 확인할 값
 */
export const isEmpty = (value: any): boolean => {
    if (
        value === '' ||
        value === null ||
        value === 'null' ||
        value === undefined ||
        (value !== null && typeof value === 'object' && !Object.keys(value).length)
    ) {
        return true;
    }
    return false;
};

/**
 * 객체 내 모든 변수가 가진 데이터가 empty한지 확인합니다.
 * 주의 : 객체가 아닐경우 false를 return 합니다.
 * @param object 모든 프로퍼티의 isEmpty를 확인할 객체
 */
export const isObjectPropertyNotEmpty = (obj: any): boolean => {
    if (typeof obj !== 'object') {
        return false;
    }
    for (const property in obj) {
        if (!isEmpty(obj[property])) {
            return true;
        }
    }
    return false;
};
