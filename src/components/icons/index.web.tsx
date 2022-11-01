import React from 'react';
import { ColorValue, StyleSheet, Text } from 'react-native';

export async function loadFont() {
    const linkElement = document.createElement('link');
    linkElement.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    linkElement.rel = 'stylesheet';
    document.head.appendChild(linkElement);
    return Promise.resolve();
}

const styles = StyleSheet.create({
    materialIcon: {
        direction: 'ltr',
        fontFamily: 'Material Icons',
        fontSize: 24,
        fontStyle: 'normal',
        fontWeight: 'normal',
        lineHeight: 24,
    },
});

interface IconColorProps {
    color: ColorValue | undefined;
}

interface IconColorSizeProps {
    color: ColorValue | undefined;
    size?: number;
}

export function SearchIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe8b6;</Text>;
}

export function CopyIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: 20, lineHeight: 20 }]}>&#xe14d;</Text>;
}

export function RadioButtonCheckedIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: 28, lineHeight: 28 }]}>&#xe837;</Text>;
}

export function RadioButtonUncheckedIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: 28, lineHeight: 28 }]}>&#xe836;</Text>;
}

export function KeyboardArrowUpIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: 10, lineHeight: 10 }]}>&#xe316;</Text>;
}

export function KeyboardArrowDownIcon(props: IconColorSizeProps) {
    const { size = 24, color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: size, lineHeight: size }]}>&#xe313;</Text>;
}

export function ExpandLessIcon() {
    return <Text style={styles.materialIcon}>&#xe5ce;</Text>;
}

export function ChevronRightIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe5cc;</Text>;
}

interface SmallChevronRightProps {
    color: ColorValue | undefined;
    size: number;
}

export function SmallChevronRightIcon(props: SmallChevronRightProps) {
    const { color, size } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: size, lineHeight: size }]}>&#xe5cc;</Text>;
}

export function ClearIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe14c;</Text>;
}

export function AddIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe145;</Text>;
}

export function ArrowBackIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe5c4;</Text>;
}

export function FileDownloadIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe2c4;</Text>;
}

export function CloseIcon(props: IconColorSizeProps) {
    const { color, size = 24 } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: size, lineHeight: size }]}>&#xe5cd;</Text>;
}

export function CancelIcon(props: IconColorSizeProps) {
    const { color, size = 24 } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: size, lineHeight: size }]}>&#xe5c9;</Text>;
}

export function ChevronLeftIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color }]}>&#xe5cb;</Text>;
}

export function CheckIcon(props: IconColorSizeProps) {
    const { color, size = 24 } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: size, lineHeight: size }]}>&#xe5ca;</Text>;
}

export function HomeIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: 28, lineHeight: 28 }]}>&#xe88a;</Text>;
}

export function NotificationIcon(props: IconColorProps) {
    const { color } = props;
    return <Text style={[styles.materialIcon, { color, fontSize: 28, lineHeight: 28 }]}>&#xe7f4;</Text>;
}
