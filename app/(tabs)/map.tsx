import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function MapScreen() {
  const [coords, setCoords] = useState<{lat:number; lng:number} | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permissão de localização negada");

      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      setCoords({ lat, lng });

      const [addr] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      setAddress(`${addr?.street ?? ""} ${addr?.name ?? ""} - ${addr?.district ?? ""} ${addr?.city ?? ""}`.trim());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text>Local do pet (simulado pelo seu GPS):</Text>
      <Text>Lat: {coords?.lat?.toFixed(6)}  Lng: {coords?.lng?.toFixed(6)}</Text>
      <Text>Endereço: {address || "—"}</Text>
      <Button title="Alerta de desaparecido" onPress={() => { /* implementar depois */ }} />
    </View>
  );
}
