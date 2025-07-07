import {View, Text, ActivityIndicator, FlatList, Button, Modal, Image, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import FlowerSearchBar from "@/components/FlowerSearchBar";
import FlowerCard from "@/components/FlowerCard";
import {useFetch} from "@/services/usefetch"
import {fetchFlowerDetails, fetchFlowerList, FlowerDetail} from "@/services/api";
import {addDoc, collection} from "@firebase/firestore";
import {FIREBASE_DB} from "@/firebase-config";
import { showMessage } from "react-native-flash-message";
import {Feather} from "@expo/vector-icons";

function Icon(props: { name: string, size: number, color: string }) {
    return null;
}

const Search = () => {
    const [query, setQuery]           = useState("");
    const [detail, setDetail]         = useState<FlowerDetail | null>(null);

    // 1) set autoFetch=false so it waits for us to call refetch()
    const {
        data: results = [],
        loading: listLoading,
        error:  listError,
        refetch: loadResults,
        reset:   resetResults,
    } = useFetch(() => fetchFlowerList(query), false);

    useEffect(() => {
        console.log("🌸 Search results for", query, "=>", results);
    }, [results]);

    // 2) Debounce typing → loadResults() or resetResults()
    useEffect(() => {
        const t = setTimeout(() => {
            if (query.trim()) loadResults();
            else             resetResults();
        }, 500);
        return () => clearTimeout(t);
    }, [query]);

    // 3) Imperative detail fetch on card press
    const openDetail = async (id: number) => {
        try {
            const d = await fetchFlowerDetails(id);
            setDetail(d);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async ()  => {
        try {
            if (detail?.common_name) {
                await addDoc(collection(FIREBASE_DB, 'flowers'), detail);

                showMessage({
                    message: "Saved",
                    type: "success",
                    duration: 2000,
                    color: "#5F8B4C",
                    backgroundColor: "rgba(0,0,0,0.0)",
                    titleStyle: {
                        textAlign: "center",
                        fontSize: 18,
                    },
                });

                setDetail(null);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not save flower');
        }
    }

    return (
        <View className="flex-1 bg-stone-200 items-center">
            <Text className="text-4xl mt-28 mb-4 font-bodyBold color-mygreen">
                Flower Search
            </Text>

            <FlowerSearchBar
                placeholder={"Search"}
                value={query}
                onChangeText={setQuery}
                onSearch={() => loadResults()}>
            </FlowerSearchBar>

            {listLoading && <ActivityIndicator />}
            {listError && <Text>Error: {listError.message}</Text>}

            <FlatList
                className="bg-stone-300 w-full shadow-md"
                numColumns={2}
                data={results}
                keyExtractor={f => f.id.toString()}
                renderItem={({ item }) => (
                    <FlowerCard
                        {...item}
                        onPress={() => openDetail(item.id)}
                    />
                )}
            />

            <Modal visible={!!detail} animationType="slide" transparent>
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-stone-300 rounded-2xl p-6 w-3/4">

                        <Text className="capitalize text-2xl font-bodyBold text-mygreen mb-2">
                            {detail?.common_name}
                        </Text>
                        {detail?.default_image && <Image
                            source={{ uri: detail?.default_image.medium_url }}
                            className="h-48 w-full mb-4 rounded-lg"
                        />}
                        <Text className="font-body text-stone-600 mb-1">Season: {detail?.flowering_season}</Text>
                        <Text className="font-body text-stone-600 mb-1">Cycle: {detail?.cycle}</Text>
                        <Text className="font-body text-stone-600 mb-1">Watering: {detail?.watering}</Text>
                        <Text className="font-body text-stone-600 mb-1">Sunlight: {detail?.sunlight}</Text>
                        {detail?.hardiness && <Text className="font-body text-stone-600 mb-1">Hardiness: Min: {detail?.hardiness.min}, Max: {detail?.hardiness.max}</Text>}
                        <Text className="font-body text-stone-600 mb-1">Description: {detail?.description}</Text>

                        <View className="flex-row justify-between mt-4">
                            <Button title="Close" color="#5f8b4c" onPress={() => setDetail(null)} />

                            <Button title="Save" color="#5f8b4c" onPress={handleSave} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
export default Search
