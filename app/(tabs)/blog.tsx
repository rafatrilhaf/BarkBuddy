import { FlatList, TextInput, View } from 'react-native';
import PostCard from '../components/PostCard';
import { posts } from '../constantes/mock';
import theme from '../constantes/theme';

export default function Blog() {
  return (
    <View style={{ flex:1, backgroundColor: theme.green }}>
      <View style={{ padding:16 }}>
        <TextInput placeholder="Pesquisar" placeholderTextColor="#577"
          style={{ backgroundColor: theme.greenLight, borderRadius:16, padding:12 }} />
      </View>
      <FlatList
        contentContainerStyle={{ gap:16, paddingHorizontal:16, paddingBottom:16 }}
        data={posts}
        keyExtractor={(i)=>i.id}
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </View>
  );
}
