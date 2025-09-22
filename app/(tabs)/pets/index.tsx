// app/(tabs)/pet.tsx - VERSÃO INTERNACIONALIZADA
import { auth } from "@/services/firebase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  addPet,
  addPetRecord,
  deletePetById,
  getLastRecordForType,
  getLastRecordsForPet,
  Pet,
  subscribeMyPets,
  updatePet,
  uploadPetImageLocal,
} from "services/pets";
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';

type Row = Pet & { id?: string };

// Função para substituir placeholders nas strings de tradução
function replacePlaceholders(text: string, placeholders: { [key: string]: string }): string {
  let result = text;
  Object.keys(placeholders).forEach(key => {
    result = result.replace(`{${key}}`, placeholders[key]);
  });
  return result;
}

/**
 * ModalWithKeyboard (Bottom-sheet style) - INTERNACIONALIZADO
 */
function ModalWithKeyboard({
  visible,
  onClose,
  children,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const { colors, fontSizes } = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
    };
    const onHide = () => setKeyboardHeight(0);

    const s = Keyboard.addListener(showEvent, onShow);
    const h = Keyboard.addListener(hideEvent, onHide);

    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const sheetTransform = { transform: [{ translateY: -keyboardHeight }] };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            padding: 16,
            maxHeight: "80%",
            ...sheetTransform,
          }}
        >
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: 8 
          }}>
            <Text style={{ 
              fontWeight: "800", 
              fontSize: fontSizes.lg,
              color: colors.text
            }}>
              {title ?? ""}
            </Text>
            <Pressable onPress={onClose} style={{ padding: 6 }}>
              <Text style={{ fontSize: fontSizes.lg, color: colors.textSecondary }}>✕</Text>
            </Pressable>
          </View>
          <View style={{ paddingBottom: 8 }}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

