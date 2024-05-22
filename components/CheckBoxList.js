import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import CheckBox from 'react-native-check-box';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckBoxList = ({ items }) => {
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        AsyncStorage.getItem('checkedItems').then((storedCheckedItems) => {
            if (storedCheckedItems) {
                setCheckedItems(JSON.parse(storedCheckedItems));
            }
        });
    }, []);

    const handleCheckBoxChange = (item) => {
        const newCheckedItems = {
            ...checkedItems,
            [item.id]: !checkedItems[item.id]
        };

        AsyncStorage.setItem('checkedItems', JSON.stringify(newCheckedItems)).then(() => {
            setCheckedItems(newCheckedItems);
        });
    };

    return (
        <View>
            {items.map((item) => (
                <CheckBox
                    key={item.id}
                    style={{ flex: 1, marginVertical: 5 }}
                    onClick={() => handleCheckBoxChange(item)}
                    isChecked={checkedItems[item.id]}
                    rightText={item.label}
                />
            ))}
        </View>
    );
};

export default CheckBoxList;