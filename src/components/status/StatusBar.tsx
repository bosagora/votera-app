/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View } from 'react-native';

import StatusMark from './StatusMark';
import ProgressMark from './ProgressMark';
import DdayMark from './DdayMark';
import globalStyle from '~/styles/global';
import {
    Enum_Proposal_Type as EnumProposalType,
    Enum_Proposal_Status as EnumProposalStatus,
} from '~/graphql/generated/generated';

interface StatusBarProps {
    type: EnumProposalType;
    status: EnumProposalStatus;
    deadline: string;
    temp: boolean;
}

/**
 *  <StatusBar type="BUSINESS" status="VOTING" />
    <StatusBar type="BUSINESS" status="ASSESS" />
    <StatusBar type="SYSTEM" status="IN_PROGRESS" />
 */

function StatusBar(props: StatusBarProps): JSX.Element {
    const { type, status, deadline, temp } = props;
    return (
        <View style={[globalStyle.flexRowBetween, { flex: 1 }]}>
            <View style={globalStyle.flexRowAlignCenter}>
                <StatusMark type={type} transparent={false} />
                <ProgressMark style={{ marginLeft: 10 }} status={status} type={type} temp={temp} />
            </View>
            {!temp && <DdayMark deadline={deadline} type={type} status={status} />}
        </View>
    );
}

export default StatusBar;
