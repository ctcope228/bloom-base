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
import {router, useRouter} from 'expo-router';
import {Feather} from "@expo/vector-icons";
import {Flower, FlowerForm} from "@/types/flower";
import DetailsModal from "@/components/DetailsModal";

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

const Flowers = () => {
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState<FlowerForm>(initialForm);
    const [loadingList, setLoadingList] = useState(false);

    const router = useRouter();

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

    const deleteFlower = async (id: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, 'flowers', id));
            await getFlowers();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not delete flower');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets.length > 0) {
            setForm({ ...form, localImageUri: result.assets[0].uri });
        }
    };

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
                await updateDoc(doc(FIREBASE_DB, 'flowers', form.id), dataToSave);
            } else {
                const docRef = await addDoc(collection(FIREBASE_DB, 'flowers'), dataToSave);
                form.id = docRef.id;
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

            {/* Back Button*/}
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    position: "absolute",
                    top: 90, // adjust for your header spacing or SafeArea
                    left: 24,
                    zIndex: 999, // so it floats above
                    backgroundColor: "rgba(242,240,238,0.85)",
                    borderRadius: 999,
                    padding: 8,
                }}
            >
                <Feather name="arrow-left" size={28} color="#4D7C57" />
            </TouchableOpacity>

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
                    className="bg-stone-300 w-full shadow-inner"
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

            <DetailsModal
                visible={!!selectedFlower}
                flower={selectedFlower!}
                onEdit={() => openEditForm(selectedFlower!)}
                onDelete={() => deleteFlower(selectedFlower!.id)}
                onClose={() => setSelectedFlower(null)}
            ></DetailsModal>

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
                        <View className="flex-wrap flex-row justify-around bg-stone-300 rounded-2xl p-6 w-full">
                            <Text className="w-full text-2xl font-bodyBold text-center m-2 mb-6 text-mygreen">
                                {form.id ? 'Edit Flower' : 'Add New Flower'}
                            </Text>

                            {!form.id &&
                            <TouchableOpacity
                                className="flex-row mb-4 p-2 px-4 gap-2 rounded-xl bg-stone-200"
                                onPress={() => {
                                    router.push('/screens/search');
                                    setModalVisible(false);
                                }}
                            >
                                <Text className="text-mygreen font-body text-xl">
                                    Search
                                </Text>
                                <Feather name="search" size={23} color="#5f8b4c" />
                            </TouchableOpacity>
                        }

                            <Text className="text-xl mb-5 font-body text-center text-mygreen w-full">
                                Manual Entry
                            </Text>

                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Name"
                                placeholderTextColor="#a8a29e"
                                value={form.common_name}
                                onChangeText={(text) =>
                                    setForm({ ...form, common_name: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Alternate Name"
                                placeholderTextColor="#a8a29e"
                                value={form.scientific_name}
                                onChangeText={(text) =>
                                    setForm({ ...form, scientific_name: text })
                                }
                            />

                            <TouchableOpacity
                                onPress={pickImage}
                                className="mb-4 items-center w-full"
                            >
                                {form.localImageUri ? (
                                    <Image
                                        source={{ uri: form.localImageUri }}
                                        style={{ width: 100, height: 100 }}
                                    />
                                ) : (
                                    <View className="bg-stone-200 rounded-xl p-4 w-[95%]">
                                        <Text className="text-center text-stone-400">Image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Season"
                                placeholderTextColor="#a8a29e"
                                value={form.flowering_season}
                                onChangeText={(text) =>
                                    setForm({ ...form, flowering_season: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Cycle"
                                placeholderTextColor="#a8a29e"
                                value={form.cycle}
                                onChangeText={(text) => setForm({ ...form, cycle: text })}
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Watering"
                                placeholderTextColor="#a8a29e"
                                value={form.watering}
                                onChangeText={(text) =>
                                    setForm({ ...form, watering: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Sunlight"
                                placeholderTextColor="#a8a29e"
                                value={form.sunlight}
                                onChangeText={(text) =>
                                    setForm({ ...form, sunlight: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Hardiness Min"
                                placeholderTextColor="#a8a29e"
                                keyboardType="numeric"
                                value={form.hardinessMin}
                                onChangeText={(text) =>
                                    setForm({ ...form, hardinessMin: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[45%]"
                                placeholder="Hardiness Max"
                                placeholderTextColor="#a8a29e"
                                keyboardType="numeric"
                                value={form.hardinessMax}
                                onChangeText={(text) =>
                                    setForm({ ...form, hardinessMax: text })
                                }
                            />
                            <TextInput
                                className="bg-stone-200 p-3 mb-4 rounded-xl w-[95%] h-20"
                                placeholder="Description"
                                placeholderTextColor="#a8a29e"
                                value={form.description}
                                onChangeText={(text) =>
                                    setForm({ ...form, description: text })
                                }
                            />

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
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default Flowers;