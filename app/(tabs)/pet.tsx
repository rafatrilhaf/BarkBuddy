// app/(tabs)/pet.tsx
import { auth } from "@/services/firebase";
import { addPet, deletePetById, Pet, subscribeMyPets, updatePet } from "@/services/pets";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

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
  };

  const startEdit = (row: Row) => {
    setEditingId(row.id!);
    setName(row.name ?? "");
    setSpecies(row.species ?? "");
    setBreed(row.breed ?? "");
    setAge(row.age ? String(row.age) : "");
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
    const payload: Pet = {
      name: name.trim(),
      userId: uid,
      species: species.trim() || undefined,
      breed: breed.trim() || undefined,
      age: age ? Number(age) : undefined,
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
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id!}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
              <Text>Espécie: {item.species ?? "-"}</Text>
              <Text>Raça: {item.breed ?? "-"}</Text>
              <Text>Idade: {item.age ?? "-"}</Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <TouchableOpacity onPress={() => startEdit(item)}>
                  <Text style={link}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.id)}>
                  <Text style={[link, { color: "crimson" }]}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
