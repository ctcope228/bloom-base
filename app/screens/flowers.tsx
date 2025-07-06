import React, { useState, useEffect } from 'react';
import {
    FlatList,
    Text,
    View,
    Modal,
    TextInput,
    TouchableOpacity,
    Button,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { FIREBASE_DB } from '@/firebase-config';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
} from '@firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FlowerCard from '@/components/FlowerCard';
import { router } from 'expo-router';

//
// ─── TYPES ─────────────────────────────────────────────────────────────────────
//

interface Flower {
    id: string;
    common_name?: string;
    scientific_name?: string;
    cycle?: string;
    watering?: string;
    sunlight?: string | string[];
    hardiness?: { min: number; max: number };
    flowering_season?: string;
    description?: string;
    default_image?: { thumbnail: string; medium_url: string };
}

// form state: all strings, so it maps 1:1 to TextInputs
type FlowerForm = {
    id: string;
    common_name: string;
    scientific_name: string;
    cycle: string;
    watering: string;
    sunlight: string;
    flowering_season: string;
    description: string;
    hardinessMin: string;
    hardinessMax: string;
    localImageUri: string | null;
};

const initialForm: FlowerForm = {
    id: '',
    common_name: '',
    scientific_name: '',
    cycle: '',
    watering: '',
    sunlight: '',
    flowering_season: '',
    description: '',
    hardinessMin: '',
    hardinessMax: '',
    localImageUri: null,
};

//
// ─── COMPONENT ────────────────────────────────────────────────────────────────
//

