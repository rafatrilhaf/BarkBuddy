// app/(tabs)/blog.tsx
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, type User } from "firebase/auth";
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
import PostCard from "../../components/PostCard";
import theme from "../../constants/theme";
import { auth } from "../../services/firebase";
import {
  listenTextPosts,
  publishTextPost,
  type TextPost,
} from "../../services/post";

type PostCardShape = {
  id: string;
  user: string;
  text: string;
  images: string[];
  createdAt: string;
  authorId: string;
};

export default function Blog() {
  // Estado do usuário e autenticação
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados do blog
  const [posts, setPosts] = useState<TextPost[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  // Listener de autenticação local com verificação de usuário anônimo
  useEffect(() => {
    console.log("🔥 Blog: Configurando listener de auth...");
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      console.log("👤 Auth state mudou:", authUser ? `LOGADO: ${authUser.email}` : 'DESLOGADO');
      console.log("👤 Auth isAnonymous:", authUser?.isAnonymous);
      
      // Só considera autenticado se NÃO for anônimo
      if (authUser && !authUser.isAnonymous) {
        setUser(authUser);
        setIsAuthenticated(true);
        console.log("✅ Usuário real autenticado:", authUser.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log("❌ Usuário anônimo ou deslogado");
      }
      
      if (initializing) {
        setInitializing(false);
        console.log("✅ Inicialização da auth concluída");
      }
    });
    return () => unsubscribe();
  }, [initializing]);

  // Só ouvir posts se usuário estiver REALMENTE autenticado (não anônimo)
  useEffect(() => {
    if (!isAuthenticated || !user || user.isAnonymous) {
      console.log("📡 NÃO iniciando listener - usuário não autenticado ou anônimo");
      setPosts([]);
      return;
    }
    
    console.log("📡 Iniciando listener de posts para:", user.email);
    const unsubscribe = listenTextPosts(setPosts);
    return () => {
      console.log("📡 Parando listener de posts");
      unsubscribe();
    };
  }, [isAuthenticated, user]);

  // Formatar horário "HH:mm"
  function fmtHHmm(ts?: any) {
    try {
      const dt = ts?.toDate ? ts.toDate() : null;
      if (!dt) return "";
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return "";
    }
  }

  // Preparar posts para UI
  const uiPosts: PostCardShape[] = useMemo(
    () =>
      posts.map((p) => ({
        id: p.id,
        user: p.authorName ?? "Tutor",
        text: p.text ?? "",
        images: [],
        createdAt: fmtHHmm(p.createdAtTS),
        authorId: p.authorId,
      })),
    [posts]
  );

  // Função para publicar post com verificação rigorosa
  const handlePublish = async () => {
    console.log("📝 Tentando publicar post...");
    console.log("📝 User atual:", auth.currentUser?.email);
    console.log("📝 User isAnonymous:", auth.currentUser?.isAnonymous);
    
    if (!user || user.isAnonymous) {
      Alert.alert("Erro", "Você precisa fazer login com email para publicar no blog.");
      return;
    }
    
    if (!text.trim()) {
      Alert.alert("Erro", "Digite algo para publicar.");
      return;
    }

    setBusy(true);
    try {
      await publishTextPost(text);
      setText("");
      setComposerOpen(false);
      console.log("✅ Post publicado com sucesso");
    } catch (e: any) {
      console.error("❌ Erro ao publicar:", e);
      Alert.alert("Erro", e.message || "Não foi possível publicar");
    } finally {
      setBusy(false);
    }
  };

  // Tela de carregamento
  if (initializing) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.white,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.greenLight,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name="chatbubbles" size={22} color={theme.greenDark} />
        </View>
        <Text
          style={{
            fontSize: 16,
            color: theme.greenDark,
            fontWeight: "600",
          }}
        >
          Carregando autenticação...
        </Text>
      </SafeAreaView>
    );
  }

  // Tela de acesso restrito
  if (!isAuthenticated || !user || user.isAnonymous) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.white,
          padding: 20,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.greenLight,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="lock-closed" size={32} color={theme.greenDark} />
        </View>
        <Text
          style={{
            fontSize: 18,
            color: theme.greenDark,
            textAlign: "center",
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Login Necessário
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#999",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          Faça login com email na aba Tutor{"\n"}para acessar o blog da comunidade
        </Text>
      </SafeAreaView>
    );
  }

  // Interface principal do blog
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
          <Ionicons name="chatbubbles" size={22} color={theme.greenDark} />
        </View>
      </View>

      {/* busca + filtro + novo post */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 8,
          position: "relative",
        }}
      >
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
            placeholder="Pesquisar posts..."
            placeholderTextColor="#577"
            style={{ color: theme.greenDark, fontSize: 14 }}
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
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        data={uiPosts}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <PostCard post={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color="#ccc"
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                color: "#999",
                fontSize: 16,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Nenhum post ainda
            </Text>
            <Text
              style={{
                color: "#999",
                fontSize: 14,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Seja o primeiro a compartilhar algo sobre seu pet!
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
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.greenDark,
              }}
            >
              Novo post
            </Text>
            <TouchableOpacity onPress={() => setComposerOpen(false)}>
              <Ionicons name="close" size={24} color={theme.greenDark} />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Escreva algo sobre seu pet..."
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
                backgroundColor:
                  busy || !text.trim() ? "#ddd" : theme.greenDark,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: busy || !text.trim() ? "#999" : "#fff",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
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
              <Text
                style={{
                  color: theme.greenDark,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
