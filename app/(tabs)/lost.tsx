import { FlatList, View } from 'react-native';
import LostPetCard from '../components/LostPetCard';
import { pets } from '../constantes/mock';

export default function Lost() {
  // mock: mistura de DESAPARECIDO e SEGURO
  const ordered = [...pets].sort((a,b)=> (a.status==='DESAPARECIDO'? -1:1) - (b.status==='DESAPARECIDO'? -1:1));
  return (
    <FlatList
      style={{ flex:1, backgroundColor:'#fff' }}
      contentContainerStyle={{ padding:16, gap:16 }}
      data={ordered}
      numColumns={2}
      columnWrapperStyle={{ gap:16 }}
      keyExtractor={(p)=>p.id}
      renderItem={({ item }) => (
        <View style={{ flex:1 }}>
          <LostPetCard pet={item} />
        </View>
      )}
    />
  );
}
