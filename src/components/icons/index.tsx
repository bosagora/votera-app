import React from 'react';
import { ColorValue } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon } from 'react-native-elements';

export async function loadFont() {
    await MaterialIcons.loadFont();
}

interface IconColorProps {
    color: ColorValue | undefined;
}

interface IconColorSizeProps {
    color: ColorValue | undefined;
    size?: number;
}

export function SearchIcon(props: IconColorProps) {
    const { color } = props;
    return <MaterialIcons name="search" color={color} size={24} />;
}

export function CopyIcon(props: IconColorProps) {
    const { color } = props;
    return <MaterialIcons name="content-copy" size={20} color={color} />;
}

export function RadioButtonCheckedIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="radio-button-checked" size={28} color={color} tvParallaxProperties={undefined} />;
}

export function RadioButtonUncheckedIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="radio-button-unchecked" size={28} color={color} tvParallaxProperties={undefined} />;
}

export function KeyboardArrowUpIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="keyboard-arrow-up" size={10} color={color} tvParallaxProperties={undefined} />;
}

export function KeyboardArrowDownIcon(props: IconColorSizeProps) {
    const { size = 24, color } = props;
    return <Icon name="keyboard-arrow-down" size={size} color={color} tvParallaxProperties={undefined} />;
}

export function ExpandLessIcon() {
    return <Icon name="expand-less" tvParallaxProperties={undefined} />;
}

export function ChevronRightIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="chevron-right" color={color} tvParallaxProperties={undefined} />;
}

interface SmallChevronRightProps {
    color: ColorValue | undefined;
    size: number;
}

export function SmallChevronRightIcon(props: SmallChevronRightProps) {
    const { color, size } = props;
    return <Icon name="chevron-right" color={color} size={size} tvParallaxProperties={undefined} />;
}

export function ClearIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="clear" color={color} tvParallaxProperties={undefined} />;
}

export function AddIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="add" color={color} tvParallaxProperties={undefined} />;
}

export function ArrowBackIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="arrow-back" color={color} tvParallaxProperties={undefined} />;
}

export function FileDownloadIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="file-download" color={color} tvParallaxProperties={undefined} />;
}

export function CloseIcon(props: IconColorSizeProps) {
    const { color, size = 24 } = props;
    return <Icon name="close" color={color} size={size} tvParallaxProperties={undefined} />;
}

export function CancelIcon(props: IconColorSizeProps) {
    const { color, size = 24 } = props;
    return <Icon name="cancel" color={color} size={size} tvParallaxProperties={undefined} />;
}

export function ChevronLeftIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="chevron-left" color={color} tvParallaxProperties={undefined} />;
}

export function CheckIcon(props: IconColorSizeProps) {
    const { color, size = 24 } = props;
    return <Icon name="check" color={color} size={size} tvParallaxProperties={undefined} />;
}

export function HomeIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="home" size={28} color={color} tvParallaxProperties={undefined} />;
}

export function NotificationIcon(props: IconColorProps) {
    const { color } = props;
    return <Icon name="notifications" size={28} color={color} tvParallaxProperties={undefined} />;
}
