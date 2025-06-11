
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import DashboardCard from "@/components/DashboardCard";

export default function Home() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-red-50 py-8">
        <Text className="pt-20 pb-5 pl-5 text-pink-700 text-5xl font-heading">Dashboard</Text>
        <View className="flex-row flex-wrap px-5 gap-5">
            <DashboardCard
                name={"Flowers"}
                description={"View and manage flower data"}
                onPress={() => router.push("/flowers")}
            />
            <DashboardCard
                name={"Beds"}
                description={"Create and manage flower beds"}
                onPress={() => router.push("/beds")}
            />
            <DashboardCard
                name={"Products"}
                description={"Create bouquets, manage inventory and sales"}
                onPress={() => router.push("/products")}
            />
            <DashboardCard
                name={"Tasks"}
                description={"View and complete your daily tasks"}
                onPress={() => router.push("/tasks")}
            />
        </View>
    </View>
  );
}
