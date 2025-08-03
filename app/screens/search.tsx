import {View, Text, ActivityIndicator, FlatList, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import FlowerSearchBar from "@/components/FlowerSearchBar";
import FlowerCard from "@/components/FlowerCard";
import {useFetch} from "@/services/usefetch"
import {fetchFlowerDetails, fetchFlowerList} from "@/services/api";
import {addDoc, collection} from "@firebase/firestore";
import {FIREBASE_DB} from "@/firebase-config";
import { showMessage } from "react-native-flash-message";
import {Flower} from "@/types/flower";
import DetailsModal from "@/components/DetailsModal";

const Search = () => {
    const [query, setQuery]           = useState("");
    const [detail, setDetail]         = useState<Flower | null>(null);

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

    useEffect(() => {
        const t = setTimeout(() => {
            if (query.trim()) loadResults();
            else             resetResults();
        }, 500);
        return () => clearTimeout(t);
    }, [query]);

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

            <DetailsModal
                visible={!!detail}
                flower={detail!}
                onClose={() => setDetail(null)}
                onSave={handleSave}
            ></DetailsModal>
        </View>
    )
}
export default Search
