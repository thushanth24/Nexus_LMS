
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Feather } from '@expo/vector-icons';

const TeacherSessionScreen = () => {
    return (
        <View style={styles.container}>
            <Feather name="video" size={48} color={COLORS['base-300']} />
            <Text style={styles.text}>Live Session</Text>
            <Text style={styles.subtext}>Video conferencing and interactive tools would appear here.</Text>
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
        textAlign: 'center'
    },
    subtext: {
        fontSize: 14,
        color: COLORS['text-secondary'],
        textAlign: 'center'
    }
});

export default TeacherSessionScreen;