const Flowers = () => {
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState<FlowerForm>(initialForm);
    const [loadingList, setLoadingList] = useState(false);

    // ── Fetch all flowers ───────────────────────────────────────────────────────
    const getFlowers = async () => {
        setLoadingList(true);
        try {
            const snap = await getDocs(collection(FIREBASE_DB, 'flowers'));
            const list: Flower[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Flower, 'id'>),
            }));
            setFlowers(list);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not load flowers');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        getFlowers();
    }, []);

    // ── Delete a flower ─────────────────────────────────────────────────────────
    const deleteFlower = async (id: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, 'flowers', id));
            await getFlowers();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not delete flower');
        }
    };

    // ── Pick an image ───────────────────────────────────────────────────────────
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            setForm({ ...form, localImageUri: result.assets[0].uri });
        }
    };

    // ── Helpers to open the add/edit modal ─────────────────────────────────────
    const openAddForm = () => {
        setForm(initialForm);
        setModalVisible(true);
    };

    const openEditForm = (f: Flower) => {
        setForm({
            id: f.id,
            common_name: f.common_name ?? '',
            scientific_name: f.scientific_name ?? '',
            cycle: f.cycle ?? '',
            watering: f.watering ?? '',
            sunlight: Array.isArray(f.sunlight) ? f.sunlight.join(', ') : f.sunlight ?? '',
            flowering_season: f.flowering_season ?? '',
            description: f.description ?? '',
            hardinessMin: f.hardiness?.min.toString() ?? '',
            hardinessMax: f.hardiness?.max.toString() ?? '',
            localImageUri: null,
        });
        setModalVisible(true);
    };

    // ── Save (add or update) ───────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.common_name.trim()) {
            return Alert.alert('Validation', 'Please enter a name');
        }

        // build payload
        const dataToSave: any = {
            common_name: form.common_name,
            scientific_name: form.scientific_name,
            cycle: form.cycle,
            watering: form.watering,
            sunlight: form.sunlight,
            flowering_season: form.flowering_season,
            description: form.description,
            hardiness: {
                min: Number(form.hardinessMin),
                max: Number(form.hardinessMax),
            },
        };

        try {
            // upload image if any
            if (form.localImageUri) {
                const storage = getStorage();
                const imgRef = ref(storage, `flowers/${Date.now()}-img.jpg`);
                const resp = await fetch(form.localImageUri);
                const blob = await resp.blob();
                await uploadBytes(imgRef, blob);
                const url = await getDownloadURL(imgRef);
                dataToSave.default_image = { medium_url: url, thumbnail: url };
            }

            if (form.id) {
                // update
                await updateDoc(doc(FIREBASE_DB, 'flowers', form.id), dataToSave);
            } else {
                // add new
                const docRef = await addDoc(collection(FIREBASE_DB, 'flowers'), dataToSave);
                form.id = docRef.id; // so if you stayed open you’d see the new ID
            }

            await getFlowers();
            setModalVisible(false);
            setForm(initialForm);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not save flower');
        }
    };

    return (
        <View className="flex-1 bg-stone-200 items-center">
            <Text className="text-4xl mt-28 mb-4 font-bodyBold color-mygreen">
                My Flowers
            </Text>

            {loadingList ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={flowers}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    className="bg-stone-300 border-t border-stone-300 w-full shadow-md"
                    renderItem={({ item }) => (
                        <FlowerCard
                            common_name={item.common_name}
                            scientific_name={item.scientific_name}
                            default_image={item.default_image}
                            onPress={() => setSelectedFlower(item)}
                        />
                    )}
                />
            )}

            {/* ── Details Modal ─────────────────────────────────────────── */}
            <Modal visible={!!selectedFlower} transparent animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-stone-300 rounded-2xl p-6 w-3/4">
                        <Text className="text-2xl font-bodyBold text-mygreen">
                            {selectedFlower?.common_name}
                        </Text>
                        <Text className="font-body text-stone-500 mb-2">
                            {selectedFlower?.scientific_name}
                        </Text>
                        {selectedFlower?.default_image &&
                            <Image
                               source={{ uri: selectedFlower?.default_image?.thumbnail }}
                               className="w-full h-40 mt-2 rounded-lg mb-2"
                              resizeMode="cover"
                            />
                        }
                        <Text className="font-body text-stone-500 mb-1">
                            Season: {selectedFlower?.flowering_season}
                        </Text>
                        <Text className="font-body text-stone-500 mb-1">
                            Cycle: {selectedFlower?.cycle}
                        </Text>
                        <Text className="font-body text-stone-500 mb-1">
                            Watering: {selectedFlower?.watering}
                        </Text>
                        <Text className="font-body text-stone-500 mb-1">
                            Sunlight: {selectedFlower?.sunlight}
                        </Text>
                        {selectedFlower?.hardiness && selectedFlower?.hardiness?.max > 0 &&
                            <Text className="font-body text-stone-500 mb-1">
                                Hardiness: Min: {selectedFlower?.hardiness.min} Max: {selectedFlower?.hardiness.max}
                            </Text>
                        }
                        <Text className="font-body text-stone-500 mb-1">
                            Description: {selectedFlower?.description}
                        </Text>


                        <View className="flex-row justify-center mt-4 space-x-2">
                            <Button
                                title="Edit"
                                color="#5f8b4c"
                                onPress={() => {
                                    openEditForm(selectedFlower!);
                                    setSelectedFlower(null);
                                }}
                            />
                            <Button
                                title="Delete"
                                color="#d9534f"
                                onPress={async () => {
                                    await deleteFlower(selectedFlower!.id);
                                    setSelectedFlower(null);
                                }}
                            />
                            <Button
                                title="Close"
                                color="#5f8b4c"
                                onPress={() => setSelectedFlower(null)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Add/Edit Form Modal ───────────────────────────────────── */}
            <TouchableOpacity
                onPress={openAddForm}
                className="absolute bottom-12 right-10 bg-mygreen w-20 h-20 rounded-full items-center justify-center shadow-lg"
            >
                <Text className="text-white text-4xl">+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 justify-center items-center bg-black/50 px-6">
                        <View className="bg-stone-300 rounded-xl p-6 w-full">
                            <Text className="text-xl font-bodyBold text-center mb-4 text-mygreen">
                                {form.id ? 'Edit Flower' : 'Add New Flower'}
                            </Text>

                            <View className="p-2 rounded-full">
                                <Button
                                    title="Search"
                                    color="#5f8b4c"
                                    onPress={() => {
                                        router.push('/screens/search');
                                        setModalVisible(false);
                                    }}
                                />
                            </View>

                            <Text className="text-lg mb-5 font-body text-center text-mygreen">
                                Or
                            </Text>

                            <TextInput
                                className="bg-stone-200 p-3 mb-2 rounded-lg"
                                placeholder="Name"
                                placeholderTextColor="#a8a29e"
                                value={form.common_name}
                                onChangeText={(text) =>
                                    setForm({ ...form, common_name: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-2 rounded-lg"
                                placeholder="Alternate Name"
                                placeholderTextColor="#a8a29e"
                                value={form.scientific_name}
                                onChangeText={(text) =>
                                    setForm({ ...form, scientific_name: text })
                                }
                            />

                            <TouchableOpacity
                                onPress={pickImage}
                                className="mb-4 items-center"
                            >
                                {form.localImageUri ? (
                                    <Image
                                        source={{ uri: form.localImageUri }}
                                        style={{ width: 100, height: 100 }}
                                    />
                                ) : (
                                    <Text>Select Image</Text>
                                )}
                            </TouchableOpacity>

                            <TextInput
                                className="bg-stone-200 p-3 mb-2 rounded-lg"
                                placeholder="Season"
                                placeholderTextColor="#a8a29e"
                                value={form.flowering_season}
                                onChangeText={(text) =>
                                    setForm({ ...form, flowering_season: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-2 rounded-lg"
                                placeholder="Cycle"
                                placeholderTextColor="#a8a29e"
                                value={form.cycle}
                                onChangeText={(text) => setForm({ ...form, cycle: text })}
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-2 rounded-lg"
                                placeholder="Watering"
                                placeholderTextColor="#a8a29e"
                                value={form.watering}
                                onChangeText={(text) =>
                                    setForm({ ...form, watering: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-2 rounded-lg"
                                placeholder="Sunlight"
                                placeholderTextColor="#a8a29e"
                                value={form.sunlight}
                                onChangeText={(text) =>
                                    setForm({ ...form, sunlight: text })
                                }
                            />

                            <View className="flex-row justify-between space-x-2">
                                <TextInput
                                    className="bg-stone-200 p-3 mb-2 flex-1 rounded-lg"
                                    placeholder="Hardiness Min"
                                    placeholderTextColor="#a8a29e"
                                    keyboardType="numeric"
                                    value={form.hardinessMin}
                                    onChangeText={(text) =>
                                        setForm({ ...form, hardinessMin: text })
                                    }
                                />
                                <TextInput
                                    className="bg-stone-200 p-3 mb-2 flex-1 rounded-lg"
                                    placeholder="Hardiness Max"
                                    placeholderTextColor="#a8a29e"
                                    keyboardType="numeric"
                                    value={form.hardinessMax}
                                    onChangeText={(text) =>
                                        setForm({ ...form, hardinessMax: text })
                                    }
                                />
                            </View>

                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-lg"
                                placeholder="Description"
                                placeholderTextColor="#a8a29e"
                                value={form.description}
                                onChangeText={(text) =>
                                    setForm({ ...form, description: text })
                                }
                            />

                            <View className="flex-row justify-between">
                                <Button
                                    title="Cancel"
                                    color="#5f8b4c"
                                    onPress={() => {
                                        setModalVisible(false);
                                        setForm(initialForm);
                                    }}
                                />
                                <Button title="Save" color="#5f8b4c" onPress={handleSave} />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default Flowers;