import React, { useRef, useState, useContext, useCallback } from 'react';
import { Animated, View } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { useFocusEffect, useLinkTo } from '@react-navigation/native';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import globalStyle from '~/styles/global';
import {
    ComponentCommonPeriodInput,
    Enum_Assess_Proposal_State as EnumAssessProposalState,
    Enum_Proposal_Type as EnumProposalType,
} from '~/graphql/generated/generated';
import ReactNativeParallaxHeader from '~/components/ui/RNParallax';
import Period from '~/components/status/Period';
import DdayMark from '~/components/status/DdayMark';
import getString from '~/utils/locales/STRINGS';
import styles, { HEADER_HEIGHT } from '../proposal/styles';
import { getDefaultAssessPeriod, PreviewProposal } from '~/types/proposalType';
import { MainScreenProps } from '~/navigation/main/MainParams';
import { loadPreviewFromSession } from '~/utils/votera/preview';
import Info from '../proposal/Info';

function ProposalPreviewScreen({ navigation, route }: MainScreenProps<'ProposalPreview'>): JSX.Element {
    const scroll = useRef(new Animated.Value(0)).current;
    const [assessPeriod, setAssessPeriod] = useState<ComponentCommonPeriodInput>();
    const [preview, setPreview] = useState<PreviewProposal>();
    const linkTo = useLinkTo();

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const handler = async () => {
                const data = await loadPreviewFromSession();
                if (mounted) {
                    if (!data) {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            linkTo('/home');
                        }
                        return;
                    }
                    setPreview(data);
                    if (data.type === EnumProposalType.Business) {
                        setAssessPeriod(getDefaultAssessPeriod());
                    } else {
                        setAssessPeriod(undefined);
                    }
                }
            };
            handler().catch(console.log);
            return () => {
                mounted = false;
            };
        }, [navigation, linkTo]),
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const titleRender = () => {
        const opacity = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={{ justifyContent: 'space-around', flex: 1 }}>
                <Animated.View
                    style={{
                        borderWidth: 1,
                        borderColor: 'white',
                        borderRadius: 6,
                        alignSelf: 'center',
                        paddingHorizontal: 7,
                        paddingVertical: 5,
                        opacity,
                    }}
                >
                    <Text style={[globalStyle.mtext, { fontSize: 11, color: 'white' }]}>
                        {preview?.type === EnumProposalType.Business ? getString('사업제안') : getString('시스템제안')}
                    </Text>
                </Animated.View>
                <Text style={[globalStyle.btext, { color: 'white', fontSize: 20, maxWidth: 220, textAlign: 'center' }]}>
                    {preview?.name || ''}
                </Text>
                <Animated.View style={{ alignItems: 'center', opacity }}>
                    {assessPeriod?.begin && assessPeriod.end && (
                        <Period
                            type={getString('제안기간')}
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={assessPeriod?.begin as string}
                            deadline={assessPeriod?.end as string}
                        />
                    )}

                    {preview?.votePeriod?.begin && preview?.votePeriod?.end && (
                        <Period
                            type={getString('투표기간')}
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={preview.votePeriod.begin}
                            deadline={preview.votePeriod.end}
                        />
                    )}
                </Animated.View>
            </View>
        );
    };

    const renderNavBar = () => {
        const offset = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [0, 0, -5],
            extrapolate: 'clamp',
        });
        return (
            <Animated.View style={{ paddingHorizontal: 20, marginTop: offset }}>
                <View style={styles.statusBar} />
                <View style={styles.navBar}>
                    <Button
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                linkTo('/home');
                            }
                        }}
                        icon={<Icon name="chevron-left" color="white" tvParallaxProperties={undefined} />}
                        type="clear"
                    />

                    <DdayMark color="white" deadline={preview?.votePeriod?.end} type={preview?.type} />
                </View>
            </Animated.View>
        );
    };

    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <ReactNativeParallaxHeader
                headerMinHeight={HEADER_HEIGHT}
                headerMaxHeight={250}
                extraScrollHeight={20}
                title={titleRender()}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, import/extensions
                backgroundImage={require('@assets/images/header/proposalBg.png')}
                backgroundImageScale={1.2}
                renderNavBar={renderNavBar}
                renderContent={() => (
                    <View
                        style={{
                            paddingHorizontal: 22,
                            paddingTop: 25,
                            marginBottom: 60,
                        }}
                    >
                        <Info
                            isPreview
                            previewData={preview}
                            assessResultData={{ proposalState: EnumAssessProposalState.Invalid }}
                            onLayout={(value) => {
                                console.log('Info.onLayout h=', value);
                            }}
                        />
                    </View>
                )}
                scrollViewProps={{
                    onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
                        useNativeDriver: false,
                    }),
                }}
            />
        </>
    );
}

export default ProposalPreviewScreen;
