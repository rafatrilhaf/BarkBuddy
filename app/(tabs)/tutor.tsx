<<<<<<< Updated upstream
import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { owner } from '../constantes/mock';
import theme from '../constantes/theme';

export default function Tutor() {
  return (
    <View style={{ flex:1, backgroundColor:'#fff', padding:20 }}>
      <Pressable onPress={()=>router.push('/about')} style={{ position:'absolute', top:12, right:12, padding:8, backgroundColor: theme.green, borderRadius:999 }}>
        <Text style={{ color:'#fff' }}>💬</Text>
      </Pressable>

      <Image source={{ uri: 'https://i.pravatar.cc/300' }} style={{ width:140, height:140, borderRadius:100, alignSelf:'center' }} />
      <Text style={{ color: theme.green, fontSize:32, fontWeight:'900', textAlign:'center', marginTop:12 }}>{owner.name}</Text>

      <View style={{ gap:10, marginTop:12, alignItems:'center' }}>
        <Text>{owner.phone}</Text>
        <Text style={{ textAlign:'center' }}>{owner.address}</Text>
        <Text>{owner.email}</Text>
      </View>

      <Pressable style={{ backgroundColor: theme.green, padding:14, borderRadius:16, marginTop:16 }}>
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>Editar informações</Text>
      </Pressable>
=======
// app/(tabs)/tutor.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "@/services/firebase";
import { Pet, subscribeMyPets } from "@/services/pets";

type Row = Pet & { id?: string };

export default function TutorScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const uid = user?.uid ?? null;

  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Row[]>([]);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeMyPets(uid, (list) => {
      setPets(list as Row[]);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const initials = useMemo(() => {
    const name = user?.displayName || user?.email || "BB";
    return name
      .trim()
      .split(/\s+|@/)[0]
      .slice(0, 2)
      .toUpperCase();
  }, [user?.displayName, user?.email]);

  if (!uid) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="person-circle-outline" size={44} />
        <Text style={{ marginTop: 8, textAlign: "center" }}>
          Faça login para ver seu perfil de tutor e seus pets.
        </Text>
        <TouchableOpacity
          style={[styles.iconButton, styles.primary, { marginTop: 12 }]}
          onPress={() => router.push("/auth/login")}
        >
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={[styles.iconButtonText, { color: "#fff" }]}>Ir para login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Carregando…</Text>
      </SafeAreaView>
    );
  }

  const Header = () => (
    <View style={styles.headerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{user?.displayName || "Tutor"}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => Alert.alert("Perfil", "Edição de perfil em breve.")}
      >
        <Ionicons name="create-outline" size={18} />
        <Text style={styles.iconButtonText}>Editar</Text>
      </TouchableOpacity>
>>>>>>> Stashed changes
    </View>
  );

  const Action = ({
    icon,
    label,
    onPress,
  }: {
    icon: any;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.action} onPress={onPress}>
      <Ionicons name={icon} size={22} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );

  const QuickActions = () => (
    <View style={styles.quickRow}>
      {/* 👉 Agora abre a aba /pet e foca no formulário embutido */}
      <Action
        icon="add-circle-outline"
        label="Cadastrar Pet"
        onPress={() => router.push({ pathname: "/pet", params: { focus: "form" } })}
      />
      <Action
        icon="qr-code-outline"
        label="Meu QR do Tutor"
        onPress={() => Alert.alert("QR", "Em breve")}
      />
      <Action
        icon="id-card-outline"
        label="Contato Emergência"
        onPress={() => Alert.alert("Emergência", "Defina seu contato na área de perfil (em breve)")}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Pets</Text>

          {pets.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.muted}>Você ainda não cadastrou nenhum pet.</Text>
              <TouchableOpacity
                style={[styles.iconButton, styles.primary]}
                onPress={() => router.push({ pathname: "/pet", params: { focus: "form" } })}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={[styles.iconButtonText, { color: "#fff" }]}>Cadastrar Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={pets}
              keyExtractor={(item) => item.id!}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.petCard}
                  // 👉 Abre sua tela existente /pet/edit passando o id
                  onPress={() => router.push({ pathname: "/pet/edit", params: { id: item.id } })}
                >
                  <View style={styles.petAvatar}>
                    <Text style={styles.petAvatarText}>
                      {(item.name ?? "P")[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.petName}>{item.name}</Text>
                    <Text style={styles.mutedSmall}>
                      {item.species ?? "—"}{item.breed ? ` • ${item.breed}` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <QuickActions />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fff" },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#f2f2f2",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#e5e5e5",
  },
  avatarText: { fontWeight: "700", fontSize: 20 },

  title: { fontSize: 18, fontWeight: "700" },
  muted: { color: "#6b7280" },
  mutedSmall: { color: "#6b7280", fontSize: 12 },

  iconButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: "#e5e7eb",
  },
  iconButtonText: { fontWeight: "600" },
  primary: { backgroundColor: "#111827", borderColor: "#111827" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },

  emptyBox: { gap: 8, alignItems: "flex-start", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee" },

  petCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#eee",
  },
  petAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#f3f4f6",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e7eb",
  },
  petAvatarText: { fontWeight: "700" },
  petName: { fontWeight: "700" },

  quickRow: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  action: { flex: 1, gap: 8, alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#eee" },
  actionText: { fontWeight: "600", textAlign: "center" },
});
