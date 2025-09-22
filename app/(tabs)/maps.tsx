// app/(tabs)/maps.tsx - VERSÃO HÍBRIDA WebView Android + MapView iOS - INTERNACIONALIZADA
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { Circle, Marker } from "react-native-maps";
import { WebView } from 'react-native-webview';

import { auth, db } from "@/services/firebase";
import { subscribeMyPets, updatePet } from "services/pets";
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

// ================== INTERFACES ==================
interface GeofenceZone {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  color: string;
  type: 'circle' | 'polygon';
  coordinates?: Array<{ latitude: number; longitude: number }>;
  createdAt: any;
  petId: string;
}

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

// Tipo para função de tradução flexível
type TranslationFunction = (key: string) => string;

// ================== CONSTANTES ==================
const FALLBACK_REGION = {
  latitude: -23.006,
  longitude: -46.841,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// ================== FUNÇÕES UTILITÁRIAS INTERNACIONALIZADAS ==================
function calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
  const R = 6371000;
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isInsideZone(petLocation: { latitude: number; longitude: number }, zone: GeofenceZone): boolean {
  const distance = calculateDistance(petLocation, zone.center);
  return distance <= zone.radius;
}

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

// Função internacionalizada para formatação de data
function fmtDateTime(val: any, language: string = 'pt') {
  const d = toDate(val);
  if (!d) return "—";
  
  const locales = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES'
  };
  
  const dt = d.toLocaleString(locales[language as keyof typeof locales] || 'pt-BR', {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return dt.replace(".", "");
}

// Função internacionalizada para tempo decorrido
function timeAgo(val: any, translate: TranslationFunction): string {
  const d = toDate(val);
  if (!d) return translate('maps.never');

  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return translate('maps.justNow');
  if (minutes < 60) return `${minutes} ${translate('maps.minutesAgo')}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${translate('maps.hoursAgo')}`;

  const days = Math.floor(hours / 24);
  return `${days} ${translate('maps.daysAgo')}`;
}

// ✅ FUNÇÃO PARA GERAR HTML DO MAPA LEAFLET INTERNACIONALIZADA (ANDROID)
function generateMapHTML(location: LastLocation, zones: GeofenceZone[], translate: TranslationFunction): string {
  const lat = location?.latitude || FALLBACK_REGION.latitude;
  const lng = location?.longitude || FALLBACK_REGION.longitude;

  const zonesJS = zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    lat: zone.center.latitude,
    lng: zone.center.longitude,
    radius: zone.radius,
    color: zone.color
  }));

  return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-div-icon {
            background: none;
            border: none;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Inicializar mapa
        var map = L.map('map').setView([${lat}, ${lng}], 16);

        // Tile layer OpenStreetMap
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Marcador do pet
        ${location ? `
        var petIcon = L.divIcon({
            html: '<div style="background: #F59E0B; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            className: 'custom-div-icon'
        });
        L.marker([${lat}, ${lng}], {icon: petIcon})
         .addTo(map)
         .bindPopup('${translate('maps.petHere')}');
        ` : ''}

        // Zonas de segurança
        var zones = ${JSON.stringify(zonesJS)};
        zones.forEach(function(zone) {
            L.circle([zone.lat, zone.lng], {
                radius: zone.radius,
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map).bindPopup('${translate('maps.zoneLabel')} ' + zone.name);
        });

        // Comunicação com React Native
        function sendMessage(type, data) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: type,
                    data: data
                }));
            }
        }

        // Capturar cliques no mapa
        map.on('click', function(e) {
            sendMessage('mapPress', {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            });
        });

        // Centralizar no pet
        function centerOnPet() {
            map.setView([${lat}, ${lng}], 17);
        }

        // Adicionar zona (será chamado do React Native)
        function addZone(zone) {
            L.circle([zone.center.latitude, zone.center.longitude], {
                radius: zone.radius,
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map).bindPopup('${translate('maps.zoneLabel')} ' + zone.name);
        }
    </script>
</body>
</html>`;
}

// Função para substituir placeholders nas strings de tradução
function replacePlaceholders(text: string, placeholders: { [key: string]: string }): string {
  let result = text;
  Object.keys(placeholders).forEach(key => {
    result = result.replace(`{${key}}`, placeholders[key]);
  });
  return result;
}

// ================== COMPONENTE PRINCIPAL ==================
export default function Localizacao() {
  const { colors, fontSizes } = useTheme();
  const { t, language } = useLanguage();
  
  // Criar wrapper da função de tradução para compatibilidade de tipos
  const translate: TranslationFunction = (key: string) => t(key as any);
  
  const uid = auth?.currentUser?.uid;
  const [pets, setPets] = useState<TrackablePet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isCentered, setIsCentered] = useState(false);

  // Estados para Geofencing
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [creatingZone, setCreatingZone] = useState(false);
  const [newZoneCenter, setNewZoneCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newZoneRadius, setNewZoneRadius] = useState(100);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [selectedZoneColor, setSelectedZoneColor] = useState("#22C55E");
  const [showZoneManager, setShowZoneManager] = useState(false);

  // Dropdown
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  // Referencias
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView>(null);
  const webViewRef = useRef<WebView>(null);

  // Computadas
  const selected = useMemo(() => pets.find((p) => p.id === selectedId), [pets, selectedId]);
  const region = useMemo(() => toRegion(selected?.lastLocation ?? null), [selected]);

  // Status inteligente baseado em zona - INTERNACIONALIZADO
  const petLocationStatus = useMemo(() => {
    if (!selected?.lastLocation || zones.length === 0) {
      return {
        text: fmtDateTime(selected?.lastLocation?.updatedAt, language) === "—" 
          ? t('maps.noLocation')
          : `${t('maps.lastSeen')} ${timeAgo(selected?.lastLocation?.updatedAt, translate)}`,
        inZone: false,
        zoneName: null
      };
    }

    const currentZone = zones.find(zone => 
      isInsideZone(selected.lastLocation!, zone)
    );

    if (currentZone) {
      const timeAgoText = timeAgo(selected.lastLocation.updatedAt, translate);
      return {
        text: `${t('maps.inZone')} "${currentZone.name}" • ${timeAgoText}`,
        inZone: true,
        zoneName: currentZone.name
      };
    } else {
      const timeAgoText = timeAgo(selected.lastLocation.updatedAt, translate);
      const fmtText = fmtDateTime(selected.lastLocation.updatedAt, language);
      return {
        text: fmtText === "—" ? t('maps.noLocation') : `${t('maps.outsideZones')} • ${timeAgoText}`,
        inZone: false,
        zoneName: null
      };
    }
  }, [selected, zones, t, translate, language]);

  // Cores disponíveis para zonas - INTERNACIONALIZADO
  const zoneColors = useMemo(() => [
    { name: t('maps.colorGreen'), value: "#22C55E" },
    { name: t('maps.colorBlue'), value: "#3B82F6" },
    { name: t('maps.colorRed'), value: "#EF4444" },
    { name: t('maps.colorYellow'), value: "#F59E0B" },
    { name: t('maps.colorPurple'), value: "#8B5CF6" },
    { name: t('maps.colorPink'), value: "#EC4899" }
  ], [t]);

  // ✅ HANDLER PARA MENSAGENS DO WEBVIEW (ANDROID)
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'mapPress' && creatingZone) {
        setNewZoneCenter({
          latitude: message.data.latitude,
          longitude: message.data.longitude
        });
        setZoneModalVisible(true);
      }
    } catch (e) {
      console.error('Erro ao processar mensagem do WebView:', e);
    }
  };

  // ================== FUNÇÕES DE UI INTERNACIONALIZADAS ==================

  const startCreatingZone = () => {
    setCreatingZone(true);
    Alert.alert(
      t('maps.createSafeZone'),
      t('maps.createSafeZoneDesc'),
      [
        { 
          text: t('general.cancel'), 
          onPress: () => {
            setCreatingZone(false);
            setNewZoneCenter(null);
            setZoneName("");
            setNewZoneRadius(100);
            setSelectedZoneColor("#22C55E");
          }
        },
        { text: t('button.ok') }
      ]
    );
  };

  const resetZoneCreation = () => {
    setZoneModalVisible(false);
    setCreatingZone(false);
    setNewZoneCenter(null);
    setZoneName("");
    setNewZoneRadius(100);
    setSelectedZoneColor("#22C55E");
  };

  const cancelZoneCreation = () => {
    resetZoneCreation();
  };

  const handleMapPress = (event: any) => {
    if (creatingZone && Platform.OS === 'ios') {
      setNewZoneCenter(event.nativeEvent.coordinate);
      setZoneModalVisible(true);
    }
  };

  const confirmCreateZone = async () => {
    if (!newZoneCenter || !zoneName.trim()) {
      Alert.alert(t('general.error'), t('maps.provideZoneName'));
      return;
    }

    const newZone: Omit<GeofenceZone, 'id'> = {
      name: zoneName.trim(),
      center: newZoneCenter,
      radius: newZoneRadius,
      color: selectedZoneColor,
      type: 'circle',
      petId: selectedId!,
      createdAt: new Date().toISOString()
    };

    await saveZone(newZone);
    resetZoneCreation();
    Alert.alert(
      t('maps.zoneCreatedSuccess'), 
      replacePlaceholders(t('maps.zoneCreatedDesc'), { zoneName: zoneName.trim() })
    );
  };

  async function openMaps() {
    if (!selected?.lastLocation) {
      Alert.alert(t('maps.noLocationForPet'), t('maps.noLocationForPetDesc'));
      return;
    }

    const lat = selected.lastLocation.latitude;
    const lng = selected.lastLocation.longitude;
    const label = encodeURIComponent(selected.name || "Pet");

    Alert.alert(
      t('maps.openMap'),
      t('maps.chooseMapApp'),
      [
        { text: t('general.cancel'), style: "cancel" },
        { 
          text: t('maps.googleMaps'), 
          onPress: () => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}&label=${label}`)
        },
        { 
          text: t('maps.openStreetMap'), 
          onPress: () => Linking.openURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`)
        },
        { 
          text: t('maps.waze'), 
          onPress: () => Linking.openURL(`waze://?ll=${lat},${lng}&navigate=yes`)
        }
      ]
    );
  }

  function centerOnPet() {
    if (!selected?.lastLocation) return;

    setIsCentered(true);

    if (Platform.OS === 'ios' && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: selected.lastLocation.latitude,
        longitude: selected.lastLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    } else if (Platform.OS === 'android' && webViewRef.current) {
      // Centralizar no WebView
      webViewRef.current.injectJavaScript(`
        map.setView([${selected.lastLocation.latitude}, ${selected.lastLocation.longitude}], 17);
        true;
      `);
    }

    setTimeout(() => {
      setIsCentered(false);
    }, 3000);
  }

  async function togglePetStatus() {
    if (!selected) return;

    const newStatus = !selected.lost;
    const action = newStatus ? t('maps.lost') : t('maps.found');

    Alert.alert(
      newStatus ? t('maps.markAsLostTitle') : t('maps.markAsFoundTitle'), 
      replacePlaceholders(
        newStatus ? t('maps.markAsLostConfirm') : t('maps.markAsFoundConfirm'),
        { petName: selected.name || 'Pet' }
      ),
      [
        { text: t('general.cancel'), style: "cancel" },
        {
          text: t('general.confirm'),
          onPress: async () => {
            try {
              await updatePet(selected.id, { lost: newStatus });
              Alert.alert(
                t('maps.zoneCreatedSuccess'), 
                replacePlaceholders(t('maps.statusUpdated'), { 
                  petName: selected.name || 'Pet',
                  status: action 
                })
              );
            } catch (e: any) {
              Alert.alert(t('maps.zoneSaveError'), t('maps.statusUpdateError'));
            }
          }
        }
      ]
    );
  }

  // ================== FUNÇÕES DE GEOFENCING ==================
  const loadZones = async () => {
    if (!selectedId || !uid) return;

    try {
      const petZonesRef = doc(db, 'petZones', selectedId);
      const petZonesSnap = await getDoc(petZonesRef);

      if (petZonesSnap.exists()) {
        const data = petZonesSnap.data();
        setZones(data.zones || []);
      } else {
        setZones([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar zonas:", error);
      setZones([]);
    }
  };

  const saveZone = async (zone: Omit<GeofenceZone, 'id'>) => {
    if (!selectedId || !uid) return;

    try {
      const zoneWithId = {
        ...zone,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      const currentZones = zones || [];
      const updatedZones = [...currentZones, zoneWithId];

      const docData = {
        petId: selectedId,
        userId: uid,
        zones: updatedZones,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'petZones', selectedId), docData);
      setZones(updatedZones);

    } catch (error: any) {
      console.error("Erro ao salvar zona:", error);
      Alert.alert(
        t('maps.zoneSaveError'), 
        `${t('maps.zoneSaveErrorDesc')} ${error.message}`
      );
    }
  };

  const deleteZone = async (zoneId: string) => {
    if (!selectedId || !uid) return;

    try {
      const updatedZones = zones.filter(zone => zone.id !== zoneId);

      await setDoc(doc(db, 'petZones', selectedId), {
        petId: selectedId,
        userId: uid,
        zones: updatedZones,
        updatedAt: new Date().toISOString()
      });

      setZones(updatedZones);
      Alert.alert(t('maps.zoneCreatedSuccess'), t('maps.zoneDeleted'));
    } catch (error: any) {
      console.error("Erro ao excluir zona:", error);
      Alert.alert(
        t('maps.zoneSaveError'), 
        `${t('maps.zoneDeleteError')} ${error.message}`
      );
    }
  };

  const checkGeofencing = async (petLocation: { latitude: number; longitude: number }) => {
    if (!selectedId || zones.length === 0) return;

    for (const zone of zones) {
      const isInside = isInsideZone(petLocation, zone);
      const wasInside = selected?.lastLocation ? isInsideZone(selected.lastLocation, zone) : false;

      if (isInside && !wasInside) {
        Alert.alert(
          t('maps.petEnteredZone'),
          replacePlaceholders(t('maps.petEnteredZoneDesc'), {
            petName: selected?.name || 'Seu pet',
            zoneName: zone.name
          }),
          [{ text: t('button.ok') }]
        );
      } else if (!isInside && wasInside) {
        Alert.alert(
          t('maps.petLeftZone'),
          replacePlaceholders(t('maps.petLeftZoneDesc'), {
            petName: selected?.name || 'Seu pet',
            zoneName: zone.name
          }),
          [{ text: t('button.ok') }]
        );
      }
    }
  };

  // ================== FUNÇÕES DE LOCALIZAÇÃO ==================
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
        Alert.alert(t('maps.permissionRequired'), t('maps.permissionRequiredDesc'));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      };

      await checkGeofencing(newLocation);

      const locationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        updatedAt: serverTimestamp(),
        address: null,
        accuracy: typeof loc.coords.accuracy === 'number' && loc.coords.accuracy > 0 
          ? loc.coords.accuracy 
          : null
      };

      await updatePet(selected.id, {
        lastLocation: locationData,
      });

      if (Platform.OS === 'ios' && mapRef.current && mapReady) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }

    } catch (e: any) {
      console.error("Erro ao obter localização:", e);
      Alert.alert(t('maps.locationError'), t('maps.locationErrorDesc'));
    } finally {
      setLocationLoading(false);
    }
  }

  // ================== EFFECTS ==================
  useEffect(() => {
    if (!selected?.id) return;

    fetchAndUpdateLocation();

    if (!selected.lost) {
      startAutoRefresh(30 * 60 * 1000);
    } else {
      startAutoRefresh(10 * 60 * 1000);
    }

    return () => stopAutoRefresh();
  }, [selected?.id, selected?.lost]);

  useEffect(() => {
    if (selectedId) {
      loadZones();
    }
  }, [selectedId]);

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

  // ================== ESTADOS DE LOADING INTERNACIONALIZADOS ==================
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: fontSizes.md }]}>
          {t('general.loading')}
        </Text>
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="person-circle-outline" size={80} color={colors.textTertiary} />
        <Text style={[styles.errorTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
          {t('maps.loginRequired')}
        </Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>
          {t('maps.noUserFound')}
        </Text>
      </View>
    );
  }

  if (!pets.length) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="paw-outline" size={80} color={colors.textTertiary} />
        <Text style={[styles.errorTitle, { color: colors.text, fontSize: fontSizes.lg }]}>
          {t('maps.noPetsTitle')}
        </Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>
          {t('maps.noPetsDesc')}
        </Text>
      </View>
    );
  }

  // ================== RENDER PRINCIPAL ==================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={selectedId}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedId}
            setItems={setItems}
            containerStyle={{ height: 46 }}
            style={[styles.dropdown, { 
              backgroundColor: colors.surface, 
              borderColor: colors.primary 
            }]}
            dropDownContainerStyle={[styles.dropdownList, { 
              backgroundColor: colors.surface,
              borderColor: colors.primary 
            }]}
            textStyle={[styles.dropdownText, { 
              color: colors.text,
              fontSize: fontSizes.sm 
            }]}
            placeholder={t('maps.selectPet')}
            closeAfterSelecting={true}
            searchable={false}
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
            <Text style={[styles.statusButtonText, { fontSize: fontSizes.sm }]}>
              {selected.lost ? t('maps.markAsFound') : t('maps.markAsLost')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Barra de ferramentas */}
      <View style={[styles.geofenceToolbar, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}>
        <Pressable
          onPress={startCreatingZone}
          style={[
            styles.toolbarButton, 
            { borderColor: colors.primary },
            creatingZone && { backgroundColor: colors.primary }
          ]}
        >
          <Ionicons 
            name="add-circle" 
            size={20} 
            color={creatingZone ? colors.background : colors.primary} 
          />
          <Text style={[
            styles.toolbarButtonText, 
            { 
              color: creatingZone ? colors.background : colors.primary,
              fontSize: fontSizes.sm 
            }
          ]}>
            {creatingZone ? t('maps.tapOnMap') : t('maps.newSafeZone')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowZoneManager(!showZoneManager)}
          style={[
            styles.toolbarButton, 
            { 
              borderColor: colors.primary,
              backgroundColor: showZoneManager ? colors.surface : "transparent" 
            }
          ]}
        >
          <Ionicons name="settings" size={20} color={colors.primary} />
          <Text style={[styles.toolbarButtonText, { 
            color: colors.primary,
            fontSize: fontSizes.sm 
          }]}>
            {t('maps.manage')} ({zones.length})
          </Text>
        </Pressable>

        {zones.length > 0 && (
          <View style={[styles.zoneCounter, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.zoneCounterText, { 
              color: colors.primary,
              fontSize: fontSizes.xs 
            }]}>
              {zones.length} {zones.length !== 1 ? t('maps.zones') : t('maps.zone')}
            </Text>
          </View>
        )}
      </View>

      {/* ✅ MAPA HÍBRIDO: WEBVIEW NO ANDROID, MAPVIEW NO iOS */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'android' ? (
          // Android: WebView com Leaflet
          <WebView
            ref={webViewRef}
            source={{ html: generateMapHTML(selected?.lastLocation ?? null, zones, translate) }}
            style={styles.map}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[styles.webViewLoading, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { 
                  color: colors.textSecondary,
                  fontSize: fontSizes.sm 
                }]}>
                  {t('maps.loadingMap')}
                </Text>
              </View>
            )}
          />
        ) : (
          // iOS: MapView nativo
          <MapView 
            ref={mapRef}
            key={selectedId ?? "ios-map"} 
            style={styles.map} 
            initialRegion={region}
            showsUserLocation={true}
            showsMyLocationButton={false}
            onMapReady={() => {
              console.log("✅ iOS Map ready");
              setMapReady(true);
            }}
            onPress={handleMapPress}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {/* Pet marker no iOS */}
            {selected?.lastLocation && (
              <>
                <Marker
                  coordinate={{ 
                    latitude: selected.lastLocation.latitude, 
                    longitude: selected.lastLocation.longitude 
                  }}
                  title={selected?.name ? `${selected.name} ${t('maps.petHere').toLowerCase()}!` : t('maps.petHere')}
                  description={petLocationStatus.inZone 
                    ? `🏠 ${t('maps.zoneLabel')} ${petLocationStatus.zoneName}` 
                    : t('maps.outsideZones')
                  }
                  pinColor={selected.lost ? "#DC2626" : petLocationStatus.inZone ? "#22C55E" : "#F59E0B"}
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

            {/* Zonas de geofencing no iOS */}
            {zones.map(zone => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                fillColor={`${zone.color}20`}
                strokeColor={zone.color}
                strokeWidth={2}
              />
            ))}

            {/* Preview da nova zona no iOS */}
            {newZoneCenter && creatingZone && (
              <Circle
                center={newZoneCenter}
                radius={newZoneRadius}
                fillColor={`${selectedZoneColor}30`}
                strokeColor={selectedZoneColor}
                strokeWidth={2}
              />
            )}
          </MapView>
        )}
      </View>

      {/* Painel inferior */}
      <View style={[styles.bottomPanel, { backgroundColor: colors.surface }]}>
        <View style={styles.statusRow}>
          <Text style={[
            styles.statusIndicator, 
            { 
              color: selected?.lost ? "#DC2626" : petLocationStatus.inZone ? "#22C55E" : "#F59E0B",
              fontSize: fontSizes.md
            }
          ]}>
            {selected?.lost 
              ? t('maps.petLost')
              : petLocationStatus.inZone 
                ? t('maps.petSafe')
                : t('maps.petOutside')
            }
          </Text>
          {locationLoading && <ActivityIndicator size="small" color={colors.textSecondary} />}
        </View>

        <Text style={[styles.updatedText, { 
          color: colors.textSecondary,
          fontSize: fontSizes.sm 
        }]}>
          {petLocationStatus.text}
        </Text>

        <View style={styles.actionRow}>
          <Pressable 
            onPress={fetchAndUpdateLocation} 
            style={[styles.actionButton, { 
              backgroundColor: colors.background,
              borderColor: colors.primary 
            }]}
            disabled={locationLoading}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { 
              color: colors.primary,
              fontSize: fontSizes.xs 
            }]}>
              {locationLoading ? "..." : t('maps.refresh')}
            </Text>
          </Pressable>

          <Pressable 
            onPress={centerOnPet} 
            style={[
              styles.actionButton,
              { 
                backgroundColor: colors.background,
                borderColor: isCentered ? "#22C55E" : colors.primary 
              },
              isCentered && { backgroundColor: colors.primary + '20' }
            ]}
          >
            <Ionicons 
              name={isCentered ? "radio-button-on" : "locate"} 
              size={20} 
              color={isCentered ? "#22C55E" : colors.primary} 
            />
            <Text style={[
              styles.actionButtonText,
              { 
                color: isCentered ? "#22C55E" : colors.primary,
                fontSize: fontSizes.xs 
              }
            ]}>
              {isCentered ? t('maps.centered') : t('maps.center')}
            </Text>
          </Pressable>

          <Pressable 
            onPress={openMaps} 
            style={[styles.actionButton, { 
              backgroundColor: colors.background,
              borderColor: colors.primary 
            }]}
          >
            <Ionicons name="map" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { 
              color: colors.primary,
              fontSize: fontSizes.xs 
            }]}>
              {t('maps.open')}
            </Text>
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
          <Text style={[styles.realtimeButtonText, { fontSize: fontSizes.sm }]}>
            {isRealtime ? t('maps.stopRealTime') : t('maps.realTime')}
          </Text>
        </Pressable>

        <Text style={[styles.osmCredit, { 
          color: colors.textTertiary,
          fontSize: fontSizes.xs 
        }]}>
          {Platform.OS === 'ios' 
            ? t('maps.appleCredit') 
            : t('maps.osmCredit')
          }
        </Text>
      </View>

      {/* Modais */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={zoneModalVisible}
        onRequestClose={cancelZoneCreation}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: colors.text,
                fontSize: fontSizes.lg 
              }]}>
                {t('maps.newSafeZoneTitle')}
              </Text>
              <Pressable onPress={cancelZoneCreation} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalLabel, { 
                color: colors.text,
                fontSize: fontSizes.md 
              }]}>
                {t('maps.zoneName')}
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: fontSizes.md
                }]}
                placeholder={t('maps.zoneNamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={zoneName}
                onChangeText={setZoneName}
                autoFocus
                maxLength={30}
              />

              <Text style={[styles.modalLabel, { 
                color: colors.text,
                fontSize: fontSizes.md 
              }]}>
                {t('maps.zoneRadius')} ({newZoneRadius}m):
              </Text>
              <View style={styles.radiusContainer}>
                {[50, 100, 200, 500].map(radius => (
                  <Pressable
                    key={radius}
                    onPress={() => setNewZoneRadius(radius)}
                    style={[
                      styles.radiusButton,
                      { 
                        backgroundColor: newZoneRadius === radius ? colors.primary : colors.surface,
                        borderColor: colors.border,
                        borderWidth: 1
                      }
                    ]}
                  >
                    <Text style={[
                      styles.radiusButtonText,
                      { 
                        color: newZoneRadius === radius ? colors.background : colors.text,
                        fontSize: fontSizes.sm
                      }
                    ]}>
                      {radius}m
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.modalLabel, { 
                color: colors.text,
                fontSize: fontSizes.md 
              }]}>
                {t('maps.zoneColor')}
              </Text>
              <View style={styles.colorContainer}>
                {zoneColors.map(color => (
                  <Pressable
                    key={color.value}
                    onPress={() => setSelectedZoneColor(color.value)}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color.value },
                      selectedZoneColor === color.value && styles.colorButtonSelected
                    ]}
                  >
                    {selectedZoneColor === color.value && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={cancelZoneCreation}
                style={[styles.modalButton, styles.modalButtonSecondary, { 
                  backgroundColor: colors.surface 
                }]}
              >
                <Text style={[styles.modalButtonTextSecondary, { 
                  color: colors.text,
                  fontSize: fontSizes.md
                }]}>
                  {t('general.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmCreateZone}
                style={[
                  styles.modalButton, 
                  styles.modalButtonPrimary,
                  { backgroundColor: colors.primary }
                ]}
                disabled={!zoneName.trim()}
              >
                <Text style={[
                  styles.modalButtonTextPrimary,
                  { fontSize: fontSizes.md },
                  !zoneName.trim() && { opacity: 0.5 }
                ]}>
                  {t('maps.createZone')}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showZoneManager}
        onRequestClose={() => setShowZoneManager(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            maxHeight: '80%',
            backgroundColor: colors.background 
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: colors.text,
                fontSize: fontSizes.lg 
              }]}>
                {t('maps.safeZones')}
              </Text>
              <Pressable 
                onPress={() => setShowZoneManager(false)} 
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {zones.length === 0 ? (
              <View style={styles.noZonesContainer}>
                <Ionicons name="location-outline" size={64} color={colors.textTertiary} />
                <Text style={[styles.noZonesText, { 
                  color: colors.textSecondary,
                  fontSize: fontSizes.lg 
                }]}>
                  {t('maps.noZonesCreated')}
                </Text>
                <Text style={[styles.noZonesSubtitle, { 
                  color: colors.textTertiary,
                  fontSize: fontSizes.sm 
                }]}>
                  {t('maps.noZonesDesc')}
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.zonesList}>
                {zones.map(zone => (
                  <View key={zone.id} style={[styles.zoneItem, { 
                    borderBottomColor: colors.border 
                  }]}>
                    <View style={[styles.zoneColorIndicator, { backgroundColor: zone.color }]} />
                    <View style={styles.zoneInfo}>
                      <Text style={[styles.zoneName, { 
                        color: colors.text,
                        fontSize: fontSizes.md 
                      }]}>
                        {zone.name}
                      </Text>
                      <Text style={[styles.zoneDetails, { 
                        color: colors.textSecondary,
                        fontSize: fontSizes.sm 
                      }]}>
                        📏 {zone.radius}{t('maps.radiusMeters')}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          t('maps.deleteZone'),
                          replacePlaceholders(t('maps.deleteZoneConfirm'), { zoneName: zone.name }),
                          [
                            { text: t('general.cancel'), style: "cancel" },
                            { 
                              text: t('general.delete'), 
                              style: "destructive", 
                              onPress: () => deleteZone(zone.id) 
                            }
                          ]
                        );
                      }}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowZoneManager(false)}
                style={[
                  styles.modalButton, 
                  styles.modalButtonPrimary, 
                  { flex: 1, backgroundColor: colors.primary }
                ]}
              >
                <Text style={[styles.modalButtonTextPrimary, { fontSize: fontSizes.md }]}>
                  {t('maps.close')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ================== ESTILOS ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontWeight: "500",
  },
  errorTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  errorSubtitle: {
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
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    borderRadius: 12,
    height: 46,
  },
  dropdownList: {
    borderRadius: 12,
  },
  dropdownText: {
    fontWeight: "500",
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: 120,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  geofenceToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    marginRight: 12,
  },
  toolbarButtonText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  zoneCounter: {
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  zoneCounterText: {
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  bottomPanel: {
    padding: 16,
    gap: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusIndicator: {
    fontWeight: "600",
  },
  updatedText: {
    textAlign: "center",
    lineHeight: 20,
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontWeight: "600",
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
  },
  osmCredit: {
    textAlign: "center",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: "92%",
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: "700",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLabel: {
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  radiusContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  radiusButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  radiusButtonText: {
    fontWeight: "600",
  },
  colorContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonPrimary: {
    // backgroundColor will be set dynamically
  },
  modalButtonSecondary: {
    // backgroundColor will be set dynamically
  },
  modalButtonTextPrimary: {
    color: "#fff",
    fontWeight: "700",
  },
  modalButtonTextSecondary: {
    fontWeight: "600",
  },
  noZonesContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noZonesText: {
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  noZonesSubtitle: {
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  zonesList: {
    maxHeight: 400,
  },
  zoneItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  zoneColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  zoneDetails: {
    // color and fontSize will be set dynamically
  },
  deleteButton: {
    padding: 12,
  },
});