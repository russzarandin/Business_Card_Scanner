import React from 'react';
import { FloatingAction } from 'react-native-floating-action';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import  { useDarkMode } from '@/contexts/DarkModeContext';


const FloatingActionButton = ({ onAddManualLink, openPicker }) => {
    const { themeColors } = useDarkMode();
    const actions = [
        {
            text: 'Add Link from Options',
            icon: <MaterialCommunityIcons name='format-list-bulleted' size={24} color={themeColors.text} />,
            name: 'add_link_option',
            position: 1
        },
        {
            text: 'Add Manual Link',
            icon: <MaterialCommunityIcons name='link-plus' size={24} color={themeColors.text} />,
            name: 'add_manual_link',
            position: 2
        },
    ];

    return (
        <FloatingAction
            actions={actions}
            onPressItem={(name) => {
                if (name === 'add_link_option') {
                    openPicker();
                } else if (name === 'add_manual_link') {
                    onAddManualLink();
                }
            }}
            color={themeColors.accent}
        />
    );
};

export default FloatingActionButton;