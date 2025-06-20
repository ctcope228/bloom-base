import {View, TextInput, ActivityIndicator, Button, Text, SafeAreaView, KeyboardAvoidingView} from 'react-native'
import React, {useState} from 'react'
import {FIREBASE_AUTH} from "@/firebase-config";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword} from "@firebase/auth";

const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const auth = FIREBASE_AUTH;

    const signIn = async (email: string, password: string) => {
        setLoading(true)
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log("Sign in failed: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async (email: string, password: string) => {
        setLoading(true)
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log("Sign in failed: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 justify-center items-center bg-stone-100">
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View className="flex-1 justify-center items-center">
            <Text className="text-3xl font-heading text-mypink mb-6">BloomBase</Text>
            <TextInput className="w-full bg-white rounded-xl p-4 mb-4 text-base border border-gray-300"
            placeholder="Email" placeholderTextColor="#d6d3d1"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}>
            </TextInput>
            <TextInput className="w-full bg-white rounded-xl p-4 mb-4 text-base border border-gray-300"
            secureTextEntry={true}
            placeholder="Password" placeholderTextColor="#d6d3d1"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}>
            </TextInput>
            { loading ? (
                <ActivityIndicator size="large" color="#5f8b4c" />
            ) : (
                <>
                    <Button title="Login" color="#5f8b4c" onPress={()=> signIn(email, password)} />
                    <Button title="Create account" color="#5f8b4c" onPress={()=> signUp(email, password)} />
                </>
            )}
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}
export default LoginScreen
