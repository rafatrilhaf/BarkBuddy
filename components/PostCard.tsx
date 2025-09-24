// components/PostCard.tsx
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
import { useLanguage } from "../contexts/LanguageContext";
import {
  addComment,
  countAllComments,
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
  const { t } = useLanguage();
  
  // Estados para comentários
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;
  const imgs = (post.images || []).slice(0, 3);

  // Carregar perfil do autor do post
  useEffect(() => {
    if (post.authorId) {
      getUser(post.authorId).then(setAuthorProfile).catch(console.error);
    }
  }, [post.authorId]);

  // Ouvir comentários em tempo real apenas quando o modal está aberto
  useEffect(() => {
    if (!showComments) return;

    const unsubscribe = subscribeComments(post.id, setComments);
    return () => unsubscribe();
  }, [showComments, post.id]);

  // Função enviar comentário principal
  const handleComment = async () => {
    if (!currentUser) {
      Alert.alert(t('components.postCard.loginRequired'), t('components.postCard.loginToComment'));
      return;
    }

    if (!commentText.trim()) {
      Alert.alert(t('general.error'), t('components.postCard.writeCommentError'));
      return;
    }

    try {
      setLoading(true);
      await addComment(post.id, commentText);
      setCommentText("");
    } catch (e) {
      console.error(e);
      Alert.alert(t('general.error'), t('components.postCard.commentSendError'));
    } finally {
      setLoading(false);
    }
  };

  // Função enviar reply
  const handleReply = async () => {
    if (!currentUser) {
      Alert.alert(t('components.postCard.loginRequired'), t('components.postCard.loginToReply'));
      return;
    }

    if (!replyText.trim()) {
      Alert.alert(t('general.error'), t('components.postCard.writeReplyError'));
      return;
    }

    try {
      setLoading(true);
      await addComment(post.id, replyText, replyingTo);
      setReplyText("");
      setReplyingTo(null);
    } catch (e) {
      console.error(e);
      Alert.alert(t('general.error'), t('components.postCard.replySendError'));
    } finally {
      setLoading(false);
    }
  };

  // Função compartilhar melhorada
  const handleShare = async () => {
    try {
      const shareMessage = t('components.postCard.shareMessage')
        .replace('{text}', post.text)
        .replace('{author}', authorProfile?.name || post.user);

      const result = await Share.share({
        message: shareMessage,
        title: t('components.postCard.shareTitle'),
      });

      if (result.action === Share.sharedAction) {
        console.log(t('components.postCard.shareSuccess'));
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      Alert.alert(t('general.error'), t('components.postCard.shareError'));
    }
  };

  // Grid de imagens (mantido para compatibilidade)
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
              <Text style={styles.replyButtonText}>{t('components.postCard.reply')}</Text>
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
                <View style={[styles.commentAvatar, { width: 28, height: 28 }]}>
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

  // Função para formatar contador de comentários
  const getCommentCountText = (count: number) => {
    if (count === 1) {
      return t('components.postCard.commentCount').replace('{count}', count.toString());
    }
    return t('components.postCard.commentCountPlural').replace('{count}', count.toString());
  };

  return (
    <>
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            {authorProfile?.photoUrl ? (
              <Image 
                source={{ uri: authorProfile.photoUrl }} 
                style={styles.authorAvatar} 
              />
            ) : (
              <View style={[styles.authorAvatar, styles.defaultAvatar]}>
                <Ionicons name="person" size={18} color={theme.greenDark} />
              </View>
            )}
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {authorProfile?.name || post.user}
            </Text>
            <Text style={styles.postTime}>
              {t('components.postCard.publishedToday')} {post.createdAt}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.greenDark} />
          </TouchableOpacity>
        </View>

        {/* Texto do Post */}
        {!!post.text && (
          <Text style={styles.postText}>
            {post.text}
          </Text>
        )}

        {/* Imagens (se existirem) */}
        <Grid />

        {/* Contador de comentários */}
        {comments.length > 0 && (
          <View style={styles.commentCounter}>
            <Text style={styles.commentCountText}>
              {getCommentCountText(countAllComments(comments))}
            </Text>
          </View>
        )}

        {/* Ações do Post (SEM LIKE) */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => setShowComments(true)}
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.greenDark} />
            <Text style={styles.actionText}>{t('components.postCard.comment')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.actionButton}
          >
            <Ionicons name="paper-plane-outline" size={20} color={theme.greenDark} />
            <Text style={styles.actionText}>{t('components.postCard.share')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Comentários */}
      <Modal visible={showComments} animationType="slide" onRequestClose={() => setShowComments(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="arrow-back" size={24} color={theme.greenDark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('components.postCard.comments')}</Text>
          </View>

          {/* Lista comentários */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={styles.emptyCommentsContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ccc" />
                <Text style={styles.emptyCommentsText}>
                  {t('components.postCard.noCommentsYet')}
                </Text>
                <Text style={styles.emptyCommentsSubtext}>
                  {t('components.postCard.firstToComment')}
                </Text>
              </View>
            }
          />

          {/* Input comentário/reply */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>{t('components.postCard.replyingTo')}</Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                placeholder={replyingTo ? t('components.postCard.writeReply') : t('components.postCard.writeComment')}
                value={replyingTo ? replyText : commentText}
                onChangeText={replyingTo ? setReplyText : setCommentText}
                multiline
                maxLength={500}
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={replyingTo ? handleReply : handleComment}
                disabled={loading || (replyingTo ? !replyText.trim() : !commentText.trim())}
                style={[
                  styles.sendButton, 
                  (loading || (!commentText.trim() && !replyText.trim())) && { opacity: 0.5 }
                ]}
              >
                {loading ? (
                  <Ionicons name="hourglass" size={20} color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: theme.greenLight,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  defaultAvatar: {
    backgroundColor: "#cfe3d3",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: "700",
    color: theme.greenDark,
    fontSize: 14,
  },
  postTime: {
    fontSize: 11,
    color: "#557",
  },
  postText: {
    marginBottom: 8,
    color: theme.greenDark,
    lineHeight: 20,
    fontSize: 15,
  },
  commentCounter: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  commentCountText: {
    fontSize: 12,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e8f5ee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: theme.greenDark,
    fontWeight: "500",
  },
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
  emptyCommentsContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyCommentsText: {
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCommentsSubtext: {
    color: "#999",
    textAlign: "center",
    marginTop: 4,
    fontSize: 14,
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
