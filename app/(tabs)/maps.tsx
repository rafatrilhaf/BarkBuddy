// app/(tabs)/Localizacao.tsx
import * as Location from "expo-location";
import { serverTimestamp } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Marker } from "../../components/Map";

import { auth } from "@/services/firebase";
import { subscribeMyPets, updatePet } from "services/pets";

type LastLocation = {
  latitude: number;
  longitude: number;
  updatedAt?: any;
  address?: string;
} | null;

type TrackablePet = {
  id: string;
  name?: string;
  lost?: boolean;
  lastLocation: LastLocation;
};

const FALLBACK_REGION = {
  latitude: -23.006,
  longitude: -46.841,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function toRegion(loc: LastLocation) {
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
  } catch {}
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
  const [isRealtime, setIsRealtime] = useState(false);

  // Dropdown
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  // Interval ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = useMemo(() => pets.find((p) => p.id === selectedId), [pets, selectedId]);
  const region = useMemo(() => toRegion(selected?.lastLocation ?? null), [selected]);
  const updatedText = useMemo(() => {
    const ts = fmtDateTime(selected?.lastLocation?.updatedAt);
    return ts === "—" ? "Sem atualização ainda" : `Atualizado pela última vez • ${ts}`;
  }, [selected]);
  const address = selected?.lastLocation?.address;

  // === Funções de controle de refresh ===
  function stopAutoRefresh() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRealtime(false);
  }

  function startAutoRefresh(ms: number) {
    stopAutoRefresh();
    intervalRef.current = setInterval(fetchAndUpdateLocation, ms);
  }

  async function fetchAndUpdateLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      if (!selected?.id) return;

      await updatePet(selected.id, {
        lastLocation: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          updatedAt: serverTimestamp(),
        },
      });
    } catch (e) {
      console.error("Erro ao atualizar localização", e);
    }
  }

  async function openMaps() {
    if (address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
      return;
    }
    const lat = selected?.lastLocation?.latitude ?? region.latitude;
    const lng = selected?.lastLocation?.longitude ?? region.longitude;
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  }

  // Quando troca de pet ou status, decide o intervalo
  useEffect(() => {
    if (!selected?.id) return;

    // Sempre atualiza imediatamente ao abrir
    fetchAndUpdateLocation();

    // Define intervalo baseado no estado do pet
    if (!selected.lost) {
      startAutoRefresh(30 * 60 * 1000); // 30 min
    } else {
      startAutoRefresh(10 * 60 * 1000); // 10 min
    }

    return () => stopAutoRefresh();
  }, [selected?.id, selected?.lost]);

  // Inscrição nos pets
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = subscribeMyPets(uid, (rows: any[]) => {
      const mapped: TrackablePet[] = rows.map((r) => ({
        id: r.id ?? "",
        name: r.name,
        lost: r.lost ?? false,
        lastLocation: r.lastLocation ?? null,
      }));
      setPets(mapped);
      setItems(mapped.map((p) => ({ label: p.name || `Pet ${p.id.slice(0, 5)}`, value: p.id })));
      setSelectedId((prev) => prev ?? mapped[0]?.id ?? null);
      setLoading(false);
    });

    return () => {
      try {
        unsubscribe?.();
      } catch {}
      stopAutoRefresh();
    };
  }, [uid]);

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
      {/* Header com Dropdown e Botão de alerta lado a lado */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
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
              borderColor: "#006B41",
              borderRadius: 12,
            }}
            dropDownContainerStyle={{
              borderColor: "#006B41",
              borderRadius: 12,
            }}
            textStyle={{ color: "#111", fontSize: 15, fontWeight: "500" }}
            placeholder="Selecione um pet"
          />
        </View>

        {selected && (
          <Pressable
            onPress={() => updatePet(selected.id, { lost: !selected.lost })}
            style={{
              backgroundColor: selected.lost ? "#DC2626" : "#22C55E",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              minWidth: 60,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
              {selected.lost ? "❌ Encontrado" : "🚨 Perdido"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Mapa */}
      <MapView key={selectedId ?? "map"} style={{ flex: 1, marginTop: 4 }} initialRegion={region}>
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title={selected?.name ? `${selected.name} está aqui!` : "Seu pet está aqui!"}
        />
      </MapView>

      {/* Painel inferior */}
      <View style={{ padding: 16, gap: 10 }}>
        <Text style={{ textAlign: "center", color: "#666" }}>{updatedText}</Text>

        {/* Botão para ver em tempo real */}
        <Pressable
          onPress={() => {
            if (isRealtime) {
              // Desliga tempo real
              if (!selected?.lost) {
                startAutoRefresh(30 * 60 * 1000);
              } else {
                startAutoRefresh(10 * 60 * 1000);
              }
              setIsRealtime(false);
            } else {
              // Liga tempo real
              startAutoRefresh(60 * 1000);
              setIsRealtime(true);
            }
          }}
          style={{
            backgroundColor: isRealtime ? "#F59E0B" : "#3B82F6",
            padding: 14,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", textAlign: "center" }}>
            {isRealtime ? "🔌 Parar tempo real" : "⚡ Ver em tempo real"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
