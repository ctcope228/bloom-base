import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_DB } from '@/firebase-config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PlantableFlower } from '@/types/flower';
import {useRouter} from "expo-router";

const hashToPastelColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 85%)`;
};

type Field = {
    id: string;
    name: string;
    rows?: number;
    cols?: number;
    grid?: GridCell[];
};

type GridCell = {
    row: number;
    col: number;
    flowerId: string | null;
    plantedAt?: number | null;
};

type ModalState = {
    field: Field;
    flowers: PlantableFlower[];
    grid: GridCell[][];
} | null;

const Beds = () => {
    const [fields, setFields] = useState<Field[]>([]);
    const [inputModalVisible, setInputModalVisible] = useState(false);
    const [fieldName, setFieldName] = useState('');
    const [rows, setRows] = useState('');
    const [cols, setCols] = useState('');
    const [flowers, setFlowers] = useState<PlantableFlower[]>([]);
    const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);
    const [modalState, setModalState] = useState<ModalState>(null);
    const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const router = useRouter();

    const getFields = async () => {
        const snapshot = await getDocs(collection(FIREBASE_DB, 'fields'));
        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
        }));
        setFields(list);
    };

    const getFlowers = async () => {
        const snapshot = await getDocs(collection(FIREBASE_DB, "flowers"));
        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
        }));
        setFlowers(list);
    };

    useEffect(() => {
        getFields();
        getFlowers();
    }, []);

    const addField = async () => {
        const rowCount = parseInt(rows);
        const colCount = parseInt(cols);

        if (!fieldName.trim() || isNaN(rowCount) || isNaN(colCount) || rowCount <= 0 || colCount <= 0) {
            Alert.alert('Error', 'Please enter a name and valid row/column values.');
            return;
        }

        try {
            const grid = [];
            for (let row = 0; row < rowCount; row++) {
                for (let col = 0; col < colCount; col++) {
                    grid.push({ row, col, flowerId: null });
                }
            }

            await addDoc(collection(FIREBASE_DB, 'fields'), {
                name: fieldName,
                rows: rowCount,
                cols: colCount,
                grid,
            });

            setFieldName('');
            setRows('');
            setCols('');
            setInputModalVisible(false);
            await getFields(); // refresh
        } catch (error: any) {
            console.error('Error adding field:', error);
            alert(`Error adding field:\n${error.message}`);
        }
    };

    const deleteField = async (fieldId: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, 'fields', fieldId));
            setFieldToDelete(null);
            await getFields();
        } catch (error: any) {
            console.error('Error deleting field:', error);
        }
    };

    const openFieldModal = async (field: Field) => {
        const rowCount = field.rows ?? 5;
        const colCount = field.cols ?? 5;

        const snapshot = await getDocs(collection(FIREBASE_DB, "flowers"));
        const flowerList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
        }));

        const flatGrid: GridCell[] = Array.isArray(field.grid) ? field.grid : [];
        const newGrid: GridCell[][] = Array.from({ length: rowCount }, (_, row) =>
            Array.from({ length: colCount }, (_, col) => {
                const match = flatGrid.find(cell => cell.row === row && cell.col === col);
                return {
                    row,
                    col,
                    flowerId: match?.flowerId ?? null,
                    plantedAt: typeof match?.plantedAt === "number" ? match.plantedAt : null,
                };
            })
        );

        setModalState({
            field,
            flowers: flowerList,
            grid: newGrid,
        });
    };
    const toggleCell = (row: number, col: number) => {
        if (!modalState) return;
        if (!selectedFlowerId) return;

        const updatedGrid = modalState.grid.map((r, i) =>
            r.map((cell, j) => {
                if (i !== row || j !== col) return cell;

                if (cell.flowerId === selectedFlowerId) {
                    // Remove flower
                    return { ...cell, flowerId: null, plantedAt: null };
                } else {
                    // Place new flower, set plantedAt time
                    return { ...cell, flowerId: selectedFlowerId, plantedAt: Date.now() };
                }
            })
        );
        setModalState({ ...modalState, grid: updatedGrid });
    };

    const saveGrid = async () => {
        if (!modalState) return; // use modalState, not selectedField!

        try {
            const fieldRef = doc(FIREBASE_DB, 'fields', modalState.field.id);
            const flatGrid = modalState.grid.flatMap(row =>
                row.map(cell => ({
                    row: cell.row,
                    col: cell.col,
                    flowerId: cell.flowerId || null,
                    plantedAt: cell.plantedAt ?? null,
                }))
            );

            await updateDoc(fieldRef, { grid: flatGrid });
            await getFields();
            setModalState(null);
        } catch (error: any) {
            console.error('Error saving grid:', error);
            alert(`Error saving grid:\n${error.message}`);
        }
    };

    const clearGrid = () => {
        if (!modalState) return;

        const clearedGrid = modalState.grid.map(row =>
            row.map(cell => ({
                ...cell,
                flowerId: null,
                plantedAt: null,
            }))
        );

        setModalState({ ...modalState, grid: clearedGrid });
    };

    return (
        <View className="flex-1 bg-stone-200 items-center">
            <Text className="text-4xl mt-28 mb-4 font-bodyBold color-mygreen">My Fields</Text>

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

            {/* Add Field Button and List */}
            <View className="flex-1 bg-stone-300 w-full items-center px-6">
                <TouchableOpacity
                    onPress={() => setInputModalVisible(true)}
                    className="bg-stone-200 mt-8 w-full h-20 rounded-3xl shadow-inner items-center justify-center"
                >
                    <Feather name="plus" size={28} color="#d6d3d1" />
                </TouchableOpacity>

                <FlatList
                    className="w-full"
                    data={fields}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <View className="w-full relative">
                            <TouchableOpacity
                                onPress={() => {
                                    if (fieldToDelete === item.id) {
                                        setFieldToDelete(null);
                                    } else if (fieldToDelete) {
                                        setFieldToDelete(null);
                                        openFieldModal(item);
                                    } else {
                                        openFieldModal(item);
                                    }
                                }}
                                onLongPress={() => {
                                    setFieldToDelete(item.id)
                                }}
                                className="bg-mygreen h-20 px-6 mt-6 rounded-3xl shadow-inner justify-center"
                            >
                                <Text className="text-stone-200 font-bodyBold text-lg">{item.name}</Text>
                            </TouchableOpacity>
                            {fieldToDelete === item.id && (
                                    <TouchableOpacity
                                        className="absolute w-full bg-red-700 h-20 px-6 mt-6 rounded-3xl shadow-inner justify-center items-center"
                                        onPress={() => {
                                            setDeleteModalVisible(true);
                                        }}
                                    >
                                        <Feather name="trash-2" size={28} color="#d6d3d1" />
                                    </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            </View>

            {/* Delete Field Modal */}
            <Modal
                visible={deleteModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <KeyboardAvoidingView
                    className="flex-1 justify-center items-center bg-black/50 px-6"
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View className="bg-stone-300 p-6 rounded-xl w-full">
                        <Text className="text-xl font-bodyBold text-red-600 mb-4">
                            Delete Field
                        </Text>
                        <Text className="text-base mb-6 text-stone-700">
                            Are you sure you want to delete this field? This cannot be undone.
                        </Text>
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                className="bg-stone-200 px-4 py-2 rounded-full"
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text className="text-stone-600 font-bodyBold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-red-600 px-4 py-2 rounded-full"
                                onPress={async () => {
                                    await deleteField(fieldToDelete!);
                                    setDeleteModalVisible(false);
                                    setFieldToDelete(null);
                                }}
                            >
                                <Text className="text-white font-bodyBold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Field Planner Modal */}
            <Modal visible={modalState !== null} animationType="slide" transparent>
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View className="bg-stone-300 p-6 rounded-xl w-full">
                        <Text className="text-2xl font-bodyBold text-mygreen mb-2">
                            {modalState?.field.name}
                        </Text>

                        <Text className="text-lg font-bodyBold mb-2 text-stone-600">Place Flowers:</Text>
                        <ScrollView horizontal className="mb-4">
                            {modalState?.flowers.map((flower) => (
                                <TouchableOpacity
                                    key={flower.id}
                                    onPress={() => setSelectedFlowerId(flower.id)}
                                    className={`px-4 py-2 mx-1 rounded-full capitalize ${
                                        selectedFlowerId === flower.id ? "bg-stone-600" : "bg-stone-200"
                                    }`}
                                >
                                    <Text
                                        className={`${
                                            selectedFlowerId === flower.id ? "text-stone-200" : "text-stone-600"
                                        } font-bodyBold capitalize`}
                                    >
                                        {flower.common_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <ScrollView horizontal>
                            <View>
                                {modalState?.grid.map((row, rowIndex) => (
                                    <View key={rowIndex} className="flex-row">
                                        {row.map((cell, colIndex) => {
                                            const flower = modalState.flowers.find(f => f.id === cell.flowerId);
                                            const bgColor = flower ? hashToPastelColor(flower.common_name!) : '#fff';
                                            const label = flower?.common_name?.[0]?.toUpperCase() || '';
                                            let ageText = '';
                                            if (cell.flowerId && cell.plantedAt) {
                                                const ageSeconds = Math.floor((Date.now() - cell.plantedAt) / 1000);
                                                if (ageSeconds < 60) ageText = `${ageSeconds}s`;
                                                else if (ageSeconds < 3600) ageText = `${Math.floor(ageSeconds/60)}m`;
                                                else if (ageSeconds < 86400) ageText = `${Math.floor(ageSeconds/3600)}h`;
                                                else ageText = `${Math.floor(ageSeconds/86400)}d`;
                                            }
                                            return (
                                                <TouchableOpacity
                                                    key={`${rowIndex}-${colIndex}`}
                                                    onPress={() => toggleCell(rowIndex, colIndex)}
                                                    className="w-12 h-12 border border-gray-400 items-center justify-center"
                                                    style={{ backgroundColor: bgColor || '#fff' }}
                                                >
                                                    <Text className="text-white font-bodyBold text-lg">
                                                        {label}
                                                    </Text>
                                                    {cell.flowerId && cell.plantedAt && (
                                                        <Text className="text-xs text-stone-100">{ageText}</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <View className="flex-row w-full justify-between">
                            <TouchableOpacity
                                className="bg-mygreen px-4 py-2 rounded-full mt-4"
                                onPress={saveGrid}
                            >
                                <Text className="text-white font-bodyBold">Save Grid</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-stone-200 px-4 py-2 rounded-full mt-4"
                                onPress={clearGrid}
                            >
                                <Text className="text-stone-600 font-bodyBold">Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-stone-200 px-4 py-2 rounded-full mt-4"
                                onPress={() => setModalState(null)}
                            >
                                <Text className="text-stone-600 font-bodyBold">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Field Modal */}
            <Modal visible={inputModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    className="flex-1 justify-center items-center bg-black/50 px-6"
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View className="bg-stone-300 p-6 rounded-xl w-full">
                        <Text className="text-xl font-bodyBold text-mygreen mb-4">Create Your Field</Text>
                        <TextInput
                            placeholder="Name"
                            placeholderTextColor="#a8a29e"
                            className="p-3 mb-4 rounded-lg bg-stone-200"
                            value={fieldName}
                            onChangeText={setFieldName}
                        />
                        <TextInput
                            placeholder="Rows"
                            placeholderTextColor="#a8a29e"
                            keyboardType="numeric"
                            className="p-3 mb-2 rounded-lg bg-stone-200"
                            value={rows}
                            onChangeText={setRows}
                        />
                        <TextInput
                            placeholder="Columns"
                            placeholderTextColor="#a8a29e"
                            keyboardType="numeric"
                            className="p-3 mb-4 rounded-lg bg-stone-200"
                            value={cols}
                            onChangeText={setCols}
                        />
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                className="bg-stone-200 px-4 py-2 rounded-full"
                                onPress={() => setInputModalVisible(false)}
                            >
                                <Text className="text-stone-600 font-bodyBold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-mygreen px-4 py-2 rounded-full"
                                onPress={addField}
                            >
                                <Text className="text-white font-bodyBold">Add Field</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default Beds;
