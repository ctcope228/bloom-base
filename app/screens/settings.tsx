import {View, Text, Button} from 'react-native'
import React from 'react'
import {FIREBASE_AUTH} from "@/firebase-config";

const Settings = () => {
    return (
        <View className="flex-1 justify-center items-center mt-24">
            <Text>Settings</Text>
            <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
        </View>
    )
}
export default Settings
