/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import {
    Enum_Proposal_Type as EnumProposalType,
    Enum_Proposal_Status as EnumProposalStatus,
} from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

interface HeaderProps {
    status: EnumProposalStatus;
    type: EnumProposalType;
    temp: boolean;
}
/*
<ProgressMark status="VOTING" type="BUSINESS" />
<ProgressMark status="IN_PROGRESS" type="SYSTEM" />
<ProgressMark status="ASSESS" type="SYSTEM" />
<ProgressMark status="CLOSED" type="SYSTEM" />
*/

export const getProposalStatusString = (status: EnumProposalStatus | undefined) => {
    switch (status) {
        case 'CREATED':
            return getString('결제 대기중');
        case 'PENDING_ASSESS':
            return getString('사전평가 준비중');
        case 'ASSESS':
            return getString('사전평가중');
        case 'PENDING_VOTE':
            return getString('투표 준비중');
        case 'VOTE':
            return getString('투표중');
        case 'REJECT':
            return getString('사전평가 탈락');
        case 'CLOSED':
            return getString('결과보기');
        default:
            return '';
    }
};

function HeaderInfo(props: HeaderProps): JSX.Element {
    const { status, type, temp } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <View style={{ flexDirection: 'row' }}>
            <Text
                style={{
                    fontSize: 11,
                    color: type === EnumProposalType.Business ? themeContext.color.business : themeContext.color.system,
                }}
            >
                {temp ? getString('작성중') : getProposalStatusString(status)}
            </Text>
            {status === 'CLOSED' && (
                <Icon
                    type="font-awesome"
                    size={14}
                    name="angle-right"
                    style={{ paddingLeft: 9 }}
                    color={type === EnumProposalType.Business ? themeContext.color.business : themeContext.color.system}
                    tvParallaxProperties={undefined}
                />
            )}
        </View>
    );
}

export default HeaderInfo;
