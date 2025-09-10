import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import type { Post } from "../constants/mock";
import theme from "../constants/theme";

export default function PostCard({ post }: { post: Post }) {
  const imgs = (post.images || []).slice(0, 3);

  const Grid = () => {
    if (imgs.length === 0) return null;

    if (imgs.length === 1) {
      return (
        <Image source={{ uri: imgs[0] }} style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 12 }} />
      );
    }

    if (imgs.length === 2) {
      return (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Image source={{ uri: imgs[0] }} style={{ flex: 1, aspectRatio: 1.6, borderRadius: 12 }} />
          <Image source={{ uri: imgs[1] }} style={{ flex: 1, aspectRatio: 1.6, borderRadius: 12 }} />
        </View>
      );
    }

    return (
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Image source={{ uri: imgs[0] }} style={{ flex: 1, aspectRatio: 1, borderRadius: 12 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <Image source={{ uri: imgs[1] }} style={{ width: "100%", aspectRatio: 2.1, borderRadius: 12 }} />
          <Image source={{ uri: imgs[2] }} style={{ width: "100%", aspectRatio: 2.1, borderRadius: 12 }} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: theme.greenLight, borderRadius: 16, padding: 12, elevation: 2 }}>
      {/* header: usuário + horário */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#cfe3d3", marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", color: theme.greenDark }}>{post.user}</Text>
          <Text style={{ fontSize: 11, color: "#557" }}>publicado hoje às {post.createdAt}</Text>
        </View>
        {/* (Opcional) menu de ações do post */}
        <Ionicons name="ellipsis-horizontal" size={18} color={theme.greenDark} />
      </View>

      {!!post.text && (
        <Text style={{ marginBottom: imgs.length ? 8 : 0, color: theme.greenDark }}>{post.text}</Text>
      )}

      <Grid />

      {/* ações */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 18, marginTop: 8 }}>
        <TouchableOpacity><Ionicons name="heart-outline" size={20} color={theme.greenDark} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.greenDark} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="paper-plane-outline" size={20} color={theme.greenDark} /></TouchableOpacity>
      </View>
    </View>
  );
}
