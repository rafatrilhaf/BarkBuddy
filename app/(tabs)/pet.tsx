import { Image, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { pets } from '../constantes/mock';
import theme from '../constantes/theme';

export default function PetPage() {
  const pet = pets[0]; // mostra o primeiro do mock
  return (
    <View style={{ flex:1, backgroundColor:'#fff', padding:20 }}>
      <Image source={{ uri: pet.photoUrl }} style={{ width:160, height:160, borderRadius:80, alignSelf:'center' }} />
      <Text style={{ color: theme.green, fontSize:36, fontWeight:'900', textAlign:'center', marginTop:16 }}>
        {pet.name}, {pet.age}
      </Text>
      <Text style={{ textAlign:'center', marginBottom:12 }}>{pet.breed}</Text>

      <View style={{ alignItems:'center', marginVertical:6 }}>
        <QRCode value={`https://barkbuddy.app/pet/${pet.id}`} size={168} />
      </View>

      <View style={{ alignItems:'center', gap:6, marginTop:8 }}>
        <Text style={{ fontWeight:'700' }}>{pet.owner.name}</Text>
        <Text>{pet.owner.phone}</Text>
        <Text style={{ textAlign:'center' }}>{pet.owner.address}</Text>
      </View>

      <Pressable style={{ backgroundColor: theme.green, padding:14, borderRadius:16, marginTop:16 }}>
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>Editar informações</Text>
      </Pressable>
    </View>
  );
}
