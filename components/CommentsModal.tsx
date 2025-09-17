import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import theme from "../constants/theme";
import { addComment, Comment, subscribeComments } from "../services/comments";

type CommentsModalProps = {
  postId: string;
  visible: boolean;
  onClose: () => void;
};

export default function CommentsModal({ postId, visible, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const unsubscribe = subscribeComments(postId, setComments);
    return () => unsubscribe();
  }, [visible, postId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      setSending(true);
      await addComment(postId, text);
      setText("");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      alert("Erro ao enviar comentário");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentAuthor}>{item.authorName}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={theme.greenDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Comentários</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum comentário ainda. Seja o primeiro!</Text>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={90}
        >
          <View style={styles.inputContainer}>
            <TextInput
              multiline
              placeholder="Escreva um comentário..."
              value={text}
              onChangeText={setText}
              editable={!sending}
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending || !text.trim()}
              style={[styles.sendButton, (sending || !text.trim()) && { opacity: 0.5 }]}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  closeBtn: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: "700", color: theme.greenDark },

  commentsList: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },

  commentItem: {
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  commentAuthor: { fontWeight: "700", color: theme.greenDark, marginBottom: 2 },
  commentText: { color: "#333" },

  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fafafa",
    alignItems: "flex-end",
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
    marginLeft: 10,
    backgroundColor: theme.greenDark,
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