export default function PetTab() {
  const { colors, fontSizes } = useTheme();
  const { t, language } = useLanguage();
  
  const user = auth.currentUser;
  const uid = user?.uid;

  const [pets, setPets] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<string>("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [lastModalRecord, setLastModalRecord] = useState<any | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeMyPets(uid, setPets);
    return unsub;
  }, [uid]);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSpecies("");
    setBreed("");
    setAge("");
    setPhotoUri(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (row: Row) => {
    setEditingId(row.id!);
    setName(row.name ?? "");
    setSpecies(row.species ?? "");
    setBreed(row.breed ?? "");
    setAge(row.age ? String(row.age) : "");
    setPhotoUri(null);
    setShowForm(true);
  };

  // escolher imagem - INTERNACIONALIZADA
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t('pets.permissionRequired'), t('pets.permissionRequiredDesc'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  // ✅ NOVA FUNÇÃO: remover foto - INTERNACIONALIZADA
  const removePhoto = () => {
    Alert.alert(
      t('pets.removePhotoTitle'), 
      t('pets.removePhotoConfirm'), 
      [
        { text: t('general.cancel'), style: "cancel" },
        { text: t('pets.removePhotoAction'), style: "destructive", onPress: () => setPhotoUri(null) }
      ]
    );
  };

  const submit = async () => {
    if (!uid) {
      Alert.alert(t('pets.loginRequired'), t('pets.loginRequiredDesc'));
      return;
    }
    if (!name.trim()) {
      Alert.alert(t('pets.nameRequiredAlert'), t('pets.nameRequiredAlertDesc'));
      return;
    }

    let photoUrl: string | undefined;
    if (photoUri) {
      try {
        photoUrl = await uploadPetImageLocal(photoUri);
      } catch (e: any) {
        Alert.alert(
          t('pets.photoUploadError'), 
          e?.message ?? t('pets.photoUploadRetry')
        );
        return;
      }
    }

    const payload: Pet = {
      name: name.trim(),
      userId: uid,
      species: species.trim() || undefined,
      breed: breed.trim() || undefined,
      age: age ? Number(age) : undefined,
      photoUrl: photoUrl || undefined,
    };

    try {
      if (isEditing && editingId) {
        await updatePet(editingId, payload);
      } else {
        await addPet(payload);
      }
      resetForm();
    } catch (e: any) {
      Alert.alert(
        t('general.error'), 
        e.message ?? t('pets.saveFailed')
      );
    }
  };

  const remove = (id?: string) => {
    if (!id) return;
    Alert.alert(
      t('pets.deletePet'), 
      t('pets.deletePetConfirm'), 
      [
        { text: t('general.cancel'), style: "cancel" },
        {
          text: t('general.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deletePetById(id);
            } catch (e: any) {
              Alert.alert(t('general.error'), e.message);
            }
          },
        },
      ]
    );
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // ✅ ADIÇÃO 1: Função para navegar para tela de adicionar coleira
  const addCollarToPet = (petId: string, petName: string) => {
    router.push({
      pathname: "/pets/addCollar",
      params: { petId, petName }
    });
  };

  /* ------------------------- ✅ SPEED DIAL MELHORADO ------------------------- */
  const [dialOpen, setDialOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleDial = () => {
    const to = dialOpen ? 0 : 1;
    Animated.spring(anim, { 
      toValue: to, 
      useNativeDriver: true, 
      stiffness: 200, 
      damping: 16 
    }).start();
    setDialOpen(!dialOpen);
  };

  // ✅ Animações para itens do speed dial com labels
  const createItemStyle = (translateY: number) => ({
    transform: [
      {
        translateY: anim.interpolate({ 
          inputRange: [0, 1], 
          outputRange: [0, translateY] 
        }),
      },
      { scale: anim },
    ],
    opacity: anim,
  });

  const item1Style = createItemStyle(-70);
  const item2Style = createItemStyle(-130);
  const item3Style = createItemStyle(-190);
  const item4Style = createItemStyle(-250);

  /* ------------------------- Modal states ------------------------- */
  const [walkModalVisible, setWalkModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [walkKm, setWalkKm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [walkNote, setWalkNote] = useState<string>("");
  const [weightNote, setWeightNote] = useState<string>("");
  const [healthNote, setHealthNote] = useState<string>("");
  const [generalNote, setGeneralNote] = useState<string>("");
  const [healthType, setHealthType] = useState<string>("VACCINE");

  // Formatação de data internacionalizada
  const fmt = (ts: any) => {
    if (!ts) return "";
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      const locales = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES'
      };
      return d.toLocaleDateString(locales[language as keyof typeof locales] || 'pt-BR');
    } catch {
      return "";
    }
  };

  const fetchLastFor = async (petId: string | null, type: string, subtype?: any) => {
    setLastModalRecord(null);
    if (!petId) return;
    try {
      if (typeof (getLastRecordForType as any) === "function") {
        const r = await getLastRecordForType(petId, type, subtype);
        setLastModalRecord(r || null);
      } else {
        const agg = await getLastRecordsForPet(petId);
        if (type === "HEALTH" && subtype) {
          const h = agg?.HEALTH;
          if (h && String(h.values) === String(subtype)) setLastModalRecord(h);
          else setLastModalRecord(null);
        } else {
          setLastModalRecord(agg ? agg[type] ?? null : null);
        }
      }
    } catch (e) {
      console.warn("Erro fetchLastFor", e);
      setLastModalRecord(null);
    }
  };

  /* ---------------- Modal openers INTERNACIONALIZADOS ---------------- */
  const openWalk = () => {
    if (pets.length === 0) { 
      Alert.alert(t('pets.noPetsModal'), t('pets.noPetsWalk')); 
      return; 
    }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    fetchLastFor(id, "WALK");
    setWalkKm("");
    setWalkNote("");
    setWalkModalVisible(true);
    toggleDial();
  };

  const openWeight = () => {
    if (pets.length === 0) { 
      Alert.alert(t('pets.noPetsModal'), t('pets.noPetsWeight')); 
      return; 
    }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    fetchLastFor(id, "WEIGHT");
    setWeightKg("");
    setWeightNote("");
    setWeightModalVisible(true);
    toggleDial();
  };

  const openHealth = () => {
    if (pets.length === 0) { 
      Alert.alert(t('pets.noPetsModal'), t('pets.noPetsHealth')); 
      return; 
    }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    fetchLastFor(id, "HEALTH", "VACCINE");
    setHealthNote("");
    setHealthType("VACCINE");
    setHealthModalVisible(true);
    toggleDial();
  };

  const openNote = () => {
    if (pets.length === 0) { 
      Alert.alert(t('pets.noPetsModal'), t('pets.noPetsNote')); 
      return; 
    }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    setGeneralNote("");
    setNoteModalVisible(true);
    toggleDial();
  };

  // Pet selection handlers
  const selectPetInWalkModal = (petId: string) => {
    setSelectedPetId(petId);
    fetchLastFor(petId, "WALK");
  };
  
  const selectPetInWeightModal = (petId: string) => {
    setSelectedPetId(petId);
    fetchLastFor(petId, "WEIGHT");
  };
  
  const selectPetInHealthModal = (petId: string) => {
    setSelectedPetId(petId);
    fetchLastFor(petId, "HEALTH", healthType);
  };
  
  const selectPetInNoteModal = (petId: string) => {
    setSelectedPetId(petId);
  };

  useEffect(() => {
    if (healthModalVisible && selectedPetId) fetchLastFor(selectedPetId, "HEALTH", healthType);
  }, [healthType]);

  // Submit functions INTERNACIONALIZADAS
  const submitWalk = async () => {
    if (!selectedPetId) { Alert.alert(t('pets.selectPet')); return; }
    const km = Number(walkKm);
    if (Number.isNaN(km) || km <= 0) { 
      Alert.alert("Valor inválido", t('pets.kilometers')); 
      return; 
    }

    try {
      await addPetRecord(selectedPetId, { type: "WALK", value: km, note: walkNote });
      fetchLastFor(selectedPetId, "WALK");
      setWalkModalVisible(false);
      Alert.alert(
        "Registrado", 
        replacePlaceholders(t('pets.walkRegistered'), { km: km.toString() })
      );
    } catch (e: any) {
      console.error("Erro registrar caminhada:", e);
      Alert.alert(t('general.error'), e?.message ?? t('pets.walkRegisterError'));
    }
  };

  const submitWeight = async () => {
    if (!selectedPetId) { Alert.alert(t('pets.selectPet')); return; }
    const kg = Number(weightKg);
    if (Number.isNaN(kg) || kg <= 0) { 
      Alert.alert("Valor inválido", t('pets.weightKg')); 
      return; 
    }

    try {
      await addPetRecord(selectedPetId, { type: "WEIGHT", value: kg, note: weightNote });
      fetchLastFor(selectedPetId, "WEIGHT");
      setWeightModalVisible(false);
      Alert.alert(
        "Registrado", 
        replacePlaceholders(t('pets.weightRegistered'), { kg: kg.toString() })
      );
    } catch (e: any) {
      console.error("Erro registrar peso:", e);
      Alert.alert(t('general.error'), e?.message ?? t('pets.weightRegisterError'));
    }
  };

  const submitHealth = async () => {
    if (!selectedPetId) { Alert.alert(t('pets.selectPet')); return; }
    try {
      await addPetRecord(selectedPetId, { type: "HEALTH", value: healthType, note: healthNote });
      fetchLastFor(selectedPetId, "HEALTH", healthType);
      setHealthModalVisible(false);
      
      const healthTypeText = healthType === "VACCINE" ? t('pets.vaccine') 
        : healthType === "DEWORM" ? t('pets.deworm') 
        : healthType === "BATH" ? t('pets.bath') 
        : t('pets.visit');
      
      Alert.alert(
        "Registrado", 
        replacePlaceholders(t('pets.healthRegistered'), { type: healthTypeText })
      );
    } catch (e: any) {
      console.error("Erro registrar saúde:", e);
      Alert.alert(t('general.error'), e?.message ?? t('pets.healthRegisterError'));
    }
  };

  const submitNote = async () => {
    if (!selectedPetId) { Alert.alert(t('pets.selectPet')); return; }
    if (!generalNote.trim()) { 
      Alert.alert(t('pets.emptyNote'), t('pets.emptyNoteDesc')); 
      return; 
    }
    try {
      await addPetRecord(selectedPetId, { type: "NOTE", value: generalNote.trim() });
      setNoteModalVisible(false);
      Alert.alert("Registrado", t('pets.noteRegistered'));
    } catch (e: any) {
      console.error("Erro registrar nota:", e);
      Alert.alert(t('general.error'), e?.message ?? t('pets.noteRegisterError'));
    }
  };

  // Estilos dinâmicos
  const inputStyle = {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSizes.md,
  };

  const linkStyle = {
    color: colors.primary,
    fontWeight: "600" as const,
    fontSize: fontSizes.sm,
  };

  // Função para obter label do tipo de saúde
  const getHealthTypeLabel = (type: string): string => {
    switch (type) {
      case "VACCINE": return t('pets.vaccine');
      case "DEWORM": return t('pets.deworm');
      case "BATH": return t('pets.bath');
      case "VISIT": return t('pets.visit');
      default: return type;
    }
  };

  // Função para obter texto do último registro de saúde
  const getLastHealthText = (type: string): string => {
    switch (type) {
      case "VACCINE": return t('pets.lastVaccine');
      case "DEWORM": return t('pets.lastDeworm');
      case "BATH": return t('pets.lastBath');
      case "VISIT": return t('pets.lastVisit');
      default: return "Último registro:";
    }
  };

  /* ------------------------- Render ------------------------- */
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined} 
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ 
          fontSize: fontSizes.xl, 
          fontWeight: "700",
          color: colors.text
        }}>
          {t('pets.title')}
        </Text>

        {!showForm && (
          <Pressable
            onPress={startCreate}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            }}
          >
            <Text style={{ 
              fontWeight: "700", 
              color: colors.primary,
              fontSize: fontSizes.md
            }}>
              {t('pets.addPet')}
            </Text>
          </Pressable>
        )}

        {/* ✅ FORMULÁRIO MELHORADO com botão remover foto - INTERNACIONALIZADO */}
        {showForm && (
          <View
            style={{
              gap: 8,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ 
              fontWeight: "700",
              color: colors.text,
              fontSize: fontSizes.lg
            }}>
              {isEditing ? t('pets.editPetTitle') : t('pets.addPetTitle')}
            </Text>

            {photoUri ? (
              <Image 
                source={{ uri: photoUri }} 
                style={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: 12, 
                  backgroundColor: colors.border
                }} 
              />
            ) : null}

            {/* ✅ Botões de foto melhorados - INTERNACIONALIZADOS */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable 
                onPress={pickImage} 
                style={{ 
                  paddingVertical: 8, 
                  paddingHorizontal: 12, 
                  borderWidth: 1, 
                  borderRadius: 8, 
                  backgroundColor: colors.surface,
                  borderColor: colors.primary
                }}
              >
                <Text style={{ 
                  color: colors.primary, 
                  fontWeight: "600",
                  fontSize: fontSizes.sm
                }}>
                  {photoUri ? t('pets.changePhoto') : t('pets.choosePhoto')}
                </Text>
              </Pressable>

              {/* ✅ NOVO: Botão remover foto (só aparece se tiver foto) */}
              {photoUri && (
                <Pressable 
                  onPress={removePhoto} 
                  style={{ 
                    paddingVertical: 8, 
                    paddingHorizontal: 12, 
                    borderWidth: 1, 
                    borderRadius: 8, 
                    backgroundColor: colors.surface,
                    borderColor: colors.error
                  }}
                >
                  <Text style={{ 
                    color: colors.error, 
                    fontWeight: "600",
                    fontSize: fontSizes.sm
                  }}>
                    {t('pets.removePhoto')}
                  </Text>
                </Pressable>
              )}
            </View>

            <TextInput 
              placeholder={t('pets.nameRequired')} 
              placeholderTextColor={colors.textSecondary} 
              value={name} 
              onChangeText={setName} 
              style={inputStyle} 
            />
            <TextInput 
              placeholder={t('pets.species')} 
              placeholderTextColor={colors.textSecondary} 
              value={species} 
              onChangeText={setSpecies} 
              style={inputStyle} 
            />
            <TextInput 
              placeholder={t('pets.breed')} 
              placeholderTextColor={colors.textSecondary} 
              value={breed} 
              onChangeText={setBreed} 
              style={inputStyle} 
            />
            <TextInput 
              placeholder={t('pets.age')} 
              placeholderTextColor={colors.textSecondary} 
              value={age} 
              onChangeText={setAge} 
              keyboardType="numeric" 
              style={inputStyle} 
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={submit}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: colors.background,
                  fontWeight: '600',
                  fontSize: fontSizes.md,
                }}>
                  {isEditing ? t('pets.saveChanges') : t('general.add')}
                </Text>
              </Pressable>
              <Pressable
                onPress={resetForm}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: fontSizes.md,
                }}>
                  {t('general.cancel')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Lista de pets INTERNACIONALIZADA */}
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id!}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const petUrl = `https://barkbuddy-bd.web.app/${item.id}`;
            const expanded = !!expandedIds[item.id!];

            return (
              <View style={{ 
                borderWidth: 1, 
                borderRadius: 12, 
                overflow: "hidden", 
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}>
                <Pressable 
                  onPress={() => toggleExpand(item.id!)} 
                  style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    gap: 12, 
                    padding: 12, 
                    backgroundColor: colors.background
                  }}
                >
                  <Image
                    source={item.photoUrl ? { uri: item.photoUrl } : { uri: "https://placekitten.com/160/160" }}
                    style={{ 
                      width: 56, 
                      height: 56, 
                      borderRadius: 12, 
                      backgroundColor: colors.border
                    }}
                  />
                  <Text style={{ 
                    fontSize: fontSizes.lg, 
                    fontWeight: "700",
                    color: colors.text
                  }}>
                    {item.name}
                  </Text>
                  <View style={{ marginLeft: "auto" }}>
                    <Text style={{ 
                      opacity: 0.6,
                      color: colors.textSecondary,
                      fontSize: fontSizes.md
                    }}>
                      {expanded ? "▲" : "▼"}
                    </Text>
                  </View>
                </Pressable>

                {expanded && (
                  <View style={{ padding: 12, gap: 6 }}>
                    <Text style={{ 
                      color: colors.text,
                      fontSize: fontSizes.md
                    }}>
                      {t('pets.speciesLabel')} {item.species ?? t('pets.noInfo')}
                    </Text>
                    <Text style={{ 
                      color: colors.text,
                      fontSize: fontSizes.md
                    }}>
                      {t('pets.breedLabel')} {item.breed ?? t('pets.noInfo')}
                    </Text>
                    <Text style={{ 
                      color: colors.text,
                      fontSize: fontSizes.md
                    }}>
                      {t('pets.ageLabel')} {typeof item.age === "number" && !Number.isNaN(item.age) ? item.age : t('pets.noInfo')}
                    </Text>

                    <View style={{ alignItems: "center", marginTop: 10 }}>
                      <QRCode value={petUrl} size={140} />
                      <Text style={{ 
                        fontSize: fontSizes.xs, 
                        marginTop: 4,
                        color: colors.textSecondary
                      }} selectable>
                        {petUrl}
                      </Text>
                    </View>

                    {/* ✅ ADIÇÃO 2: Botões com o novo botão Adicionar Coleira - INTERNACIONALIZADOS */}
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 12, 
                      marginTop: 8, 
                      flexWrap: "wrap" 
                    }}>
                      <TouchableOpacity onPress={() => startEdit(item)}>
                        <Text style={linkStyle}>{t('general.edit')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => remove(item.id)}>
                        <Text style={[linkStyle, { color: colors.error }]}>{t('general.delete')}</Text>
                      </TouchableOpacity>
                      
                      {/* ✅ NOVO BOTÃO: Adicionar Coleira */}
                      <TouchableOpacity onPress={() => addCollarToPet(item.id!, item.name!)}>
                        <Text style={linkStyle}>{t('pets.addCollar')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={{ 
              color: colors.textSecondary,
              fontSize: fontSizes.md
            }}>
              {t('pets.noPetsYet')}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 280 }}
        />

        {/* Dashboard placeholder - INTERNACIONALIZADO */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: 10,
            borderRadius: 16,
            alignItems: "center",
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ 
            fontSize: fontSizes.lg, 
            fontWeight: "700", 
            color: colors.primary, 
            marginBottom: 8 
          }}>
            {t('pets.dashboard')}
          </Text>
          <Text style={{ 
            fontSize: fontSizes.sm, 
            opacity: 0.7, 
            textAlign: "center", 
            marginBottom: 12,
            color: colors.textSecondary
          }}>
            {t('pets.dashboardDesc')}
          </Text>
          <Pressable
            onPress={() => router.push("/pets/dashboard")}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text style={{ 
              color: colors.background, 
              fontWeight: "700", 
              fontSize: fontSizes.md 
            }}>
              {t('pets.openDashboard')}
            </Text>
          </Pressable>
        </View>

        {/* ✅ SPEED DIAL MELHORADO com labels animados - INTERNACIONALIZADO */}
        
        {/* Item 4 - Anotação */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item4Style]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Animated.View style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              opacity: anim
            }}>
              <Text style={{ 
                color: "#fff", 
                fontSize: fontSizes.xs, 
                fontWeight: "600" 
              }}>
                {t('pets.note')}
              </Text>
            </Animated.View>
            <Pressable 
              onPress={openNote} 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: colors.background, 
                alignItems: "center", 
                justifyContent: "center", 
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text style={{ fontSize: fontSizes.lg }}>📝</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Item 3 - Saúde */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item3Style]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Animated.View style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              opacity: anim
            }}>
              <Text style={{ 
                color: "#fff", 
                fontSize: fontSizes.xs, 
                fontWeight: "600" 
              }}>
                {t('pets.health')}
              </Text>
            </Animated.View>
            <Pressable 
              onPress={openHealth} 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: colors.background, 
                alignItems: "center", 
                justifyContent: "center", 
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text style={{ fontSize: fontSizes.lg }}>💉</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Item 2 - Peso */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item2Style]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Animated.View style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              opacity: anim
            }}>
              <Text style={{ 
                color: "#fff", 
                fontSize: fontSizes.xs, 
                fontWeight: "600" 
              }}>
                {t('pets.weight')}
              </Text>
            </Animated.View>
            <Pressable 
              onPress={openWeight} 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: colors.background, 
                alignItems: "center", 
                justifyContent: "center", 
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text style={{ fontSize: fontSizes.lg }}>⚖️</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Item 1 - Caminhada */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item1Style]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Animated.View style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              opacity: anim
            }}>
              <Text style={{ 
                color: "#fff", 
                fontSize: fontSizes.xs, 
                fontWeight: "600" 
              }}>
                {t('pets.walk')}
              </Text>
            </Animated.View>
            <Pressable 
              onPress={openWalk} 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 22, 
                backgroundColor: colors.background, 
                alignItems: "center", 
                justifyContent: "center", 
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text style={{ fontSize: fontSizes.lg }}>🚶</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* FAB principal */}
        {!showForm && (
          <Pressable
            onPress={toggleDial}
            style={{
              position: "absolute",
              right: 20,
              bottom: 24,
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 6,
            }}
            accessibilityLabel={t('pets.quickActions')}
          >
            <Text style={{ 
              color: colors.background, 
              fontSize: 28, 
              lineHeight: 28 
            }}>
              {dialOpen ? "×" : "＋"}
            </Text>
          </Pressable>
        )}

        {/* MODAIS INTERNACIONALIZADOS */}
        
        {/* Modal de Caminhada */}
        <ModalWithKeyboard 
          visible={walkModalVisible} 
          onClose={() => setWalkModalVisible(false)} 
          title={t('pets.recordWalk')}
        >
          <Text style={{ 
            marginTop: 6,
            color: colors.text,
            fontSize: fontSizes.md
          }}>
            {t('pets.selectPet')}
          </Text>
          <View style={{ maxHeight: 180 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => selectPetInWalkModal(item.id!)} 
                  style={{ 
                    padding: 8, 
                    backgroundColor: selectedPetId === item.id ? colors.surface : "transparent",
                    borderRadius: 8
                  }}
                >
                  <Text style={{ 
                    fontWeight: "700",
                    color: colors.text,
                    fontSize: fontSizes.md
                  }}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {selectedPetId ? (
            <View style={{ 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: colors.surface, 
              borderRadius: 8 
            }}>
              <Text style={{ 
                fontWeight: "800",
                color: colors.text,
                fontSize: fontSizes.md
              }}>
                {pets.find(p => p.id === selectedPetId)?.name ?? t('pets.noInfo')}
              </Text>
              <Text style={{ 
                fontSize: fontSizes.sm, 
                marginTop: 4,
                color: colors.textSecondary
              }}>
                {t('pets.lastWalk')} {lastModalRecord ? `${lastModalRecord.value} km — ${fmt(lastModalRecord.createdAt)}` : t('pets.noInfo')}
              </Text>
            </View>
          ) : null}

          <TextInput 
            placeholder={t('pets.kilometers')} 
            placeholderTextColor={colors.textSecondary} 
            value={walkKm} 
            onChangeText={setWalkKm} 
            keyboardType="decimal-pad" 
            style={[inputStyle, { marginTop: 8 }]} 
          />
          <TextInput 
            placeholder={t('pets.observationOptional')} 
            placeholderTextColor={colors.textSecondary} 
            value={walkNote} 
            onChangeText={setWalkNote} 
            style={[inputStyle, { marginTop: 8 }]} 
          />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setWalkModalVisible(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                color: colors.text,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('general.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={submitWalk}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.primary,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: colors.background,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('pets.register')}
              </Text>
            </Pressable>
          </View>
        </ModalWithKeyboard>

        {/* Modal de Peso */}
        <ModalWithKeyboard 
          visible={weightModalVisible} 
          onClose={() => setWeightModalVisible(false)} 
          title={t('pets.recordWeight')}
        >
          <Text style={{ 
            marginTop: 6,
            color: colors.text,
            fontSize: fontSizes.md
          }}>
            {t('pets.selectPet')}
          </Text>
          <View style={{ maxHeight: 180 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => selectPetInWeightModal(item.id!)} 
                  style={{ 
                    padding: 8, 
                    backgroundColor: selectedPetId === item.id ? colors.surface : "transparent",
                    borderRadius: 8
                  }}
                >
                  <Text style={{ 
                    fontWeight: "700",
                    color: colors.text,
                    fontSize: fontSizes.md
                  }}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {selectedPetId ? (
            <View style={{ 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: colors.surface, 
              borderRadius: 8 
            }}>
              <Text style={{ 
                fontWeight: "800",
                color: colors.text,
                fontSize: fontSizes.md
              }}>
                {pets.find(p => p.id === selectedPetId)?.name ?? t('pets.noInfo')}
              </Text>
              <Text style={{ 
                fontSize: fontSizes.sm, 
                marginTop: 4,
                color: colors.textSecondary
              }}>
                {t('pets.lastWeight')} {lastModalRecord ? `${lastModalRecord.value} kg — ${fmt(lastModalRecord.createdAt)}` : t('pets.noInfo')}
              </Text>
            </View>
          ) : null}

          <TextInput 
            placeholder={t('pets.weightKg')} 
            placeholderTextColor={colors.textSecondary} 
            value={weightKg} 
            onChangeText={setWeightKg} 
            keyboardType="decimal-pad" 
            style={[inputStyle, { marginTop: 8 }]} 
          />
          <TextInput 
            placeholder={t('pets.observationOptional')} 
            placeholderTextColor={colors.textSecondary} 
            value={weightNote} 
            onChangeText={setWeightNote} 
            style={[inputStyle, { marginTop: 8 }]} 
          />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setWeightModalVisible(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                color: colors.text,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('general.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={submitWeight}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.primary,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: colors.background,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('pets.register')}
              </Text>
            </Pressable>
          </View>
        </ModalWithKeyboard>

        {/* Modal de Saúde */}
        <ModalWithKeyboard 
          visible={healthModalVisible} 
          onClose={() => setHealthModalVisible(false)} 
          title={t('pets.recordHealth')}
        >
          <Text style={{ 
            marginTop: 6,
            color: colors.text,
            fontSize: fontSizes.md
          }}>
            {t('pets.selectPet')}
          </Text>
          <View style={{ maxHeight: 120 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => selectPetInHealthModal(item.id!)} 
                  style={{ 
                    padding: 8, 
                    backgroundColor: selectedPetId === item.id ? colors.surface : "transparent",
                    borderRadius: 8
                  }}
                >
                  <Text style={{ 
                    fontWeight: "700",
                    color: colors.text,
                    fontSize: fontSizes.md
                  }}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          <Text style={{ 
            marginTop: 8,
            color: colors.text,
            fontSize: fontSizes.md
          }}>
            {t('pets.healthType')}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            {["VACCINE", "DEWORM", "BATH", "VISIT"].map((type) => (
              <Pressable 
                key={type} 
                onPress={() => { setHealthType(type); }} 
                style={{ 
                  padding: 8, 
                  borderRadius: 8, 
                  backgroundColor: healthType === type ? colors.primary : colors.surface, 
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={{ 
                  fontWeight: "700",
                  color: healthType === type ? colors.background : colors.text,
                  fontSize: fontSizes.sm
                }}>
                  {getHealthTypeLabel(type)}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedPetId ? (
            <View style={{ 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: colors.surface, 
              borderRadius: 8 
            }}>
              <Text style={{ 
                fontWeight: "800",
                color: colors.text,
                fontSize: fontSizes.md
              }}>
                {pets.find(p => p.id === selectedPetId)?.name ?? t('pets.noInfo')}
              </Text>
              <Text style={{ 
                fontSize: fontSizes.sm, 
                marginTop: 4,
                color: colors.textSecondary
              }}>
                {getLastHealthText(healthType)} {lastModalRecord?.note ?? ""} — {lastModalRecord ? fmt(lastModalRecord.createdAt) : t('pets.noInfo')}
              </Text>
            </View>
          ) : null}

          <TextInput 
            placeholder={t('pets.observationOptional')} 
            placeholderTextColor={colors.textSecondary} 
            value={healthNote} 
            onChangeText={setHealthNote} 
            style={[inputStyle, { marginTop: 8 }]} 
          />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setHealthModalVisible(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                color: colors.text,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('general.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={submitHealth}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.primary,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: colors.background,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('pets.register')}
              </Text>
            </Pressable>
          </View>
        </ModalWithKeyboard>

        {/* Modal de Anotação */}
        <ModalWithKeyboard 
          visible={noteModalVisible} 
          onClose={() => setNoteModalVisible(false)} 
          title={t('pets.addNote')}
        >
          <Text style={{ 
            marginTop: 6,
            color: colors.text,
            fontSize: fontSizes.md
          }}>
            {t('pets.selectPet')}
          </Text>
          <View style={{ maxHeight: 180 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => selectPetInNoteModal(item.id!)} 
                  style={{ 
                    padding: 8, 
                    backgroundColor: selectedPetId === item.id ? colors.surface : "transparent",
                    borderRadius: 8
                  }}
                >
                  <Text style={{ 
                    fontWeight: "700",
                    color: colors.text,
                    fontSize: fontSizes.md
                  }}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          <TextInput 
            placeholder={t('pets.writeNote')} 
            placeholderTextColor={colors.textSecondary} 
            value={generalNote} 
            onChangeText={setGeneralNote} 
            multiline 
            style={[inputStyle, { marginTop: 8, minHeight: 80 }]} 
          />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setNoteModalVisible(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                color: colors.text,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('general.cancel')}
              </Text>
            </Pressable>
            <Pressable
              onPress={submitNote}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: colors.primary,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: colors.background,
                fontWeight: '600',
                fontSize: fontSizes.md,
              }}>
                {t('general.save')}
              </Text>
            </Pressable>
          </View>
        </ModalWithKeyboard>
      </View>
    </KeyboardAvoidingView>
  );
}