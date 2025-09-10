// app/(tabs)/blog.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../../constants/theme";

// Firestore (texto apenas)
import {
  listenTextPosts,
  publishTextPost,
  type TextPost,
} from "../../services/post";

// seu PostCard atual espera { id, user, text, images: string[], createdAt: string }
import PostCard from "../../components/PostCard";

// tipo auxiliar do componente existente
type PostCardShape = {
  id: string;
  user: string;
  text: string;
  images: string[];   // sempre []
  createdAt: string;  // "HH:mm" (derivado de createdAtTS)
};

export default function Blog() {
  const [posts, setPosts] = useState<TextPost[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  // 1) Ouvir posts em tempo real
  useEffect(() => {
    const unsub = listenTextPosts(setPosts);
    return () => unsub();
  }, []);

  // helper: formata horário "HH:mm" a partir do timestamp
  function fmtHHmm(ts?: any) {
    try {
      const dt = ts?.toDate?.() ? ts.toDate() : null;
      if (!dt) return "";
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return "";
    }
  }

  // 2) Mapear para o formato que o PostCard já usa
  const uiPosts: PostCardShape[] = useMemo(
    () =>
      posts.map((p) => ({
        id: p.id,
        user: p.authorName ?? "Tutor",
        text: p.text ?? "",
        images: [],                    // sem imagens (apenas texto)
        createdAt: fmtHHmm(p.createdAtTS), // <- string derivada
      })),
    [posts]
  );

  // 3) Publicar novo post de texto
  const handlePublish = async () => {
    try {
      if (!text.trim()) return;
      setBusy(true);
      await publishTextPost(text);
      setText("");
      setComposerOpen(false);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível publicar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.white }}>
      {/* topo com ícone centralizado */}
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.greenLight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="home" size={22} color={theme.greenDark} />
        </View>
      </View>

      {/* busca + filtro + novo post */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8, position: "relative" }}>
        <View
          style={{
            backgroundColor: theme.greenLight,
            borderRadius: 16,
            paddingLeft: 40,
            paddingRight: 92,
            height: 44,
            justifyContent: "center",
          }}
        >
          <TextInput
            placeholder="Pesquisar"
            placeholderTextColor="#577"
            style={{ color: theme.greenDark, fontSize: 14 }}
            // (opcional) onChangeText para busca futura
          />
        </View>
        <Ionicons
          name="search"
          size={18}
          color={theme.greenDark}
          style={{ position: "absolute", left: 26, top: 13 }}
        />
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 64,
            top: 6,
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {}}
        >
          <Ionicons name="options-outline" size={20} color={theme.greenDark} />
        </TouchableOpacity>

        {/* botão + abre o composer */}
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 16,
            top: 0,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.greenDark,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => setComposerOpen(true)}
        >
          <Ionicons name="add" size={24} color={theme.white} />
        </TouchableOpacity>
      </View>

      {/* feed em tempo real */}
      <FlatList
        contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingBottom: 24 }}
        data={uiPosts}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <PostCard post={item} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Composer (só texto) */}
      <Modal
        visible={composerOpen}
        animationType="slide"
        onRequestClose={() => setComposerOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.greenDark, marginBottom: 12 }}>
            Novo post
          </Text>

          <TextInput
            placeholder="Escreva algo..."
            value={text}
            onChangeText={setText}
            multiline
            style={{
              minHeight: 140,
              borderColor: "#ddd",
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              textAlignVertical: "top",
            }}
          />

          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              onPress={handlePublish}
              disabled={busy || !text.trim()}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 18,
                backgroundColor: theme.greenDark,
                borderRadius: 12,
                opacity: busy || !text.trim() ? 0.5 : 1,
              }}
            >
              <Text style={{ color: "#fff" }}>{busy ? "Publicando..." : "Publicar"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setComposerOpen(false)} style={{ padding: 12 }}>
              <Text style={{ color: theme.greenDark }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
