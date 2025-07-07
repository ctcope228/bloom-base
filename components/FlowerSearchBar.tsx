import React from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    TextInputProps,
    StyleProp,
    ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props extends Pick<TextInputProps, "placeholder" | "value" | "onChangeText"> {
    onSearch?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
}

const FlowerSearchBar: React.FC<Props> = ({
                                              placeholder,
                                              value,
                                              onChangeText,
                                              onSearch,
                                              containerStyle,
                                          }) => {
    return (
        <View
            className="flex-row items-center justify-center bg-dark-200 rounded-full px-4 py-2"
            style={containerStyle}
        >
            {/* Search icon */}
            <TouchableOpacity
                onPress={onSearch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Search"
            >
                <Feather name="search" size={20} color="#5F8B4C" />
            </TouchableOpacity>

            {/* Text input */}
            <TextInput
                className="flex-1 ml-2 text-mygreen"
                placeholder={placeholder}
                placeholderTextColor="#5f8b4c"
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                onSubmitEditing={onSearch}
                autoCorrect={false}
                clearButtonMode="never"
            />

            {/* Clear-text button, only if there’s text */}
            {value?.length ? (
                <TouchableOpacity
                    onPress={() => onChangeText?.("")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel="Clear text"
                >
                    <Feather name="x" size={20} color="#5F8B4C" />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default FlowerSearchBar;