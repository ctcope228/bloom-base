
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useEffect, useState} from "react";
import {onAuthStateChanged, User} from "@firebase/auth";
import {FIREBASE_AUTH} from "@/firebase-config";
import LoginScreen from "@/app/screens/login";
import DashboardScreen from "@/app/screens/dashboard";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
      onAuthStateChanged(FIREBASE_AUTH, (user) => {
          console.log('user', user);
      setUser(user);
      });
  }, []);
  return (
      <Stack.Navigator initialRouteName="Login">
          {user ? (
              <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          ) :  (
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          )}
      </Stack.Navigator>
  );
}
