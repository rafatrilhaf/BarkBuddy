import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import theme from "../constants/theme";
import { auth } from "../services/firebase";
import { likePost } from "../services/post";
import { getUser, type UserProfile } from "../services/users";

type PostCardProps = {
  post: {
    id: string;
    user: string;
    text: string;
    images: string[];
    createdAt: string;
    authorId?: string;
    likes?: number;
  };
};

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  
  const currentUser = auth.currentUser;
  const imgs = (post.images || []).slice(0, 3);

  // Carregar perfil do autor do post
  useEffect(() => {
    if (post.authorId) {
      getUser(post.authorId).then(setAuthorProfile).catch(console.error);
    }
  }, [post.authorId]);

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert("Login necessário", "Faça login para curtir posts");
      return;
    }

    try {
      // Otimistic update
      const newLiked = !liked;
      setLiked(newLiked);
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
      
      await likePost(post.id);
    } catch (error) {
      // Reverter em caso de erro
      setLiked(!liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
      console.error("Erro ao curtir:", error);
      Alert.alert("Erro", "Não foi possível curtir o post");
    }
  };

  const handleComment = async () => {
    if (!currentUser) {
      Alert.alert("Login necessário", "Faça login para comentar");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("Erro", "Digite um comentário");
      return;
    }

    // TODO: Implementar função addComment quando criar o sistema de comentários
    Alert.alert("Em desenvolvimento", "Sistema de comentários será implementado em breve");
    setCommentText("");
  };

  const Grid = () => {
    if (imgs.length === 0) return null;

    if (imgs.length === 1) {
      return (
        <Image
          source={{ uri: imgs[0] }}
          style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 12 }}
        />
      );
    }

    if (imgs.length === 2) {
      return (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Image
            source={{ uri: imgs[0] }}
            style={{ flex: 1, aspectRatio: 1.6, borderRadius: 12 }}
          />
          <Image
            source={{ uri: imgs[1] }}
            style={{ flex: 1, aspectRatio: 1.6, borderRadius: 12 }}
          />
        </View>
      );
    }

    return (
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Image
          source={{ uri: imgs[0] }}
          style={{ flex: 1, aspectRatio: 1, borderRadius: 12 }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <Image
            source={{ uri: imgs[1] }}
            style={{ width: "100%", aspectRatio: 2.1, borderRadius: 12 }}
          />
          <Image
            source={{ uri: imgs[2] }}
            style={{ width: "100%", aspectRatio: 2.1, borderRadius: 12 }}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={{ backgroundColor: theme.greenLight, borderRadius: 16, padding: 12, elevation: 2 }}>
        {/* Header: usuário + foto + horário */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          {/* Foto do autor do post */}
          <View style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden", backgroundColor: "#cfe3d3", marginRight: 10 }}>
            {authorProfile?.photoUrl ? (
              <Image 
                source={{ uri: authorProfile.photoUrl }} 
                style={{ width: "100%", height: "100%" }} 
              />
            ) : (
              <View style={{ 
                width: "100%", 
                height: "100%", 
                backgroundColor: "#cfe3d3", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <Ionicons name="person" size={18} color={theme.greenDark} />
              </View>
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", color: theme.greenDark }}>
              {authorProfile?.name || post.user}
            </Text>
            <Text style={{ fontSize: 11, color: "#557" }}>
              publicado hoje às {post.createdAt}
            </Text>
          </View>
          
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.greenDark} />
          </TouchableOpacity>
        </View>

        {/* Texto do post */}
        {!!post.text && (
          <Text style={{ 
            marginBottom: imgs.length ? 8 : 0, 
            color: theme.greenDark, 
            lineHeight: 20 
          }}>
            {post.text}
          </Text>
        )}

        {/* Imagens */}
        <Grid />

        {/* Estatísticas de engajamento */}
        {(likesCount > 0 || comments.length > 0) && (
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginTop: 8, 
            paddingHorizontal: 4 
          }}>
            {likesCount > 0 && (
              <Text style={{ fontSize: 12, color: "#666" }}>
                {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
              </Text>
            )}
            {comments.length > 0 && (
              <Text style={{ fontSize: 12, color: "#666" }}>
                {comments.length} {comments.length === 1 ? "comentário" : "comentários"}
              </Text>
            )}
          </View>
        )}

        {/* Ações principais */}
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-around", 
          marginTop: 12, 
          paddingTop: 8, 
          borderTopWidth: 1, 
          borderTopColor: "#e8f5ee" 
        }}>
          <TouchableOpacity 
            onPress={handleLike}
            style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              gap: 6, 
              paddingVertical: 8, 
              paddingHorizontal: 16 
            }}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={20} 
              color={liked ? "#e74c3c" : theme.greenDark} 
            />
            <Text style={{ color: theme.greenDark, fontWeight: "500" }}>
              Curtir
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowComments(true)}
            style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              gap: 6, 
              paddingVertical: 8, 
              paddingHorizontal: 16 
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.greenDark} />
            <Text style={{ color: theme.greenDark, fontWeight: "500" }}>
              Comentar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              gap: 6, 
              paddingVertical: 8, 
              paddingHorizontal: 16 
            }}
          >
            <Ionicons name="paper-plane-outline" size={20} color={theme.greenDark} />
            <Text style={{ color: theme.greenDark, fontWeight: "500" }}>
              Compartilhar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Comentários (placeholder) */}
      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header do modal */}
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            padding: 16, 
            borderBottomWidth: 1, 
            borderBottomColor: "#eee" 
          }}>
            <TouchableOpacity 
              onPress={() => setShowComments(false)} 
              style={{ marginRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.greenDark} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.greenDark }}>
              Comentários
            </Text>
          </View>

          {/* Placeholder para lista de comentários */}
          <View style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#999", fontSize: 16, textAlign: "center" }}>
              Sistema de comentários em desenvolvimento
            </Text>
            <Text style={{ color: "#999", fontSize: 14, marginTop: 8, textAlign: "center" }}>
              Em breve você poderá comentar e responder posts!
            </Text>
          </View>

          {/* Campo de comentário */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ 
              borderTopWidth: 1, 
              borderTopColor: "#eee", 
              padding: 16 
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TextInput
                placeholder="Escreva um comentário..."
                value={commentText}
                onChangeText={setCommentText}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 14
                }}
                multiline
              />
              <TouchableOpacity
                onPress={handleComment}
                disabled={!commentText.trim()}
                style={{
                  backgroundColor: commentText.trim() ? theme.greenDark : "#ddd",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10
                }}
              >
                <Ionicons name="paper-plane" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
