import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
};

export type NotificationsInput = {
    memberId: Scalars['String'];
};

export type NotificationsSubscriptionVariables = {
    input?: NotificationsInput;
};

export const NotificationsDocument = gql`
    subscription NOTIFICATIONS_SUBSCRIPTION($input: NotificationsInput!) {
        listenNotifications(input: $input) {
            id
            type
            content {
                version
                userName
                activityName
                groupName
                proposalTitle
                questionTitle
                comment
            }
            navigation {
                proposalId
                groupId
                memberId
                activityId
                activityType
                postId
                status
            }
        }
    }
`;

export function useNotificationsSubscription(
    baseOptions?: Apollo.SubscriptionHookOptions<any, NotificationsSubscriptionVariables>,
) {
    return Apollo.useSubscription<any, NotificationsSubscriptionVariables>(NotificationsDocument, baseOptions);
}
