import {Stack, useRouter} from "expo-router";
import FlashMessage from "react-native-flash-message";
import React from "react";
import {TouchableOpacity} from "react-native";
import {Feather} from "@expo/vector-icons";

const router = useRouter();

const _Layout = () => {
    return (
        <>
        <Stack>
            <Stack.Screen
                name="flowers"
                options={{
                    title: 'Flowers',
                    headerShown: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
                            <Feather name="arrow-left" size={24} color="#4D7C57" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="search"
                options={{
                    title: 'Search',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="beds"
                options={{
                    title: 'Beds',
                    headerShown: false,
                }}
            />
        </Stack>
        <FlashMessage position="bottom" />
        </>
    )
}
export default _Layout
