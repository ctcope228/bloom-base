import {Image, Text, TouchableOpacity, View} from 'react-native'
import React from "react";

interface Props {
    common_name?: string;
    scientific_name?: string;
    default_image?: {medium_url?: string; thumbnail?: string} | null;
    onPress: () => void;
}

const FlowerCard: React.FC<Props> = ({
    common_name,
    scientific_name,
    default_image,
    onPress,
}) => {

    const name = common_name ?? "Unknown flower";
    const scientificName = scientific_name ?? "Unknown flower";
    const thumb = default_image?.thumbnail;

    return (
            <TouchableOpacity
                onPress={onPress}
                className="bg-stone-200 rounded-2xl ml-6 mt-8 w-[42%] h-60 p-4"
            >
                <Text className="capitalize text-xl font-body text-mygreen">{name}</Text>
                {scientific_name && <Text className="capitalize text-md font-body text-stone-400">{scientificName}</Text>}
                {thumb ? (
                    <Image
                        source={{ uri: thumb }}
                        className="w-full h-28 mt-2 rounded-lg"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-28 mt-2 rounded-lg bg-stone-300 items-center justify-center">
                        <Text className="text-gray-500">No image</Text>
                    </View>
                )}
            </TouchableOpacity>
    )
}
export default FlowerCard
