import { Image, Pressable, Text } from 'react-native';
import type { Pet } from '../constants/mock';
import theme from '../constants/theme';

export default function PetCard({ pet, onPress }: { pet: Pet; onPress?: () => void }) {
  const tagColor = pet.status === 'SEGURO' ? '#ffd24d' : '#ff8a80';
  const bg = pet.status === 'SEGURO' ? '#fff6d9' : '#ffe0e0';

  return (
    <Pressable onPress={onPress} style={{ backgroundColor: bg, borderRadius: 18, padding: 12 }}>
      <Text style={{ alignSelf:'flex-start', backgroundColor: tagColor, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontWeight:'800' }}>
        {pet.status}
      </Text>
      <Image source={{ uri: pet.photoUrl }} style={{ width:'100%', height:160, borderRadius:12, marginVertical:8 }} />
      <Text style={{ fontWeight:'800', color: theme.green }}>{pet.name}</Text>
      <Text style={{ color:'#555' }}>{pet.breed}, {pet.age} anos</Text>
      <Pressable style={{ backgroundColor: theme.green, padding:10, borderRadius:14, marginTop:10 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'800' }}>
          {pet.status==='DESAPARECIDO' ? 'Achei seu pet!' : 'Ver detalhes'}
        </Text>
      </Pressable>
    </Pressable>
  );
}
