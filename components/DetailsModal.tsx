import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    Button, Animated,
} from 'react-native';
import {Flower} from '@/types/flower';
import ScrollView = Animated.ScrollView;

interface Props {
    visible: boolean;
    flower?: Flower;
    onEdit?: (flower: Flower) => void;
    onDelete?: (id: string | undefined) => void;
    onSave?: ()  => void;
    onClose: () => void;
}

export default function DetailsModal({
                                                visible,
                                                flower,
                                                onEdit,
                                                onDelete,
                                                onSave,
                                                onClose,
                                           }: Props) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-stone-300 rounded-2xl p-6 w-3/4 max-h-screen-safe">
                    <Text className="text-2xl font-bodyBold text-mygreen mb-2 capitalize">
                        {flower?.common_name}
                    </Text>
                    {flower?.scientific_name && (
                        <Text className="font-body text-stone-500 mb-2 capitalize">
                            {flower?.scientific_name}
                        </Text>
                    )}
                    {flower?.default_image?.thumbnail && (
                        <Image
                            source={{ uri: flower?.default_image.thumbnail }}
                            className="w-full h-40 rounded-lg mb-4"
                            resizeMode="cover"
                        />
                    )}
                    <ScrollView
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={true}
                        className="max-h-fit overflow-hidden"
                    >
                    <Text className="font-body text-stone-500 mb-1">
                        Season: {flower?.flowering_season}
                    </Text>
                    <Text className="font-body text-stone-500 mb-1">
                        Cycle: {flower?.cycle}
                    </Text>
                    <Text className="font-body text-stone-500 mb-1">
                        Watering: {flower?.watering}
                    </Text>
                    <Text className="font-body text-stone-500 mb-1">
                        Sunlight: {flower?.sunlight}
                    </Text>
                    {flower?.hardiness?.max != null && (
                        <Text className="font-body text-stone-500 mb-1">
                            Hardiness: {flower?.hardiness.min} – {flower.hardiness.max}
                        </Text>
                    )}
                    {flower?.description && (
                        <Text className="font-body text-stone-500 mb-1">
                            {flower?.description}
                        </Text>
                    )}
                    </ScrollView>

                    <View className="flex-row justify-center space-x-2 mt-4">
                        {onEdit!! &&
                            <Button title="Edit" onPress={() => onEdit!(flower!)} color="#5f8b4c" />
                        }
                        {onDelete!! &&
                            <Button title="Delete" onPress={() => onDelete!(flower?.id)} color="#d9534f" />
                        }
                        {onSave!! &&
                            <Button title="Save" color="#5f8b4c" onPress={() => onSave!()} />
                        }
                        <Button title="Close" onPress={onClose} color="#5f8b4c" />
                    </View>
                </View>
            </View>
        </Modal>
    );
}
