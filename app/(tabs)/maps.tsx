import { Linking, Pressable, Text, View } from "react-native";
import MapView, { Marker } from "../../components/Map";
import theme from "../../constants/theme";


export default function Localizacao() {
  const region = { latitude: -23.006, longitude: -46.841, latitudeDelta: 0.01, longitudeDelta: 0.01 };
  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <MapView style={{ flex:1 }} initialRegion={region}><Marker coordinate={region} title="Seu pet está aqui!" /></MapView>
      <View style={{ padding:16 }}>
        <Text style={{ textAlign:'center', color:'#666' }}>Atualizado pela última vez às 10:01 • 18/ago</Text>
        <Pressable onPress={()=>Linking.openURL('https://maps.google.com/?q=R.+Alfredo+Massareti,+191,+Itatiba')}>
          <Text style={{ textAlign:'center', color: theme.green, fontWeight:'900', textDecorationLine:'underline', marginVertical:10 }}>
            R. Alfredo Massareti, 191 - Itatiba/SP, 13251-360
          </Text>
        </Pressable>
        <Pressable style={{ backgroundColor: theme.accent, padding:14, borderRadius:16 }}>
          <Text style={{ color:'#fff', fontWeight:'900', textAlign:'center' }}>Alerta de desaparecido 🔔</Text>
        </Pressable>
      </View>
    </View>
  );
}
