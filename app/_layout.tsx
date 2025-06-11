import { useFonts } from "expo-font";
import {
    Unna_700Bold,
} from "@expo-google-fonts/unna";
import {
    Jost_400Regular,
    Jost_500Medium,
} from "@expo-google-fonts/jost";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Stack } from "expo-router";
import './globals.css';

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
      <Stack >
          <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
          />
      </Stack>
  )
}
