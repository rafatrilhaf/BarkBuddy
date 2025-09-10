// app/(tabs)/Localizacao.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";
import { serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Circle, Marker, UrlTile } from "react-native-maps";

import { auth } from "@/services/firebase";
import { subscribeMyPets, updatePet } from "services/pets";

type LastLocation = {
  latitude: number;
  longitude: number;
  updatedAt?: any;
  address?: string;
  accuracy?: number;
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

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

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

function timeAgo(val: any): string {
  const d = toDate(val);
  if (!d) return "Nunca";
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `${minutes} min atrás`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  
  const days = Math.floor(hours / 24);
  return `${days} dias atrás`;
}

export default function Localizacao() {
  const uid = auth?.currentUser?.uid;
  const [pets, setPets] = useState<TrackablePet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isCentered, setIsCentered] = useState(false); // ✅ NOVO: estado do botão centralizar

  // Dropdown
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  // Interval ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView>(null);

  const selected = useMemo(() => pets.find((p) => p.id === selectedId), [pets, selectedId]);
  const region = useMemo(() => toRegion(selected?.lastLocation ?? null), [selected]);
  
  const updatedText = useMemo(() => {
    const timeAgoText = timeAgo(selected?.lastLocation?.updatedAt);
    const fmtText = fmtDateTime(selected?.lastLocation?.updatedAt);
    return fmtText === "—" ? "Sem atualização ainda" : `${timeAgoText} • ${fmtText}`;
  }, [selected]);
  
  const address = selected?.lastLocation?.address;

  // Funções de controle de refresh
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
    if (!selected?.id) return;
    
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Autorize o acesso à localização para rastrear seu pet.");
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // ✅ Tratamento robusto do accuracy
      const locationData: any = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        updatedAt: serverTimestamp(),
      };

      if (typeof loc.coords.accuracy === 'number' && loc.coords.accuracy > 0) {
        locationData.accuracy = loc.coords.accuracy;
      }

      await updatePet(selected.id, {
        lastLocation: locationData,
      });

      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }

    } catch (e) {
      console.error("Erro ao atualizar localização", e);
      Alert.alert("Erro", "Não foi possível obter a localização. Verifique se o GPS está ativado.");
    } finally {
      setLocationLoading(false);
    }
  }

  async function openMaps() {
    if (!selected?.lastLocation) {
      Alert.alert("Sem localização", "Não há localização disponível para este pet.");
      return;
    }

    const lat = selected.lastLocation.latitude;
    const lng = selected.lastLocation.longitude;
    const label = encodeURIComponent(selected.name || "Pet");
    
    Alert.alert(
      "Abrir mapa",
      "Escolha onde abrir a localização:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Google Maps", 
          onPress: () => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}&label=${label}`)
        },
        { 
          text: "OpenStreetMap", 
          onPress: () => Linking.openURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`)
        },
        { 
          text: "Waze", 
          onPress: () => Linking.openURL(`waze://?ll=${lat},${lng}&navigate=yes`)
        }
      ]
    );
  }

  // ✅ MELHORADO: Centralizar com feedback visual
  function centerOnPet() {
    if (!selected?.lastLocation || !mapRef.current || !mapReady) return;
    
    setIsCentered(true); // ✅ Ativa indicador visual
    
    mapRef.current.animateToRegion({
      latitude: selected.lastLocation.latitude,
      longitude: selected.lastLocation.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);

    // ✅ Remove indicador após 3 segundos
    setTimeout(() => {
      setIsCentered(false);
    }, 3000);
  }

  async function togglePetStatus() {
    if (!selected) return;
    
    const newStatus = !selected.lost;
    const action = newStatus ? "perdido" : "encontrado";
    
    Alert.alert(
      `Marcar como ${action}`, 
      `Deseja marcar ${selected.name} como ${action}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await updatePet(selected.id, { lost: newStatus });
              Alert.alert("Sucesso", `${selected.name} marcado como ${action}.`);
            } catch (e) {
              Alert.alert("Erro", "Não foi possível atualizar o status.");
            }
          }
        }
      ]
    );
  }

  // Lógica de atualização baseada no status
  useEffect(() => {
    if (!selected?.id) return;

    fetchAndUpdateLocation();

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
      setItems(mapped.map((p) => ({ 
        label: `${p.lost ? "🚨 " : ""}${p.name || `Pet ${p.id.slice(0, 5)}`}`, 
        value: p.id 
      })));
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#006B41" />
        <Text style={styles.loadingText}>Carregando seus pets…</Text>
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        <Text style={styles.errorTitle}>Faça login para ver seus pets</Text>
        <Text style={styles.errorSubtitle}>Não encontramos um usuário autenticado.</Text>
      </View>
    );
  }

  if (!pets.length) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="paw-outline" size={80} color="#ccc" />
        <Text style={styles.errorTitle}>Nenhum pet cadastrado</Text>
        <Text style={styles.errorSubtitle}>Cadastre um pet para começar a acompanhar a localização.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ HEADER MELHORADO: dropdown e botão com mesma altura */}
      <View style={styles.header}>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={selectedId}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedId}
            setItems={setItems}
            containerStyle={{ height: 46 }} // ✅ Altura aumentada
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            textStyle={styles.dropdownText}
            placeholder="Selecione um pet"
          />
        </View>

        {selected && (
          <Pressable
            onPress={togglePetStatus}
            style={[
              styles.statusButton,
              { backgroundColor: selected.lost ? "#DC2626" : "#22C55E" }
            ]}
          >
            <Text style={styles.statusButtonText}>
              {selected.lost ? "❌ Encontrado" : "🚨 Perdido"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Mapa com OpenStreetMap */}
      <View style={styles.mapContainer}>
        {!mapReady && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color="#006B41" />
            <Text style={styles.mapLoadingText}>Carregando mapa...</Text>
          </View>
        )}
        
        <MapView 
          ref={mapRef}
          key={selectedId ?? "osm-map"} 
          style={styles.map} 
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onMapReady={() => setMapReady(true)}
          mapType="none"
        >
          <UrlTile
            urlTemplate={OSM_TILE_URL}
            maximumZ={19}
            flipY={false}
          />

          {selected?.lastLocation && (
            <>
              <Marker
                coordinate={{ 
                  latitude: selected.lastLocation.latitude, 
                  longitude: selected.lastLocation.longitude 
                }}
                title={selected?.name ? `${selected.name} está aqui!` : "Seu pet está aqui!"}
                description={updatedText}
                pinColor={selected.lost ? "#DC2626" : "#22C55E"}
              />
              
              {selected.lastLocation.accuracy && (
                <Circle
                  center={{
                    latitude: selected.lastLocation.latitude,
                    longitude: selected.lastLocation.longitude,
                  }}
                  radius={selected.lastLocation.accuracy}
                  fillColor="rgba(0, 107, 65, 0.1)"
                  strokeColor="rgba(0, 107, 65, 0.5)"
                  strokeWidth={1}
                />
              )}
            </>
          )}
        </MapView>
      </View>

      {/* Painel inferior */}
      <View style={styles.bottomPanel}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusIndicator, { 
            color: selected?.lost ? "#DC2626" : "#22C55E" 
          }]}>
            {selected?.lost ? "🚨 Pet perdido" : "✅ Pet seguro"}
          </Text>
          {locationLoading && <ActivityIndicator size="small" color="#666" />}
        </View>
        
        <Text style={styles.updatedText}>{updatedText}</Text>

        {/* ✅ BOTÕES DE AÇÃO MELHORADOS */}
        <View style={styles.actionRow}>
          <Pressable 
            onPress={fetchAndUpdateLocation} 
            style={styles.actionButton}
            disabled={locationLoading}
          >
            <Ionicons name="refresh" size={20} color="#006B41" />
            <Text style={styles.actionButtonText}>
              {locationLoading ? "..." : "Atualizar"}
            </Text>
          </Pressable>

          {/* ✅ BOTÃO CENTRALIZAR MELHORADO com indicador visual */}
          <Pressable onPress={centerOnPet} style={[
            styles.actionButton,
            isCentered && styles.actionButtonActive // ✅ Estilo ativo
          ]}>
            <Ionicons 
              name={isCentered ? "radio-button-on" : "locate"} 
              size={20} 
              color={isCentered ? "#22C55E" : "#006B41"} 
            />
            <Text style={[
              styles.actionButtonText,
              isCentered && styles.actionButtonTextActive
            ]}>
              {isCentered ? "Centralizado" : "Centralizar"}
            </Text>
          </Pressable>

          <Pressable onPress={openMaps} style={styles.actionButton}>
            <Ionicons name="map" size={20} color="#006B41" />
            <Text style={styles.actionButtonText}>Abrir</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            if (isRealtime) {
              if (!selected?.lost) {
                startAutoRefresh(30 * 60 * 1000);
              } else {
                startAutoRefresh(10 * 60 * 1000);
              }
              setIsRealtime(false);
            } else {
              startAutoRefresh(60 * 1000);
              setIsRealtime(true);
            }
          }}
          style={[
            styles.realtimeButton,
            { backgroundColor: isRealtime ? "#F59E0B" : "#3B82F6" }
          ]}
        >
          <Ionicons 
            name={isRealtime ? "pause-circle" : "play-circle"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.realtimeButtonText}>
            {isRealtime ? "Parar tempo real (1 min)" : "Tempo real (1 min)"}
          </Text>
        </Pressable>

        <Text style={styles.osmCredit}>
          Mapas fornecidos por OpenStreetMap
        </Text>
      </View>
    </View>
  );
}

// ✅ STYLES ATUALIZADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  errorTitle: {
    color: "#333",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
  },
  errorSubtitle: {
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
    gap: 12, // ✅ Espaçamento aumentado
  },
  dropdownContainer: {
    flex: 1, // ✅ Ocupa espaço restante
  },
  dropdown: {
    backgroundColor: "#fafafa",
    borderColor: "#006B41",
    borderRadius: 12,
    height: 46, // ✅ Mesma altura do botão
  },
  dropdownList: {
    borderColor: "#006B41",
    borderRadius: 12,
  },
  dropdownText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "500",
  },
  statusButton: {
    paddingHorizontal: 16, // ✅ Largura aumentada
    paddingVertical: 12,   // ✅ Altura aumentada
    borderRadius: 12,
    width: 120, // ✅ Largura fixa
    height: 46, // ✅ Mesma altura do dropdown
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13, // ✅ Fonte ligeiramente maior
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1000,
  },
  mapLoadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
    padding: 16,
    gap: 12,
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusIndicator: {
    fontSize: 16,
    fontWeight: "600",
  },
  updatedText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#006B41",
    gap: 4,
  },
  // ✅ NOVO: Estilo ativo para botão centralizar
  actionButtonActive: {
    backgroundColor: "#e8f5ee",
    borderColor: "#22C55E",
  },
  actionButtonText: {
    color: "#006B41",
    fontWeight: "600",
    fontSize: 12,
  },
  // ✅ NOVO: Texto ativo para botão centralizar
  actionButtonTextActive: {
    color: "#22C55E",
  },
  realtimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  realtimeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  osmCredit: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    marginTop: 4,
  },
});
