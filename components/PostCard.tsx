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
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
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
  const { t } = useLanguage();
  const { colors } = useTheme();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;
  const imgs = (post.images || []).slice(0, 3);

  // Carregar perfil do autor
  useEffect(() => {
    if (post.authorId) {
      getUser(post.authorId)
        .then(setAuthorProfile)
        .catch(console.error);
    }
  }, [post.authorId]);

  // Inscrever nos comentários quando modal abrir
  useEffect(() => {
    if (!showComments) return;
    const unsub = subscribeComments(post.id, setComments);
    return () => unsub();
  }, [showComments, post.id]);

  // Enviar comentário
  const handleComment = async () => {
    if (!currentUser) {
      Alert.alert(
        t("components.postCard.loginRequired"),
        t("components.postCard.loginToComment")
      );
      return;
    }
    if (!commentText.trim()) {
      Alert.alert(t("general.error"), t("components.postCard.writeCommentError"));
      return;
    }
    try {
      setLoading(true);
      await addComment(post.id, commentText);
      setCommentText("");
    } catch (e) {
      console.error(e);
      Alert.alert(t("general.error"), t("components.postCard.commentSendError"));
    } finally {
      setLoading(false);
    }
  };

  // Enviar reply
  const handleReply = async () => {
    if (!currentUser) {
      Alert.alert(
        t("components.postCard.loginRequired"),
        t("components.postCard.loginToReply")
      );
      return;
    }
    if (!replyText.trim()) {
      Alert.alert(t("general.error"), t("components.postCard.writeReplyError"));
      return;
    }
    try {
      setLoading(true);
      await addComment(post.id, replyText, replyingTo);
      setReplyText("");
      setReplyingTo(null);
    } catch (e) {
      console.error(e);
      Alert.alert(t("general.error"), t("components.postCard.replySendError"));
    } finally {
      setLoading(false);
    }
  };

  // Compartilhar post
  const handleShare = async () => {
    try {
      const shareMessage = t("components.postCard.shareMessage")
        .replace("{text}", post.text)
        .replace("{author}", authorProfile?.name || post.user);
      await Share.share({
        message: shareMessage,
        title: t("components.postCard.shareTitle"),
      });
    } catch (e) {
      console.error(e);
      Alert.alert(t("general.error"), t("components.postCard.shareError"));
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

  // Renderizar comentário e replies
  const renderComment = ({ item }: { item: Comment }) => {
    const replies = item.replies ?? [];
    return (
      <View style={styles.commentContainer}>
        <View style={styles.commentItem}>
          <View style={styles.commentHeader}>
            <View style={styles.commentAvatar}>
              {item.authorPhotoUrl ? (
                <Image source={{ uri: item.authorPhotoUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={16} color={colors.primaryDark} />
              )}
            </View>
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>{item.authorName}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              <TouchableOpacity
                onPress={() => setReplyingTo(item.id)}
                style={styles.replyButton}
              >
                <Text style={styles.replyButtonText}>
                  {t("components.postCard.reply")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map((reply) => (
              <View key={reply.id} style={styles.replyItem}>
                <View style={styles.commentHeader}>
                  <View style={[styles.commentAvatar, { width: 28, height: 28 }]}>
                    {reply.authorPhotoUrl ? (
                      <Image
                        source={{ uri: reply.authorPhotoUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={14} color={colors.primaryDark} />
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
  };

  return (
    <>
      <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
        {/* Header do post */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            {authorProfile?.photoUrl ? (
              <Image
                source={{ uri: authorProfile.photoUrl }}
                style={styles.authorAvatar}
              />
            ) : (
              <View
                style={[
                  styles.authorAvatar,
                  { backgroundColor: colors.background },
                ]}
              >
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.primaryLight }]}>
              {authorProfile?.name || post.user}
            </Text>
            <Text style={[styles.postTime, { color: colors.textSecondary }]}>
              {t("components.postCard.publishedToday")} {post.createdAt}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={colors.primaryDark}
            />
          </TouchableOpacity>
        </View>

        {/* Texto */}
        {post.text ? (
          <Text style={[styles.postText, { color: colors.text }]}>
            {post.text}
          </Text>
        ) : null}

        {/* Imagens */}
        <Grid />

        {/* Contador de comentários */}
        {comments.length > 0 && (
          <View style={styles.commentCounter}>
            <Text
              style={[styles.commentCountText, { color: colors.textSecondary }]}
            >
              {t("components.postCard.commentCountPlural").replace(
                "{count}",
                comments.length.toString()
              )}
            </Text>
          </View>
        )}

        {/* Ações */}
        <View
          style={[
            styles.actionsContainer,
            { borderTopColor: colors.primaryLight },
          ]}
        >
          <TouchableOpacity
            onPress={() => setShowComments(true)}
            style={styles.actionButton}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={colors.primaryLight}
            />
            <Text
              style={[styles.actionText, { color: colors.primaryLight }]}
            >
              {t("components.postCard.comment")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.actionButton}
          >
            <Ionicons
              name="paper-plane-outline"
              size={20}
              color={colors.primaryLight}
            />
            <Text
              style={[styles.actionText, { color: colors.primaryLight }]}
            >
              {t("components.postCard.share")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de comentários */}
      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.surface },
            ]}
          >
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
            </TouchableOpacity>
            <Text
              style={[styles.modalTitle, { color: colors.primaryDark }]}
            >
              {t("components.postCard.comments")}
            </Text>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={styles.emptyCommentsContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyCommentsText, { color: colors.textSecondary }]}
                >
                  {t("components.postCard.noCommentsYet")}
                </Text>
                <Text
                  style={[styles.emptyCommentsSubtext, { color: colors.textSecondary }]}
                >
                  {t("components.postCard.firstToComment")}
                </Text>
              </View>
            }
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.surface,
              },
            ]}
          >
            {replyingTo && (
              <View
                style={[
                  styles.replyingToContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={[styles.replyingToText, { color: colors.primaryDark }]}
                >
                  {t("components.postCard.replyingTo")}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                placeholder={
                  replyingTo
                    ? t("components.postCard.writeReply")
                    : t("components.postCard.writeComment")
                }
                value={replyingTo ? replyText : commentText}
                onChangeText={replyingTo ? setReplyText : setCommentText}
                multiline
                maxLength={500}
                style={[
                  styles.textInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.text,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={replyingTo ? handleReply : handleComment}
                disabled={
                  loading ||
                  !(replyingTo ? replyText.trim() : commentText.trim())
                }
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.primaryDark },
                  (loading ||
                    !(replyingTo ? replyText.trim() : commentText.trim())) && {
                    opacity: 0.5,
                  },
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
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatarContainer: { marginRight: 10 },
  authorAvatar: { width: 36, height: 36, borderRadius: 18 },
  defaultAvatar: { alignItems: "center", justifyContent: "center" },
  authorInfo: { flex: 1 },
  authorName: { fontWeight: "700", fontSize: 14 },
  postTime: { fontSize: 11 },
  postText: { marginBottom: 8, lineHeight: 20, fontSize: 15 },
  commentCounter: { marginTop: 8, paddingHorizontal: 4 },
  commentCountText: { fontSize: 12 },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 16 },
  actionText: { fontWeight: "500" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  emptyCommentsContainer: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  emptyCommentsText: { textAlign: "center", marginTop: 16, fontSize: 16, fontWeight: "600" },
  emptyCommentsSubtext: { textAlign: "center", marginTop: 4, fontSize: 14 },
  commentContainer: { marginBottom: 16 },
  commentItem: { paddingVertical: 8 },
  commentHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  commentContent: { flex: 1 },
  commentAuthor: { fontWeight: "700", fontSize: 14 },
  commentText: { marginTop: 2, lineHeight: 18 },
  replyButton: { marginTop: 4 },
  replyButtonText: { fontSize: 12, fontWeight: "500" },
  repliesContainer: { marginLeft: 40, marginTop: 8, paddingLeft: 16, borderLeftWidth: 2 },
  replyItem: { paddingVertical: 6 },
  replyAuthor: { fontWeight: "600", fontSize: 13 },
  replyText: { marginTop: 1, fontSize: 13, lineHeight: 16 },
  inputContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  replyingToContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 8 },
  replyingToText: { fontSize: 12, fontWeight: "500" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  textInput: { flex: 1, maxHeight: 100, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, fontSize: 16 },
  sendButton: { borderRadius: 20, padding: 10, justifyContent: "center", alignItems: "center" },
});
