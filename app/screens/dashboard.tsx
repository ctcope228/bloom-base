import {View, Text} from 'react-native'
import React from 'react'
import {useRouter} from "expo-router";
import DashboardCard from "@/components/DashboardCard";

function DashboardScreen() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-red-50 py-8">
            <Text className="mt-24 mb-5 ml-5 text-pink-700 text-5xl font-heading">Dashboard</Text>
            <View className="flex-row flex-wrap px-5 gap-6">
                <DashboardCard
                    name={"Beds"}
                    description={"Plant and manage flower beds"}
                    onPress={() => router.push("/screens/beds")}
                />
                <DashboardCard
                    name={"Growroom"}
                    description={"Sow seeds"}
                    onPress={() => router.push("/screens/growroom")}
                />
                <DashboardCard
                    name={"Flowers"}
                    description={"View and manage flower data"}
                    onPress={() => router.push("/screens/flowers")}
                />
                <DashboardCard
                    name={"Products"}
                    description={"Create bouquets, manage inventory and sales"}
                    onPress={() => router.push("/screens/products")}
                />
                <DashboardCard
                    name={"Settings"}
                    description={"Manage account, preferences and permissions"}
                    onPress={() => router.push("/screens/settings")}
                />
                <DashboardCard
                    name={"Tasks"}
                    description={"View and complete your daily tasks"}
                    onPress={() => router.push("/screens/tasks")}
                />
            </View>
        </View>
    )
}

export default DashboardScreen
