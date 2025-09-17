import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../constants/theme";
import {
  addComment,
  subscribeComments,
  type Comment,
} from "../services/comments";
import { auth } from "../services/firebase";
import { getUser, type UserProfile } from "../services/users";

type PostCardProps = {
  post: {
    id: string;
    user: string;
    text: string;
    images: string[];
    createdAt: string;
    authorId?: string;
  };
};

export default function PostCard({ post }: PostCardProps) {
  // Estados para comentários
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID do comentário sendo respondido
  const [replyText, setReplyText] = useState("");

  const currentUser = auth.currentUser;
  const imgs = (post.images || []).slice(0, 3);

  // Carregar perfil do autor do post
  useEffect(() => {
    if (post.authorId) {
      getUser(post.authorId).then(setAuthorProfile).catch(console.error);
    }
  }, [post.authorId]);

  // Ouvir comentários em tempo real
  useEffect(() => {
    if (!showComments) return;

    const unsubscribe = subscribeComments(post.id, setComments);
    return () => unsubscribe();
  }, [showComments, post.id]);

  // Função enviar comentário principal
  const handleComment = async () => {
    if (!currentUser) {
      Alert.alert("Login necessário", "Faça login para comentar");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("Erro", "Digite um comentário");
      return;
    }

    try {
      await addComment(post.id, commentText);
      setCommentText("");
    } catch (e) {
      Alert.alert("Erro", "Falha ao enviar comentário");
    }
  };

  // Função enviar reply
  const handleReply = async () => {
    if (!currentUser) {
      Alert.alert("Login necessário", "Faça login para responder");
      return;
    }

    if (!replyText.trim()) {
      Alert.alert("Erro", "Digite uma resposta");
      return;
    }

    try {
      await addComment(post.id, replyText, replyingTo);
      setReplyText("");
      setReplyingTo(null);
    } catch (e) {
      Alert.alert("Erro", "Falha ao enviar resposta");
    }
  };

  // Função compartilhar
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Confira este post do BarkBuddy: "${post.text}" - Compartilhado por ${authorProfile?.name || post.user}`,
        title: "Post do BarkBuddy",
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar");
    }
  };

  // Grid de imagens
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

  // Renderizar comentário com replies
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      {/* Comentário principal */}
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            {item.authorPhotoUrl ? (
              <Image source={{ uri: item.authorPhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={16} color={theme.greenDark} />
            )}
          </View>
          <View style={styles.commentContent}>
            <Text style={styles.commentAuthor}>{item.authorName}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <TouchableOpacity
              onPress={() => setReplyingTo(item.id)}
              style={styles.replyButton}
            >
              <Text style={styles.replyButtonText}>Responder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAvatar}>
                  {reply.authorPhotoUrl ? (
                    <Image source={{ uri: reply.authorPhotoUrl }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={14} color={theme.greenDark} />
                  )}
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.replyAuthor}>{reply.authorName}</Text>
                  <Text style={styles.replyText}>{reply.text}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      <View style={{ backgroundColor: theme.greenLight, borderRadius: 16, padding: 12, elevation: 2 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden", backgroundColor: "#cfe3d3", marginRight: 10 }}>
            {authorProfile?.photoUrl ? (
              <Image 
                source={{ uri: authorProfile.photoUrl }} 
                style={{ width: "100%", height: "100%" }} 
              />
            ) : (
              <View style={{ width: "100%", height: "100%", backgroundColor: "#cfe3d3", alignItems: "center", justifyContent: "center" }}>
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

        {/* Texto */}
        {!!post.text && (
          <Text style={{ marginBottom: imgs.length ? 8 : 0, color: theme.greenDark, lineHeight: 20 }}>
            {post.text}
          </Text>
        )}

        {/* Imagens */}
        <Grid />

        {/* Contador de comentários */}
        {comments.length > 0 && (
          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, color: "#666" }}>
              {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)} {comments.length === 1 ? "comentário" : "comentários"}
            </Text>
          </View>
        )}

        {/* Ações */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e8f5ee" }}>
          <TouchableOpacity
            onPress={() => setShowComments(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 16 }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.greenDark} />
            <Text style={{ color: theme.greenDark, fontWeight: "500" }}>Comentar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 16 }}
          >
            <Ionicons name="paper-plane-outline" size={20} color={theme.greenDark} />
            <Text style={{ color: theme.greenDark, fontWeight: "500" }}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Comentários */}
      <Modal visible={showComments} animationType="slide" onRequestClose={() => setShowComments(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="arrow-back" size={24} color={theme.greenDark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comentários</Text>
          </View>

          {/* Lista comentários */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={{ color: "#999", textAlign: "center", marginTop: 40 }}>
                Nenhum comentário ainda. Seja o primeiro!
              </Text>
            }
          />

          {/* Input comentário/reply */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>Respondendo comentário</Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                placeholder={replyingTo ? "Escreva uma resposta..." : "Escreva um comentário..."}
                value={replyingTo ? replyText : commentText}
                onChangeText={replyingTo ? setReplyText : setCommentText}
                multiline
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={replyingTo ? handleReply : handleComment}
                disabled={replyingTo ? !replyText.trim() : !commentText.trim()}
                style={[styles.sendButton, (!commentText.trim() && !replyText.trim()) && { opacity: 0.5 }]}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.greenDark,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentItem: {
    paddingVertical: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8f5ee",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: "700",
    color: theme.greenDark,
    fontSize: 14,
  },
  commentText: {
    color: "#333",
    marginTop: 2,
    lineHeight: 18,
  },
  replyButton: {
    marginTop: 4,
  },
  replyButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  repliesContainer: {
    marginLeft: 40,
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#e8f5ee",
  },
  replyItem: {
    paddingVertical: 6,
  },
  replyAuthor: {
    fontWeight: "600",
    color: theme.greenDark,
    fontSize: 13,
  },
  replyText: {
    color: "#333",
    marginTop: 1,
    fontSize: 13,
    lineHeight: 16,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyingToContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e8f5ee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    color: theme.greenDark,
    fontSize: 12,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: theme.greenDark,
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
