// app/(tabs)/pet.tsx
import { auth } from "@/services/firebase";
import * as ImagePicker from "expo-image-picker"; // 👈 novo
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native"; // 👈 Image, Pressable
import QRCode from "react-native-qrcode-svg";
import { addPet, deletePetById, Pet, subscribeMyPets, updatePet, uploadPetImageLocal } from "services/pets"; // 👈 import novo

type Row = Pet & { id?: string };

export default function PetTab() {
  const user = auth.currentUser;
  const uid = user?.uid;

  const [pets, setPets] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<string>(""); // input string
  const [photoUri, setPhotoUri] = useState<string | null>(null); // 👈 novo preview local

  // subscribe to my pets
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
    setPhotoUri(null); // 👈 novo
  };

  const startEdit = (row: Row) => {
    setEditingId(row.id!);
    setName(row.name ?? "");
    setSpecies(row.species ?? "");
    setBreed(row.breed ?? "");
    setAge(row.age ? String(row.age) : "");
    setPhotoUri(null); // 👈 só envia nova foto se escolher outra
  };

  // 👇 escolher imagem da galeria
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

    // 👇 faz upload local (se escolheu foto) e pega a URL
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
      photoUrl: photoUrl || undefined, // 👈 só inclui se existir
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
          try { await deletePetById(id); } catch (e: any) { Alert.alert("Erro", e.message); }
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Meus Pets</Text>

        {/* Formulário simples */}
        <View style={{ gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 }}>
          <Text style={{ fontWeight: "600" }}>{isEditing ? "Editar pet" : "Adicionar pet"}</Text>

          {/* preview + botão escolher foto (sem mudar seu estilo geral) */}
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: "#eee" }} />
          ) : null}
          <Pressable onPress={pickImage} style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderRadius: 8 }}>
            <Text>Escolher foto</Text>
          </Pressable>

          <TextInput placeholder="Nome *" value={name} onChangeText={setName} style={input} />
          <TextInput placeholder="Espécie (cão, gato...)" value={species} onChangeText={setSpecies} style={input} />
          <TextInput placeholder="Raça" value={breed} onChangeText={setBreed} style={input} />
          <TextInput placeholder="Idade (anos)" value={age} onChangeText={setAge} keyboardType="numeric" style={input} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title={isEditing ? "Salvar alterações" : "Adicionar"} onPress={submit} />
            {isEditing && <Button title="Cancelar" onPress={resetForm} />}
          </View>
        </View>

        {/* Lista */}
        {/* Lista */}
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id!}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const petUrl = `https://barkbuddy-bd.web.app/${item.id}`;
            return (
              <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
                {/* miniatura se tiver */}
                {item.photoUrl ? (
                  <Image
                    source={{ uri: item.photoUrl }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      backgroundColor: "#eee",
                      marginBottom: 8,
                    }}
                  />
                ) : null}

                <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                <Text>Espécie: {item.species ?? "-"}</Text>
                <Text>Raça: {item.breed ?? "-"}</Text>
                <Text>
                  Idade: {typeof item.age === "number" && !Number.isNaN(item.age) ? item.age : "-"}
                </Text>

                {/* QR Code com o link do site + id */}
                <View style={{ alignItems: "center", marginTop: 10 }}>
                  <QRCode value={petUrl} size={140} />
                  <Text style={{ fontSize: 12, marginTop: 4 }} selectable>
                    {petUrl}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => startEdit(item)}>
                    <Text style={link}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item.id)}>
                    <Text style={[link, { color: "crimson" }]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text>Nenhum pet cadastrado ainda.</Text>}
        />

        {/* Reserva para Dashboard */}
        <View style={{ gap: 8 }}>
          <Button title="Abrir dashboard (em breve)" onPress={() => router.push("/pet")} />
          <Text style={{ fontSize: 12, opacity: 0.7 }}>Esta rota será criada só como placeholder agora.</Text>
        </View>
      </View>
    </KeyboardAvoidingView>


  );


}

const input = { borderWidth: 1, borderRadius: 8, padding: 10 } as const;
const link = { color: "#2563eb", fontWeight: "600" } as const;

