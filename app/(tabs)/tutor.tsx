import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { owner } from '../../constants/mock';
import theme from '../../constants/theme';

export default function Tutor() {
  return (
    <View style={{ flex:1, backgroundColor:'#fff', padding:20 }}>
      <Pressable onPress={()=>router.push('../web/about')} style={{ position:'absolute', top:12, right:12, padding:8, backgroundColor: theme.green, borderRadius:999 }}>
        <Text style={{ color:'#fff' }}>💬</Text>
      </Pressable>

      <Image source={{ uri: 'https://i.pravatar.cc/300' }} style={{ width:140, height:140, borderRadius:100, alignSelf:'center' }} />
      <Text style={{ color: theme.green, fontSize:32, fontWeight:'900', textAlign:'center', marginTop:12 }}>{owner.name}</Text>

      <View style={{ gap:10, marginTop:12, alignItems:'center' }}>
        <Text>{owner.phone}</Text>
        <Text style={{ textAlign:'center' }}>{owner.address}</Text>
        <Text>{owner.email}</Text>
      </View>

      <Pressable style={{ backgroundColor: theme.green, padding:14, borderRadius:16, marginTop:16 }}>
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>Editar informações</Text>
      </Pressable>
    </View>
  );
}
