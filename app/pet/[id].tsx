import { RouteProp } from '@react-navigation/native';
import { Button, Text, View } from 'react-native';

type PetTrackingProps = {
  route: RouteProp<{ params: { id: string } }, 'params'>;
};

export default function PetTracking({ route }: PetTrackingProps) {
  const { id } = route.params; // Assuming the pet ID is passed as a route parameter

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text>Seu pet está aqui!</Text>
      <Text>Última localização: [Location details here]</Text>
      <Button title="Alertar desaparecido" onPress={() => {/* Handle alert logic */}} />
    </View>
  );
}
