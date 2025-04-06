import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import LinkCardItem from './LinkCardItem';

const DraggableLinkList = ({ links, onChange, themeColors }) => {
    
    const handleChangeText = (id, text) => {
        const newLinks = links.map(link => {
            return link.id === id ? { ...link, url: text } : link
        });
    onChange(newLinks);
    };

    const handleRemove = (id) => {
        const newLinks = links.filter(link => link.id !== id);
        onChange(newLinks);
    };

    const handleDragEnd = ({ data }) => {
        onChange(data);
    };

    const renderItem = ({ item, drag, isActive }) => (
        <LinkCardItem
            link={item}
            onChangeText={(text) => handleChangeText(item.id, text)}
            onRemove={() => handleRemove(item.id)}
            onDrag={drag}
            isActive={isActive}
            themeColors={themeColors}
        />
    );

    return (
        <View style={styles.container}>
            <DraggableFlatList
                data={links}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onDragEnd={handleDragEnd}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20
    }
});

export default DraggableLinkList;