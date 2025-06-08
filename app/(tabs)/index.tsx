import { Text, View } from "react-native";
import {Link} from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-5xl text-pink font-bold">BloomBase</Text>
        <Link href="/beds">Beds</Link>
        <Link href="/plants">Plants</Link>
        <Link href="/tasks">Tasks</Link>
        <Link href="/bouquets">Bouquets</Link>
    </View>
  );
}
