// app/(tabs)/pet.tsx
import { auth } from "@/services/firebase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  addPet,
  deletePetById,
  Pet,
  subscribeMyPets,
  updatePet,
  uploadPetImageLocal,
} from "services/pets";

type Row = Pet & { id?: string };

export default function PetTab() {
  const user = auth.currentUser;
  const uid = user?.uid;

  const [pets, setPets] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({}); // controla expansão por card
  const [showForm, setShowForm] = useState(false); // controla exibição do formulário

  // form state
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<string>("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeMyPets(uid, setPets);
    return unsub;
  }, [uid]);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSpecies("");
    setBreed("");
    setAge("");
    setPhotoUri(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (row: Row) => {
    setEditingId(row.id!);
    setName(row.name ?? "");
    setSpecies(row.species ?? "");
    setBreed(row.breed ?? "");
    setAge(row.age ? String(row.age) : "");
    setPhotoUri(null);
    setShowForm(true);
  };

  // escolher imagem
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Autorize o acesso às fotos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  const submit = async () => {
    if (!uid) {
      Alert.alert("Faça login", "Você precisa estar logado para gerenciar seus pets.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Informe o nome do pet.");
      return;
    }

    let photoUrl: string | undefined;
    if (photoUri) {
      try {
        photoUrl = await uploadPetImageLocal(photoUri);
      } catch (e: any) {
        Alert.alert("Erro ao enviar foto", e?.message ?? "Tente novamente.");
        return;
      }
    }

    const payload: Pet = {
      name: name.trim(),
      userId: uid,
      species: species.trim() || undefined,
      breed: breed.trim() || undefined,
      age: age ? Number(age) : undefined,
      photoUrl: photoUrl || undefined,
    };

    try {
      if (isEditing && editingId) {
        await updatePet(editingId, payload);
      } else {
        await addPet(payload);
      }
      resetForm();
    } catch (e: any) {
      Alert.alert("Erro", e.message ?? "Falha ao salvar pet");
    }
  };

  const remove = (id?: string) => {
    if (!id) return;
    Alert.alert("Excluir pet", "Tem certeza que deseja excluir este pet?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePetById(id);
          } catch (e: any) {
            Alert.alert("Erro", e.message);
          }
        },
      },
    ]);
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Meus Pets</Text>

        {/* Botão topo para abrir formulário */}
        {!showForm && (
          <Pressable
            onPress={startCreate}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
              backgroundColor: "#e8f5ee",
              borderColor: "#0c6b41",
            }}
          >
            <Text style={{ fontWeight: "700", color: "#0c6b41" }}>
              + Adicionar um pet
            </Text>
          </Pressable>
        )}

        {/* Formulário (colapsável) */}
        {showForm && (
          <View
            style={{
              gap: 8,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              borderColor: "#d1d5db",
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {isEditing ? "Editar pet" : "Adicionar pet"}
            </Text>

            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                  backgroundColor: "#eee",
                }}
              />
            ) : null}

            <Pressable
              onPress={pickImage}
              style={{
                alignSelf: "flex-start",
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              <Text>Escolher foto</Text>
            </Pressable>

            <TextInput placeholder="Nome *" value={name} onChangeText={setName} style={input} />
            <TextInput placeholder="Espécie (cão, gato...)" value={species} onChangeText={setSpecies} style={input} />
            <TextInput placeholder="Raça" value={breed} onChangeText={setBreed} style={input} />
            <TextInput placeholder="Idade (anos)" value={age} onChangeText={setAge} keyboardType="numeric" style={input} />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title={isEditing ? "Salvar alterações" : "Adicionar"} onPress={submit} />
              <Button title="Cancelar" onPress={resetForm} />
            </View>
          </View>
        )}

        {/* Lista de pets (cards colapsáveis) */}
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id!}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const petUrl = `https://barkbuddy-bd.web.app/${item.id}`;
            const expanded = !!expandedIds[item.id!];

            return (
              <View style={{ borderWidth: 1, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>
                {/* Cabeçalho clicável: foto + nome */}
                <Pressable
                  onPress={() => toggleExpand(item.id!)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    backgroundColor: "#f7f7f7",
                  }}
                >
                  <Image
                    source={
                      item.photoUrl
                        ? { uri: item.photoUrl }
                        : { uri: "https://placekitten.com/160/160" }
                    }
                    style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#eee" }}
                  />
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
                  <View style={{ marginLeft: "auto" }}>
                    <Text style={{ opacity: 0.6 }}>{expanded ? "▲" : "▼"}</Text>
                  </View>
                </Pressable>

                {/* Conteúdo expandido */}
                {expanded && (
                  <View style={{ padding: 12, gap: 6 }}>
                    <Text>Espécie: {item.species ?? "-"}</Text>
                    <Text>Raça: {item.breed ?? "-"}</Text>
                    <Text>
                      Idade:{" "}
                      {typeof item.age === "number" && !Number.isNaN(item.age) ? item.age : "-"}
                    </Text>

                    <View style={{ alignItems: "center", marginTop: 10 }}>
                      <QRCode value={petUrl} size={140} />
                      <Text style={{ fontSize: 12, marginTop: 4 }} selectable>
                        {petUrl}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                      <TouchableOpacity onPress={() => startEdit(item)}>
                        <Text style={link}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => remove(item.id)}>
                        <Text style={[link, { color: "crimson" }]}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text>Nenhum pet cadastrado ainda.</Text>}
          contentContainerStyle={{ paddingBottom: 96 }}
        />

        {/* placeholder do dashboard */}
        <View style={{ gap: 8 }}>
          <Button title="Abrir dashboard (em breve)" onPress={() => router.push("/pet")} />
          <Text style={{ fontSize: 12, opacity: 0.7 }}>
            Esta rota será criada só como placeholder agora.
          </Text>
        </View>

        {/* FAB “+” no canto inferior direito */}
        {!showForm && (
          <Pressable
            onPress={startCreate}
            style={{
              position: "absolute",
              right: 20,
              bottom: 24,
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0c6b41",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 6,
            }}
            accessibilityLabel="Adicionar um pet"
          >
            <Text style={{ color: "#fff", fontSize: 28, lineHeight: 28 }}>＋</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const input = { borderWidth: 1, borderRadius: 8, padding: 10 } as const;
const link = { color: "#2563eb", fontWeight: "600" } as const;
