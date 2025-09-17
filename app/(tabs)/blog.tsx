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

// seu PostCard atualizado que agora espera authorId e likes
import PostCard from "../../components/PostCard";

// tipo atualizado para o PostCard modificado
type PostCardShape = {
  id: string;
  user: string;
  text: string;
  images: string[];   // sempre []
  createdAt: string;  // "HH:mm" (derivado de createdAtTS)
  authorId: string;   // ✅ ADICIONADO - necessário para buscar foto do usuário
  likes: number;      // ✅ ADICIONADO - necessário para mostrar curtidas
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

  // 2) Mapear para o formato que o PostCard ATUALIZADO usa
  const uiPosts: PostCardShape[] = useMemo(
    () =>
      posts.map((p) => ({
        id: p.id,
        user: p.authorName ?? "Tutor",
        text: p.text ?? "",
        images: [],                      // sem imagens (apenas texto)
        createdAt: fmtHHmm(p.createdAtTS), // <- string derivada
        authorId: p.authorId,            // ✅ PASSAR authorId para buscar foto
        likes: p.likes ?? 0,             // ✅ PASSAR likes para mostrar contador
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
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#999", fontSize: 16, textAlign: "center" }}>
              Nenhum post ainda
            </Text>
            <Text style={{ color: "#999", fontSize: 14, marginTop: 4, textAlign: "center" }}>
              Seja o primeiro a compartilhar algo!
            </Text>
          </View>
        }
      />

      {/* Composer (só texto) */}
      <Modal
        visible={composerOpen}
        animationType="slide"
        onRequestClose={() => setComposerOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: 20 
          }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.greenDark }}>
              Novo post
            </Text>
            <TouchableOpacity onPress={() => setComposerOpen(false)}>
              <Ionicons name="close" size={24} color={theme.greenDark} />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Escreva algo..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            style={{
              minHeight: 140,
              borderColor: "#ddd",
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              textAlignVertical: "top",
              fontSize: 16,
              lineHeight: 22,
            }}
          />

          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={handlePublish}
              disabled={busy || !text.trim()}
              style={{
                flex: 1,
                paddingVertical: 16,
                backgroundColor: (busy || !text.trim()) ? "#ddd" : theme.greenDark,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ 
                color: (busy || !text.trim()) ? "#999" : "#fff", 
                fontWeight: "600",
                fontSize: 16
              }}>
                {busy ? "Publicando..." : "Publicar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setComposerOpen(false)} 
              style={{ 
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.greenDark,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.greenDark, fontWeight: "600", fontSize: 16 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
