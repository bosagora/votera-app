export enum PushStatusType {
    NEW_TOKEN = 'NEW_TOKEN',
    RENEW_TOKEN = 'RENEW_TOKEN',
    USING_TOKEN = 'USING_TOKEN',
    DISABLED = 'DISABLED',
}

export interface PushRequestStatus {
    tokenStatus: PushStatusType;
    token: string;
}
