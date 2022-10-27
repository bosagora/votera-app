import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { Version } from '~/graphql/generated/generated';

let appUpdate = '';
let currentVersion: string = Application.nativeApplicationVersion || '1.0.0';

export function setAppUpdate(version: Pick<Version, 'ios' | 'android'> | undefined) {
    switch (Platform.OS) {
        case 'ios':
            currentVersion = version?.ios || '';
            break;
        case 'android':
            currentVersion = version?.android || '';
            break;
        default:
            return;
    }

    if (!currentVersion) {
        appUpdate = '현재 버전을 확인할 수 없습니다';
        return;
    }
    if (Application.nativeApplicationVersion === currentVersion) {
        appUpdate = '현재 앱이 최신버전 상태입니다.';
    } else {
        appUpdate = '앱 업데이트가 필요합니다.';
    }
}

export function getAppUpdate() {
    return appUpdate;
}

export function getCurrentVersion() {
    return currentVersion;
}
