/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ColorValue } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import {
    Enum_Proposal_Type as EnumProposalType,
    Enum_Proposal_Status as EnumProposalStatus,
} from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';
import globalStyle from '~/styles/global';

const styles = StyleSheet.create({
    label: { fontSize: 11, lineHeight: 19 },
});
/*
<ProgressMark status="VOTING" type="BUSINESS" />
<ProgressMark status="IN_PROGRESS" type="SYSTEM" />
<ProgressMark status="ASSESS" type="SYSTEM" />
<ProgressMark status="CLOSED" type="SYSTEM" />
*/

export const getProposalStatusString = (status: EnumProposalStatus | undefined, paid?: boolean) => {
    switch (status) {
        case EnumProposalStatus.Created:
            return paid ? getString('제안생성중') : getString('결제 대기중');
        case EnumProposalStatus.PendingAssess:
            return getString('사전평가 준비중');
        case EnumProposalStatus.Assess:
            return getString('사전평가중');
        case EnumProposalStatus.PendingVote:
            return getString('논의중');
        case EnumProposalStatus.Vote:
            return getString('투표중');
        case EnumProposalStatus.Reject:
            return getString('사전평가탈락');
        case EnumProposalStatus.Closed:
            return getString('결과보기');
        default:
            return '';
    }
};

interface ProgressMarkProps {
    status: EnumProposalStatus;
    type: EnumProposalType;
    temp?: boolean;
    transparent?: boolean;
    style?: StyleProp<ViewStyle> | undefined;
}

function ProgressMark(props: ProgressMarkProps): JSX.Element {
    const { status, type, temp, transparent, style } = props;
    const themeContext = useContext(ThemeContext);
    let color: ColorValue | undefined;

    if (transparent) {
        color = 'white';
    } else {
        switch (type) {
            case EnumProposalType.Business:
                color = themeContext.color.business;
                break;
            case EnumProposalType.System:
            default:
                color = themeContext.color.system;
                break;
        }
    }

    return (
        <View style={[{ flexDirection: 'row' }, style]}>
            <Text style={[globalStyle.mtext, styles.label, { color }]}>
                {temp ? getString('작성중') : getProposalStatusString(status)}
            </Text>
            {status === EnumProposalStatus.Closed && (
                <Icon
                    type="font-awesome"
                    size={14}
                    name="angle-right"
                    style={{ paddingLeft: 8 }}
                    color={color}
                    tvParallaxProperties={undefined}
                />
            )}
        </View>
    );
}

export default ProgressMark;

ProgressMark.defaultProps = {
    style: undefined,
    temp: false,
    transparent: false,
};
