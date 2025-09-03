// app/(tabs)/Localizacao.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Marker } from "../../components/Map";
import theme from "../../constants/theme";

import { auth } from "@/services/firebase";
import { subscribeMyPets, updatePet } from "services/pets";

type LastLocation = {
  latitude: number;
  longitude: number;
  updatedAt?: any;
  address?: string;
};

type TrackablePet = {
  id: string;
  name?: string;
  lost?: boolean;
  lastLocation?: LastLocation;
};

const FALLBACK_REGION = {
  latitude: -23.006,
  longitude: -46.841,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function toRegion(loc?: LastLocation) {
  if (!loc) return FALLBACK_REGION;
  return {
    latitude: typeof loc.latitude === "number" ? loc.latitude : FALLBACK_REGION.latitude,
    longitude: typeof loc.longitude === "number" ? loc.longitude : FALLBACK_REGION.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
}

function toDate(val: any): Date | null {
  try {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === "number") return new Date(val);
    if (typeof val?.toDate === "function") return val.toDate();
  } catch { }
  return null;
}

function fmtDateTime(val: any) {
  const d = toDate(val);
  if (!d) return "—";
  const dt = d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return dt.replace(".", "");
}

export default function Localizacao() {
  const uid = auth?.currentUser?.uid;
  const [pets, setPets] = useState<TrackablePet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = subscribeMyPets(uid, (rows: any[]) => {
      const mapped: TrackablePet[] = rows.map(r => ({
        id: r.id ?? "",
        name: r.name,
        lost: r.lost ?? false,
        lastLocation: r.lastLocation ?? r.location ?? undefined,
      }));

      setPets(mapped);
      setItems(mapped.map(p => ({ label: p.name || `Pet ${p.id.slice(0, 5)}`, value: p.id })));
      setSelectedId(prev => prev ?? mapped[0]?.id ?? null);
      setLoading(false);
    });

    return () => { try { unsubscribe?.(); } catch { } };
  }, [uid]);

  const selected = useMemo(() => pets.find(p => p.id === selectedId), [pets, selectedId]);
  const region = useMemo(() => toRegion(selected?.lastLocation), [selected]);
  const updatedText = useMemo(() => {
    const ts = fmtDateTime(selected?.lastLocation?.updatedAt);
    return ts === "—" ? "Sem atualização ainda" : `Atualizado pela última vez • ${ts}`;
  }, [selected]);
  const address = selected?.lastLocation?.address;

  async function openMaps() {
    if (address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
      return;
    }
    const lat = selected?.lastLocation?.latitude ?? region.latitude;
    const lng = selected?.lastLocation?.longitude ?? region.longitude;
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  }

  async function toggleLost() {
    if (!selected?.id) return;
    const next = !selected.lost;
    try {
      await updatePet(selected.id, { lost: next });
      Alert.alert(
        next ? "Alerta ativado" : "Alerta desativado",
        next
          ? "Seu pet foi marcado como desaparecido. Vamos alertar sua rede."
          : "Seu pet foi marcado como encontrado."
      );
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Não foi possível atualizar o status do pet.");
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12, color: "#666" }}>Carregando seus pets…</Text>
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#333", fontWeight: "700", fontSize: 18, textAlign: "center" }}>Faça login para ver seus pets</Text>
        <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>Não encontramos um usuário autenticado.</Text>
      </View>
    );
  }

  if (!pets.length) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#333", fontWeight: "700", fontSize: 18, textAlign: "center" }}>Você ainda não tem pets para rastrear</Text>
        <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>Cadastre um pet para começar a acompanhar a localização.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Dropdown de Pet */}
<View style={{ paddingHorizontal: 16, paddingTop: 8, marginBottom: 12 }}>
  <DropDownPicker
    open={open}
    value={selectedId}
    items={items}
    setOpen={setOpen}
    setValue={setSelectedId}
    setItems={setItems}
    containerStyle={{ height: 40 }}
    style={{ 
      backgroundColor: "#fafafa", 
      borderColor: "#006B41", // cor do app
      borderRadius: 12 
    }}
    dropDownContainerStyle={{ 
      borderColor: "#006B41", 
      borderRadius: 12 
    }}
    textStyle={{ color: "#111", fontSize: 15, fontWeight: "500" }}
    placeholder="Selecione um pet"
  />
</View>

{/* Mapa */}
<MapView
  key={selectedId ?? "map"}
  style={{ flex: 1, marginTop: 4 }} // deixa um pouquinho de espaçamento no topo
  initialRegion={region}
>
  <Marker
    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
    title={selected?.name ? `${selected.name} está aqui!` : "Seu pet está aqui!"}
  />
</MapView>



      {/* Painel inferior */}
      <View style={{ padding: 16, gap: 10 }}>
        <Text style={{ textAlign: "center", color: "#666" }}>{updatedText}</Text>

        <Pressable onPress={openMaps}>
          <Text
            style={{
              textAlign: "center",
              color: theme.green,
              fontWeight: "900",
              textDecorationLine: "underline",
              marginVertical: 10,
            }}
            numberOfLines={2}
          >
            {address ? address : `${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)} (abrir no mapa)`}
          </Text>
        </Pressable>

        <Pressable
          onPress={toggleLost}
          style={{
            backgroundColor: selected?.lost ? "#EF4444" : theme.accent,
            padding: 14,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", textAlign: "center" }}>
            {selected?.lost ? "Cancelar alerta 🔕" : "Alerta de desaparecido 🔔"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
