// app/(tabs)/blog.tsx - VERSÃO INTERNACIONALIZADA
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
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
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
  const { colors, fontSizes } = useTheme();
  const { t } = useLanguage();
  
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

  // Função para publicar post com verificação rigorosa - INTERNACIONALIZADA
  const handlePublish = async () => {
    console.log("📝 Tentando publicar post...");
    console.log("📝 User atual:", auth.currentUser?.email);
    console.log("📝 User isAnonymous:", auth.currentUser?.isAnonymous);
    
    if (!user || user.isAnonymous) {
      Alert.alert(t('general.error'), t('blog.emailLoginRequired'));
      return;
    }
    
    if (!text.trim()) {
      Alert.alert(t('general.error'), t('blog.writeContent'));
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
      Alert.alert(t('general.error'), e.message || t('blog.publishFailed'));
    } finally {
      setBusy(false);
    }
  };

  // Tela de carregamento - INTERNACIONALIZADA
  if (initializing) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name="chatbubbles" size={22} color={colors.primary} />
        </View>
        <Text
          style={{
            fontSize: fontSizes.md,
            color: colors.text,
            fontWeight: "600",
          }}
        >
          {t('general.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  // Tela de acesso restrito - INTERNACIONALIZADA
  if (!isAuthenticated || !user || user.isAnonymous) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          padding: 20,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="lock-closed" size={32} color={colors.primary} />
        </View>
        <Text
          style={{
            fontSize: fontSizes.lg,
            color: colors.text,
            textAlign: "center",
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          {t('blog.loginRequired')}
        </Text>
        <Text
          style={{
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {t('blog.loginRequiredDesc')}
        </Text>
      </SafeAreaView>
    );
  }

  // Interface principal do blog - INTERNACIONALIZADA
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* topo com ícone centralizado */}
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chatbubbles" size={22} color={colors.primary} />
        </View>
      </View>

      {/* busca + filtro + novo post - INTERNACIONALIZADO */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 8,
          position: "relative",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingLeft: 40,
            paddingRight: 92,
            height: 44,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <TextInput
            placeholder={t('blog.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={{ 
              color: colors.text, 
              fontSize: fontSizes.sm,
            }}
          />
        </View>
        <Ionicons
          name="search"
          size={18}
          color={colors.textSecondary}
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
          accessibilityLabel={t('general.filter')}
        >
          <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
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
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => setComposerOpen(true)}
          accessibilityLabel={t('blog.newPost')}
        >
          <Ionicons name="add" size={24} color={colors.background} />
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
              color={colors.textTertiary}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {t('blog.noPosts')}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: fontSizes.sm,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {t('blog.noPostsDesc')}
            </Text>
          </View>
        }
      />

      {/* Composer (só texto) - INTERNACIONALIZADO */}
      <Modal
        visible={composerOpen}
        animationType="slide"
        onRequestClose={() => setComposerOpen(false)}
      >
        <SafeAreaView
          style={{ 
            flex: 1, 
            backgroundColor: colors.background, 
            padding: 16 
          }}
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
                fontSize: fontSizes.lg,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {t('blog.newPost')}
            </Text>
            <TouchableOpacity onPress={() => setComposerOpen(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            placeholder={t('blog.writePost')}
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            style={{
              minHeight: 140,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              textAlignVertical: "top",
              fontSize: fontSizes.md,
              lineHeight: 22,
              color: colors.text,
              backgroundColor: colors.surface,
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
                  busy || !text.trim() ? colors.textTertiary : colors.primary,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: busy || !text.trim() ? colors.textSecondary : colors.background,
                  fontWeight: "600",
                  fontSize: fontSizes.md,
                }}
              >
                {busy ? t('blog.publishing') : t('blog.publish')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setComposerOpen(false)}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: "center",
                backgroundColor: colors.surface,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  fontSize: fontSizes.md,
                }}
              >
                {t('general.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}