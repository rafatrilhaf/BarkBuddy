import { Image, Text, View } from 'react-native';
import type { Post } from '../constants/mock';
import theme from '../constants/theme';

export default function PostCard({ post }: { post: Post }) {
  return (
    <View style={{ backgroundColor: theme.greenLight, borderRadius:16, padding:12 }}>
      <Text style={{ fontWeight:'700', marginBottom:6 }}>{post.user}</Text>
      <Text style={{ marginBottom:8 }}>{post.text}</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        {post.images.map((uri, i)=>(
          <Image key={i} source={{ uri }} style={{ width:'48%', aspectRatio:16/9, borderRadius:12 }} />
        ))}
      </View>
      <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:16, marginTop:8 }}>
        <Text>♡</Text><Text>💬</Text><Text>🔁</Text>
      </View>
    </View>
  );
}
