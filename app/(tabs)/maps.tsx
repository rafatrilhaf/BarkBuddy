// app/(tabs)/Localizacao.tsx
import { Picker } from "@react-native-picker/picker"; // npx expo install @react-native-picker/picker
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "../../components/Map";
import theme from "../../constants/theme";

import { auth } from "@/services/firebase";
import { subscribeMyPets, updatePet } from "services/pets";

type LastLocation = {
  latitude: number;
  longitude: number;
  updatedAt?: any; // Date | number | Firestore Timestamp
  address?: string;
};

type TrackablePet = {
  id: string;
  name?: string;
  lost?: boolean;             // ✅ usa "lost" (igual no seu services)
  lastLocation?: LastLocation; // campo opcional (ajuste o nome no map se precisar)
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
    if (typeof val?.toDate === "function") return val.toDate(); // Firestore Timestamp
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
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // se não tiver usuário autenticado ainda
  useEffect(() => {
    if (!uid) {
      setLoading(false);
    }
  }, [uid]);

  // Assinatura em tempo real dos pets do usuário (usa a assinatura: userId + callback)
  useEffect(() => {
    if (!uid) return;
    setLoading(true);

    const unsubscribe = subscribeMyPets(uid, (rows: any[]) => {
      // mapeia campos comuns; ajuste "location" ou "lastLocation" conforme seu doc
      const mapped: TrackablePet[] = rows.map((r: any) => ({
        id: r.id ?? "",
        name: r.name,
        lost: r.lost ?? false,                                     // ✅ usa "lost"
        lastLocation: r.lastLocation ?? r.location ?? undefined,   // 👈 cobre 2 nomes possíveis
      }));

      setPets(mapped);
      setSelectedId((prev) => prev ?? mapped[0]?.id);
      setLoading(false);
    });

    return () => {
      try { unsubscribe && unsubscribe(); } catch { }
    };
  }, [uid]);

  const selected = useMemo(
    () => pets.find((p) => p.id === selectedId),
    [pets, selectedId]
  );

  const region = useMemo(() => toRegion(selected?.lastLocation), [selected]);

  const updatedText = useMemo(() => {
    const when = selected?.lastLocation?.updatedAt;
    const ts = fmtDateTime(when);
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
    const next = !selected?.lost;
    try {
      // ✅ usa campo "lost" (seu schema)
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
        <Text style={{ color: "#333", fontWeight: "700", fontSize: 18, textAlign: "center" }}>
          Faça login para ver seus pets
        </Text>
        <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>
          Não encontramos um usuário autenticado.
        </Text>
      </View>
    );
  }

  if (!pets.length) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#333", fontWeight: "700", fontSize: 18, textAlign: "center" }}>
          Você ainda não tem pets para rastrear
        </Text>
        <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>
          Cadastre um pet para começar a acompanhar a localização.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Seletor de Pet */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#fafafa",
            height: 44, // reduz altura do campo
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={selectedId ?? pets[0]?.id ?? ""}
            onValueChange={(val) => setSelectedId(String(val))}
            style={{ color: "#111", fontSize: 16, height: 44 }} // cor preta e altura menor
            itemStyle={{ color: "#111" }} // cor preta nos itens (iOS)
          >
            {pets.map((p) => (
              <Picker.Item key={p.id} label={p.name || `Pet ${p.id.slice(0, 5)}`} value={p.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Mapa — seu wrapper costuma aceitar initialRegion (não region) */}
      <MapView
        key={selectedId ?? "map"}
        style={{ flex: 1 }}
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
            {address
              ? address
              : `${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)} (abrir no mapa)`}
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
