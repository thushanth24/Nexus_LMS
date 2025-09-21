
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/Feather';

const AdminReportsScreen = () => {
    return (
        <View style={styles.container}>
            <Icon name="archive" size={48} color={COLORS['base-300']} />
            <Text style={styles.text}>Reports</Text>
            <Text style={styles.subtext}>This feature is coming soon.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS['base-200'],
        padding: 16,
    },
    text: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '600',
        color: COLORS['text-secondary'],
    },
    subtext: {
        fontSize: 14,
        color: COLORS['text-secondary'],
    }
});

export default AdminReportsScreen;
