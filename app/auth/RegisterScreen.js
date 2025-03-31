import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function RegisterScreen() {
    const { signUp } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { themeColors } = useDarkMode();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Please fill in all fields.');
            return;
        }
        try {
            await signUp(name, email, password);
            Alert.alert('Registration Successful!');
            router.push('/(tabs)/settings')
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Register</Text>
            <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder='Full name'
                placeholderTextColor={themeColors.text}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder='Email'
                placeholderTextColor={themeColors.text}
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
            />
            <TextInput
                style={[styles.input, { color:themeColors.text }]}
                placeholder='Password'
                placeholderTextColor={themeColors.text}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            
            <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]} onPress={handleRegister}>
                <Text style={[styles.buttonText, { color: themeColors.text }]}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/LoginScreen')}>
                <Text style={[styles.link, { color: themeColors.accent }]}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        marginBottom: 20
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8, 
        marginBottom: 15
    },
    button: {
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16
    },
    link: {
        marginTop: 15,
        fontSize: 14
    }
});