// app/(tabs)/tutor.tsx
import { auth } from "@/services/firebase";
import { uploadPetImageLocal } from "@/services/pets";
import { getUser, subscribeUser, updateUser, UserProfile } from "@/services/users";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import theme from "../../constants/theme";

export default function Tutor() {
  const user = auth.currentUser;
  useEffect(() => {
    if (!user) router.replace("/auth/login"); // protege rota
  }, [user]);

  const uid = user?.uid;
  const [loading, setLoading] = useState(false);

  // estado local do perfil
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);

  // campos editáveis
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null); // preview local (before upload)

  // subscribe realtime ao doc do usuário
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeUser(uid, (u) => {
      setProfile(u);
      if (!editing && u) { // atualiza campos se não estiver editando
        setName(u.name ?? "");
        setPhone(u.phone ?? "");
        setAddress(u.address ?? "");
        setEmail(u.email ?? (user?.email ?? ""));
      }
    });
    return unsub;
  }, [uid, editing]);

  // caso não tenha doc, tenta criar a partir do auth (on demand)
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const existing = await getUser(uid);
      if (!existing) {
        const initial = {
          name: user?.displayName ?? "",
          email: user?.email ?? "",
          photoUrl: user?.photoURL ?? ""
        } as UserProfile;
        await updateUser(uid, initial).catch(() => {});
        setProfile(initial);
        setName(initial.name ?? "");
        setEmail(initial.email ?? "");
      }
    })();
  }, [uid]);

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
    if (!res.canceled) {
      setLocalPhotoUri(res.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!uid) return;
    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Informe seu nome.");
      return;
    }

    setLoading(true);
    try {
      let remotePhoto = profile?.photoUrl;
      if (localPhotoUri) {
        // upload via seu backend Java (reaproveita uploadPetImageLocal)
        const uploaded = await uploadPetImageLocal(localPhotoUri);
        // uploadPetImageLocal deve retornar URL pública (ex: http://.../files/download/xxx)
        remotePhoto = uploaded;
      }

      // atualiza Firestore
      await updateUser(uid, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        email: email.trim() || undefined,
        photoUrl: remotePhoto || undefined,
      });

      setEditing(false);
      setLocalPhotoUri(null);
      Alert.alert("Salvo", "Informações atualizadas com sucesso.");
    } catch (err: any) {
      console.error("Erro salvar perfil:", err);
      Alert.alert("Erro", err?.message ?? "Falha ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = () => {
    // ativa edição e popula campos com info atual
    setEditing(true);
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setAddress(profile?.address ?? "");
    setEmail(profile?.email ?? (user?.email ?? ""));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Pressable
        onPress={() => router.push("../web/about")}
        style={{ position: "absolute", top: 12, right: 12, padding: 8, backgroundColor: theme.green, borderRadius: 999 }}
      >
        <Text style={{ color: "#fff" }}>💬</Text>
      </Pressable>

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Pressable onPress={editing ? pickImage : undefined}>
          <Image
            source={{ uri: localPhotoUri || profile?.photoUrl || "https://i.pravatar.cc/300" }}
            style={{ width: 140, height: 140, borderRadius: 100 }}
          />
          {editing && <Text style={{ textAlign: "center", marginTop: 8, color: theme.green }}>Trocar foto</Text>}
        </Pressable>
      </View>

      <View style={{ marginTop: 12 }}>
        {/* Nome */}
        <Text style={{ color: theme.green, fontSize: 20, fontWeight: "900", textAlign: "center" }}>{profile?.name ?? ""}</Text>

        {/* Campos editáveis */}
        <View style={{ gap: 10, marginTop: 16 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome"
            editable={editing}
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 10,
            }}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefone"
            editable={editing}
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 10,
            }}
          />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Endereço"
            editable={editing}
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 10,
            }}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            editable={editing}
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 10,
            }}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          {loading ? (
            <ActivityIndicator />
          ) : editing ? (
            <Pressable
              onPress={onSave}
              style={{ backgroundColor: theme.green, padding: 14, borderRadius: 16 }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", textAlign: "center" }}>Salvar</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onEdit}
              style={{ backgroundColor: theme.green, padding: 14, borderRadius: 16 }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", textAlign: "center" }}>Editar informações</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
