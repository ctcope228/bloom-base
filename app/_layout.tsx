import { useFonts } from "expo-font";
import {
    Unna_700Bold,
} from "@expo-google-fonts/unna";
import {
    Jost_400Regular,
    Jost_500Medium,
} from "@expo-google-fonts/jost";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import './globals.css';
import FlashMessage from "react-native-flash-message";

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Unna_700Bold,
        Jost_400Regular,
        Jost_500Medium,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;
    return (
        <>
        <Stack >
            <Stack.Screen
                name="index"
                options={{
                    title: 'RootNavigator',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="screens"
                options={{ headerShown: false }}
            />
        </Stack>
            <FlashMessage position="bottom" />
            </>
  )
}
