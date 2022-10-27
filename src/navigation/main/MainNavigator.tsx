import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import VoteraDrawer from '~/screens/home/VoteraDrawer';
import CreateProposal from '~/screens/create/CreateProposalScreen';
import ProposalPayment from '../../screens/create/ProposalPaymentScreen';
import ProposalPreviewScreen from '~/screens/create/ProposalPreviewScreen';
import CalendarScreen from '~/screens/create/calendar/CalendarScreen';
import FeedScreen from '~/screens/feed/FeedScreen';
import NoticeScreen from '~/screens/notice/NoticeScreen';
import CreateNoticeScreen from '~/screens/notice/CreateNoticeScreen';
import ProposalDetailScreen from '~/screens/proposal/ProposalDetailScreen';
import TempProposalListScreen from '~/screens/home/TempProposalListScreen';
import MyProposalListScreen from '~/screens/home/MyProposalListScreen';
import JoinProposalListScreen from '~/screens/home/JoinProposalListScreen';
import Search from '~/screens/home/SearchScreen';
import SettingsScreen from '~/screens/settings/index';
import AccountInfoScreen from '~/screens/settings/AccountInfo';
import AlarmScreen from '~/screens/settings/Alarm';
import HomeScreen from '~/screens/home/HomeScreen';
import { MainDrawerParams } from '~/navigation/main/MainParams';
import globalStyle, { isLargeScreen } from '~/styles/global';

const Drawer = createDrawerNavigator<MainDrawerParams>();

// eslint-disable-next-line react/jsx-props-no-spreading
const voteraDrawerContent = (props: DrawerContentComponentProps) => <VoteraDrawer {...props} />;

export function MainDrawer(): JSX.Element {
    const { width } = useWindowDimensions();

    return (
        <Drawer.Navigator
            screenOptions={{
                headerTitleStyle: globalStyle.headerTitle,
                headerLeftContainerStyle: { paddingLeft: 20 },
                headerRightContainerStyle: { paddingRight: 20 },
                swipeEnabled: true,
                drawerType: isLargeScreen(width) ? 'permanent' : 'front',
                headerShown: false,
            }}
            drawerContent={voteraDrawerContent}
            useLegacyImplementation
            backBehavior="history"
        >
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Feed" component={FeedScreen} />
            <Drawer.Screen name="Search" component={Search} />
            <Drawer.Screen name="ProposalDetail" component={ProposalDetailScreen} />
            <Drawer.Screen name="TempProposalList" component={TempProposalListScreen} />
            <Drawer.Screen name="MyProposalList" component={MyProposalListScreen} />
            <Drawer.Screen name="JoinProposalList" component={JoinProposalListScreen} />
            <Drawer.Screen name="Notice" component={NoticeScreen} />
            <Drawer.Screen name="CreateNotice" component={CreateNoticeScreen} />

            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="AccountInfo" component={AccountInfoScreen} />
            <Drawer.Screen name="Alarm" component={AlarmScreen} />

            <Drawer.Screen name="CreateProposal" component={CreateProposal} />
            <Drawer.Screen name="ProposalPayment" component={ProposalPayment} />
            <Drawer.Screen name="ProposalPreview" component={ProposalPreviewScreen} />
            <Drawer.Screen name="Calendar" component={CalendarScreen} />
        </Drawer.Navigator>
    );
}

export default MainDrawer;
