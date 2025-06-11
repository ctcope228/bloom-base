import {Text, TouchableOpacity} from 'react-native'
import React from 'react'

interface Props {
    name: string;
    description: string;
    onPress: () => void;
}

const DashboardCard = ({name, description, onPress}: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-stone-200 gap-2 p-5 rounded-xl shadow-sm w-[47%] h-[275px]"
        >
            <Text className="text-3xl font-bodyBold text-mygreen">{name}</Text>
            <Text className="text-xl font-body text-stone-500">{description}</Text>
        </TouchableOpacity>

    )
}
export default DashboardCard
