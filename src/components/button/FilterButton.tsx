import React, { useEffect, useState } from 'react';
import { StyleProp, ViewStyle, View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import globalStyle from '~/styles/global';
import { FeedFilterType, OpinionFilterType, ProposalFilterType } from '~/types/filterType';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showBottomSheet, hideBottomSheet } from '~/state/features/bottomSheet';

type UNION_FILTER_TYPEOF = typeof ProposalFilterType | typeof FeedFilterType | typeof OpinionFilterType;
type UNION_FILTER_BUTTON_TYPE = ProposalFilterType | FeedFilterType | OpinionFilterType;

interface FilterButtonProps {
    filterType: UNION_FILTER_TYPEOF;
    currentFilter: UNION_FILTER_BUTTON_TYPE;
    setFilter: (value: UNION_FILTER_BUTTON_TYPE) => void;
    style?: StyleProp<ViewStyle>;
}

function FilterButton(props: FilterButtonProps): JSX.Element {
    const { filterType, currentFilter, setFilter, style } = props;
    const dispatch = useAppDispatch();
    const [filterOnComponent, setFilterOnComponent] = useState<UNION_FILTER_BUTTON_TYPE>();

    const renderFilterCard = ({ item }: { item: UNION_FILTER_BUTTON_TYPE }) => {
        return (
            <TouchableOpacity
                style={{ height: 30 }}
                onPressIn={() => {
                    setFilter(item);
                    setFilterOnComponent(item);
                    dispatch(hideBottomSheet());
                }}
            >
                <Text>{getString(item)}</Text>
            </TouchableOpacity>
        );
    };

    function renderBottomSheetBodyComponent() {
        return (
            <View style={{ backgroundColor: 'white' }}>
                <FlatList
                    keyExtractor={(item, index) => `filter_${index}`}
                    data={Object.values(filterType)}
                    renderItem={renderFilterCard}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: 22, height: 200 }}
                />
            </View>
        );
    }

    useEffect(() => {
        if (currentFilter) {
            setFilterOnComponent(currentFilter);
        }
    }, [currentFilter]);

    return (
        <TouchableOpacity
            onPress={() => {
                console.log('Click Filter Tap');
                dispatch(
                    showBottomSheet({
                        bodyComponent: () => renderBottomSheetBodyComponent(),
                        sheetHeight: Object.values(filterType).length * 70,
                    }),
                );
            }}
        >
            <View style={[globalStyle.flexRowBetween, style]}>
                <Text style={{ fontSize: 13 }}>{getString(filterOnComponent as string)}</Text>
                <Icon
                    name="keyboard-arrow-down"
                    color="darkgray"
                    style={{ marginLeft: 12 }}
                    tvParallaxProperties={undefined}
                />
            </View>
        </TouchableOpacity>
    );
}

export default FilterButton;

FilterButton.defaultProps = {
    style: undefined,
};
