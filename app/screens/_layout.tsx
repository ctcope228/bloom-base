import {Stack} from "expo-router";
import FlashMessage from "react-native-flash-message";
import React from "react";

const _Layout = () => {
    return (
        <>
        <Stack>
            <Stack.Screen
                name="flowers"
                options={{
                    title: 'Flowers',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="search"
                options={{
                    title: 'Search',
                    headerShown: false,
                }}
            />
        </Stack>
        <FlashMessage position="bottom" />
        </>
    )
}
export default _Layout
