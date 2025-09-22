
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = useAuth();

    const handleSubmit = () => {
        if (!auth.login(email)) {
            Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS['base-200']} />
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Nexus LMS</Text>
                <Text style={styles.subtitle}>Welcome back! Please sign in.</Text>

                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={COLORS['text-secondary']}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={COLORS['text-secondary']}
                    />
                    <Button title="Sign In" onPress={handleSubmit} />
                </View>
                
                <View style={styles.demoLoginContainer}>
                    <Text style={styles.demoText}>Demo Logins:</Text>
                    <Text style={styles.demoLink} onPress={() => setEmail('admin@inst.com')}>Admin</Text>
                    <Text style={styles.demoLink} onPress={() => setEmail('teacher@inst.com')}>Teacher</Text>
                    <Text style={styles.demoLink} onPress={() => setEmail('student@inst.com')}>Student</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS['base-200'],
        justifyContent: 'center',
    },
    innerContainer: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS['text-secondary'],
        textAlign: 'center',
        marginBottom: 32,
    },
    card: {
        backgroundColor: COLORS['base-100'],
        borderRadius: 16,
        padding: 24,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    input: {
        height: 50,
        borderColor: COLORS['base-300'],
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: COLORS.white,
        fontSize: 16,
        color: COLORS['text-primary']
    },
    demoLoginContainer: {
        marginTop: 24,
        alignItems: 'center'
    },
    demoText: {
        color: COLORS['text-secondary'],
        marginBottom: 8
    },
    demoLink: {
        color: COLORS.primary,
        fontWeight: '600',
        paddingVertical: 4
    }
});

export default LoginPage;
