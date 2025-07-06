
import React from 'react'
import {Stack} from "expo-router";

const _Layout = () => {
    return (
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
    )
}
export default _Layout
