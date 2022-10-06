import React, { useRef, useState } from 'react';
import { View, StatusBar, StyleSheet, Platform, Animated, Text } from 'react-native';
import type { ImageSourcePropType, StyleProp, TextStyle, ViewStyle, ScrollViewProps, ColorValue } from 'react-native';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const NAV_BAR_HEIGHT = 64;

const SCROLL_EVENT_THROTTLE = 16;
const DEFAULT_HEADER_MAX_HEIGHT = 170;
const DEFAULT_HEADER_MIN_HEIGHT = NAV_BAR_HEIGHT;
const DEFAULT_EXTRA_SCROLL_HEIGHT = 30;
const DEFAULT_BACKGROUND_IMAGE_SCALE = 1.5;

const DEFAULT_NAVBAR_COLOR = '#3498db';
const DEFAULT_BACKGROUND_COLOR = '#303F9F';
const DEFAULT_TITLE_COLOR = 'white';

const styles = StyleSheet.create({
    backgroundImage: {
        height: DEFAULT_HEADER_MAX_HEIGHT,
        left: 0,
        position: 'absolute',
        resizeMode: 'cover',
        right: 0,
        top: 0,
    },
    bar: {
        backgroundColor: 'transparent',
        height: DEFAULT_HEADER_MIN_HEIGHT,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    header: {
        backgroundColor: DEFAULT_NAVBAR_COLOR,
        left: 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        top: 0,
    },
    headerText: {
        color: DEFAULT_TITLE_COLOR,
        fontSize: 16,
        textAlign: 'center',
    },
    headerTitle: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        left: 0,
        paddingTop: STATUS_BAR_HEIGHT,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    scrollView: {
        flex: 1,
    },
});

interface RNParallaxProps {
    renderNavBar?: () => JSX.Element;
    renderContent: () => JSX.Element;
    backgroundColor?: ColorValue | undefined;
    backgroundImage?: ImageSourcePropType | undefined | null;
    navbarColor?: ColorValue | undefined;
    title?: string | React.ReactElement | undefined | null;
    titleStyle?: StyleProp<TextStyle> | undefined | null;
    headerTitleStyle?: StyleProp<ViewStyle> | undefined | null;
    headerMaxHeight?: number;
    headerMinHeight?: number;
    scrollEventThrottle?: number | undefined;
    extraScrollHeight?: number | undefined | null;
    backgroundImageScale?: number | undefined | null;
    contentContainerStyle?: StyleProp<ViewStyle> | undefined | null;
    innerContainerStyle?: StyleProp<ViewStyle> | undefined | null;
    scrollViewStyle?: StyleProp<ViewStyle> | undefined | null;
    containerStyle?: StyleProp<ViewStyle> | undefined | null;
    alwaysShowTitle?: boolean | undefined | null;
    alwaysShowNavBar?: boolean | undefined | null;
    statusBarColor?: ColorValue | undefined;
    scrollViewProps?: ScrollViewProps | undefined;
}

function RNParallax(props: RNParallaxProps): JSX.Element {
    const {
        navbarColor,
        statusBarColor,
        containerStyle,
        headerMaxHeight,
        headerMinHeight,
        extraScrollHeight,
        backgroundImageScale,
    } = props;

    const scrollY = useRef(new Animated.Value(0)).current;
    const [inputRange] = useState([
        -(extraScrollHeight || DEFAULT_EXTRA_SCROLL_HEIGHT),
        0,
        (headerMaxHeight || DEFAULT_HEADER_MAX_HEIGHT) - (headerMinHeight || DEFAULT_HEADER_MIN_HEIGHT),
    ]);
    const [outputRange] = useState([
        (headerMaxHeight || DEFAULT_HEADER_MAX_HEIGHT) + (extraScrollHeight || DEFAULT_EXTRA_SCROLL_HEIGHT),
        headerMaxHeight || DEFAULT_HEADER_MAX_HEIGHT,
        headerMinHeight || DEFAULT_HEADER_MIN_HEIGHT,
    ]);

    const getHeaderMaxHeight = () => {
        return headerMaxHeight || DEFAULT_HEADER_MAX_HEIGHT;
    };

    const getHeaderMinHeight = () => {
        return headerMinHeight || DEFAULT_HEADER_MIN_HEIGHT;
    };

    const getBackgroundImageScale = () => {
        return backgroundImageScale || DEFAULT_BACKGROUND_IMAGE_SCALE;
    };

    const getHeaderHeight = () => {
        return scrollY.interpolate({
            inputRange,
            outputRange,
            extrapolate: 'clamp',
        });
    };

    const getNavBarOpacity = () => {
        return scrollY.interpolate({
            inputRange,
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
        });
    };

    const getNavBarForegroundOpacity = () => {
        const { alwaysShowNavBar } = props;
        return scrollY.interpolate({
            inputRange,
            outputRange: [alwaysShowNavBar ? 1 : 0, alwaysShowNavBar ? 1 : 0, 1],
            extrapolate: 'clamp',
        });
    };

    const getImageOpacity = () => {
        return scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
        });
    };

    const getImageTranslate = () => {
        return scrollY.interpolate({
            inputRange,
            outputRange: [0, 0, -50],
            extrapolate: 'clamp',
        });
    };

    const getImageScale = () => {
        return scrollY.interpolate({
            inputRange,
            outputRange: [getBackgroundImageScale(), 1, 1],
            extrapolate: 'clamp',
        });
    };

    const getTitleTranslateY = () => {
        return scrollY.interpolate({
            inputRange,
            outputRange: [5, 0, 0],
            extrapolate: 'clamp',
        });
    };

    const getTitleOpacity = () => {
        const { alwaysShowTitle } = props;
        return scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, alwaysShowTitle ? 1 : 0],
            extrapolate: 'clamp',
        });
    };

    const renderNavbarBackground = () => {
        const navBarOpacity = getNavBarOpacity();
        return (
            <Animated.View
                style={[
                    styles.header,
                    {
                        height: getHeaderHeight(),
                        backgroundColor: navbarColor,
                        opacity: navBarOpacity,
                    },
                ]}
            />
        );
    };

    const renderHeaderBackground = () => {
        const { backgroundImage, backgroundColor } = props;
        const imageOpacity = getImageOpacity();
        const imageTranslate = getImageTranslate();
        const imageScale = getImageScale();

        return (
            <Animated.View
                style={[
                    styles.header,
                    {
                        height: getHeaderHeight(),
                        opacity: imageOpacity,
                        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
                    },
                ]}
            >
                {backgroundImage && (
                    <Animated.Image
                        style={[
                            styles.backgroundImage,
                            {
                                height: getHeaderMaxHeight(),
                                opacity: imageOpacity,
                                transform: [{ translateY: imageTranslate }, { scale: imageScale }],
                            },
                        ]}
                        source={backgroundImage}
                    />
                )}
                {!backgroundImage && (
                    <Animated.View
                        style={{
                            height: getHeaderMaxHeight(),
                            backgroundColor,
                            opacity: imageOpacity,
                            transform: [{ translateY: imageTranslate }, { scale: imageScale }],
                        }}
                    />
                )}
            </Animated.View>
        );
    };

    const renderHeaderTitle = () => {
        const { title, titleStyle, headerTitleStyle } = props;
        const titleTranslateY = getTitleTranslateY();
        const titleOpacity = getTitleOpacity();

        return (
            <Animated.View
                style={[
                    styles.headerTitle,
                    {
                        transform: [{ translateY: titleTranslateY }],
                        height: getHeaderHeight(),
                        opacity: titleOpacity,
                    },
                    headerTitleStyle,
                ]}
            >
                {typeof title === 'string' && <Text style={[styles.headerText, titleStyle]}>{title}</Text>}
                {typeof title !== 'string' && title}
            </Animated.View>
        );
    };

    const renderHeaderForeground = () => {
        const { renderNavBar } = props;
        const navBarOpacity = getNavBarForegroundOpacity();
        return (
            <Animated.View style={[styles.bar, { height: getHeaderMinHeight(), opacity: navBarOpacity }]}>
                {renderNavBar && renderNavBar()}
            </Animated.View>
        );
    };

    const renderScrollView = () => {
        const {
            renderContent,
            scrollEventThrottle,
            scrollViewStyle,
            contentContainerStyle,
            innerContainerStyle,
            scrollViewProps,
        } = props;
        const { onScroll, ...renderableScrollViewProps } = scrollViewProps || {};

        return (
            <Animated.ScrollView
                style={[styles.scrollView, scrollViewStyle]}
                contentContainerStyle={contentContainerStyle}
                scrollEventThrottle={scrollEventThrottle}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                    useNativeDriver: false,
                    listener: onScroll,
                })}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...renderableScrollViewProps}
            >
                <View style={[{ marginTop: getHeaderMaxHeight() }, innerContainerStyle]}>{renderContent()}</View>
            </Animated.ScrollView>
        );
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <StatusBar backgroundColor={statusBarColor || navbarColor} />
            {renderScrollView()}
            {renderNavbarBackground()}
            {renderHeaderBackground()}
            {renderHeaderTitle()}
            {renderHeaderForeground()}
        </View>
    );
}

export default RNParallax;

RNParallax.defaultProps = {
    renderNavBar: () => <View />,
    navbarColor: DEFAULT_NAVBAR_COLOR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    backgroundImage: null,
    title: null,
    titleStyle: styles.headerText,
    headerTitleStyle: null,
    headerMaxHeight: DEFAULT_HEADER_MAX_HEIGHT,
    headerMinHeight: DEFAULT_HEADER_MIN_HEIGHT,
    scrollEventThrottle: SCROLL_EVENT_THROTTLE,
    extraScrollHeight: DEFAULT_EXTRA_SCROLL_HEIGHT,
    backgroundImageScale: DEFAULT_BACKGROUND_IMAGE_SCALE,
    contentContainerStyle: null,
    innerContainerStyle: null,
    scrollViewStyle: null,
    containerStyle: null,
    alwaysShowTitle: true,
    alwaysShowNavBar: true,
    statusBarColor: null,
    scrollViewProps: {},
};
