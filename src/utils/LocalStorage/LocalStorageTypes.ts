import { PushStatusType } from '~/types/pushType';

export interface LocalStorageEnrolledProps {
    address: string;
}

export interface LocalStorageUserProps {
    userId?: string;
    memberId?: string;
    username?: string;
    address?: string;
    token?: string;
    enablePush?: boolean;
    feedReadTime?: number;
    locale?: string;
}

export interface LocalStorageProps {
    user: LocalStorageUserProps;
    members: LocalStorageEnrolledProps[];
    bookmarks: string[];
}

export interface LocalStoragePushProps {
    id?: string;
    token: string;
    enablePush: boolean;
    tokenStatus: PushStatusType;
}

export interface LocalStorageProposalProps {
    id?: string;
    name: string;
    description: string;
    type: string;
    fundingAmount?: string;
    startDate?: string;
    endDate?: string;
    timestamp: number;
}
