import {View, Text, Button, TouchableOpacity} from 'react-native'
import React from 'react'
import {FIREBASE_AUTH} from "@/firebase-config";
import {Feather} from "@expo/vector-icons";
import {useRouter} from "expo-router";

const Settings = () => {

    const router = useRouter();

    return (
        <View className="flex-1 justify-center items-center mt-24">
            {/* Back Button*/}
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    position: "absolute",
                    top: 90, // adjust for your header spacing or SafeArea
                    left: 24,
                    zIndex: 999, // so it floats above
                    backgroundColor: "rgba(242,240,238,0.85)",
                    borderRadius: 999,
                    padding: 8,
                }}
            >
                <Feather name="arrow-left" size={28} color="#4D7C57" />
            </TouchableOpacity>
            <Text>Settings</Text>
            <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
        </View>
    )
}
export default Settings
