import {FlatList, Text, TouchableOpacity, View} from 'react-native'
import React from 'react'
import {FIREBASE_DB} from "@/firebase-config";
import {collection, getDocs} from "@firebase/firestore";

const FlowerList = [
    { id: '1', title: 'Sunflower', season: 'Summer'},
    { id: '2', title: 'Zinnia', season: 'Summer'},
    { id: '3', title: 'Snapdragon', season: 'Summer'},
    { id: '4', title: 'Dahlia', season: 'Summer'},
];

type FlowerCardProps = {
    title: string;
    season: string;
};

const FlowerCard = ({ title, season }: FlowerCardProps) => (
    <TouchableOpacity className="bg-stone-200 rounded-2xl w-[42%] ml-6 mt-8 p-4 h-60">
        <Text className="text-xl font-body text-mygreen">{title}</Text>
        <Text className="text-l font-body text-mygreen">Season: {season}</Text>
    </TouchableOpacity>
);

const Flowers = () => {
    const getFlowers = async () => {
        const flowersCollection = await getDocs(collection(FIREBASE_DB, "flowers"));
        console.log('flowersCollection', flowersCollection);
    }
    return (
        <View className="flex-1 bg-stone-200 items-center">
            <Text className="text-4xl mt-28 mb-4 font-bodyBold color-mygreen">My Flowers</Text>
            <FlatList
                data={FlowerList}
                renderItem={({ item }) => <FlowerCard title={item.title} season={item.season} />}
                numColumns={2}
                className="bg-stone-300 border-t border-stone-300 w-full shadow-md"
            >
            </FlatList>
        </View>
    )
}
export default Flowers