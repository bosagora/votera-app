import React, { useEffect, useState, useContext } from 'react';
import { StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FeedFilterType, OpinionFilterType, ProposalFilterType } from '~/types/filterType';
import getString from '~/utils/locales/STRINGS';
import globalStyle from '~/styles/global';

const styles = StyleSheet.create({
    container: { alignItems: 'flex-end', width: 140 },
    dropDownContainer: {
        borderWidth: 0,
        padding: 10,
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    listItemContainer: { margin: 4 },
    pickerStyle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', width: 80 },
});

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
    const themeContext = useContext(ThemeContext);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(currentFilter);
    const [items, setItems] = useState(
        Object.values(filterType).map((v) => ({
            label: getString(v as string),
            value: v as UNION_FILTER_BUTTON_TYPE,
        })),
    );

    useEffect(() => {
        setValue(currentFilter);
    }, [currentFilter]);

    return (
        <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            onChangeValue={(v) => {
                if (v) {
                    setFilter(v);
                }
            }}
            containerStyle={styles.container}
            style={[styles.pickerStyle, style]}
            showTickIcon={false}
            disableBorderRadius={false}
            listItemContainerStyle={styles.listItemContainer}
            labelStyle={[globalStyle.rtext, { fontSize: 13, lineHeight: 24, color: themeContext.color.textBlack }]}
            listItemLabelStyle={[globalStyle.rtext, { fontSize: 13, lineHeight: 24, color: themeContext.color.black }]}
            selectedItemLabelStyle={[
                globalStyle.rtext,
                { fontSize: 13, lineHeight: 24, color: themeContext.color.primary },
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
        />
    );
}

export default FilterButton;

FilterButton.defaultProps = {
    style: undefined,
};
