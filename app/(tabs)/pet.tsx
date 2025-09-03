// app/(tabs)/pet.tsx
import { auth } from "@/services/firebase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Button,
  FlatList,
  Image, Keyboard, KeyboardAvoidingView,
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

type Row = Pet & { id?: string };

/**
 * ModalWithKeyboard (Bottom-sheet style)
 * - NÃO usa ScrollView para evitar nesting warnings ao renderizar FlatList dentro do modal.
 * - Posicionado no fundo da tela (like a bottom sheet), ajusta bem com o teclado.
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(visible);

  // manter internal visible para animação / evitar flicker
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    // eventos: iOS usa keyboardWillShow/Hide (animados), Android keyboardDidShow/Hide
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

  // translateY negativo sobe o bottom-sheet exatamente a altura do teclado
  const sheetTransform = { transform: [{ translateY: -keyboardHeight }] };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
        {/* Tapa para fechar */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* Bottom sheet */}
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            padding: 16,
            maxHeight: "80%",
            // aqui aplicamos a transformação dinâmica
            ...sheetTransform,
          }}
        >
          {/* header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>{title ?? ""}</Text>
            <Pressable onPress={onClose} style={{ padding: 6 }}>
              <Text style={{ fontSize: 18, color: "#666" }}>✕</Text>
            </Pressable>
          </View>

          {/* Conteúdo (sem ScrollView para evitar nesting warnings) */}
          <View style={{ paddingBottom: 8 }}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

export default function PetTab() {
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

  // último record atual mostrado no modal (quando o usuário seleciona o pet)
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

  // escolher imagem
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Autorize o acesso às fotos.");
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

  const submit = async () => {
    if (!uid) {
      Alert.alert("Faça login", "Você precisa estar logado para gerenciar seus pets.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Informe o nome do pet.");
      return;
    }

    let photoUrl: string | undefined;
    if (photoUri) {
      try {
        photoUrl = await uploadPetImageLocal(photoUri);
      } catch (e: any) {
        Alert.alert("Erro ao enviar foto", e?.message ?? "Tente novamente.");
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
      Alert.alert("Erro", e.message ?? "Falha ao salvar pet");
    }
  };

  const remove = (id?: string) => {
    if (!id) return;
    Alert.alert("Excluir pet", "Tem certeza que deseja excluir este pet?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePetById(id);
          } catch (e: any) {
            Alert.alert("Erro", e.message);
          }
        },
      },
    ]);
  };

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ------------------------- Speed Dial (Animated) ------------------------- */
  const [dialOpen, setDialOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleDial = () => {
    const to = dialOpen ? 0 : 1;
    Animated.spring(anim, { toValue: to, useNativeDriver: true, stiffness: 200, damping: 16 }).start();
    setDialOpen(!dialOpen);
  };

  // Positions for 4 items above FAB (space them vertically)
  const item1Style = {
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }),
      },
      { scale: anim },
    ],
    opacity: anim,
  };
  const item2Style = {
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -130] }),
      },
      { scale: anim },
    ],
    opacity: anim,
  };
  const item3Style = {
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -190] }),
      },
      { scale: anim },
    ],
    opacity: anim,
  };
  const item4Style = {
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -250] }),
      },
      { scale: anim },
    ],
    opacity: anim,
  };

  /* ------------------------- Modais para registrar ------------------------- */
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

  // placeholder color
  const placeholderColor = "#6b7280";

  // helper data helpers
  const fmt = (ts: any) => {
    if (!ts) return "";
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  };

  // helper: busca último registro para um pet+tipo (e opcionalmente value/subtype).
  const fetchLastFor = async (petId: string | null, type: string, subtype?: any) => {
    setLastModalRecord(null);
    if (!petId) return;
    try {
      // tenta usar getLastRecordForType (se disponível no serviço)
      if (typeof (getLastRecordForType as any) === "function") {
        const r = await getLastRecordForType(petId, type, subtype);
        setLastModalRecord(r || null);
      } else {
        // fallback: tenta buscar via getLastRecordsForPet (menos preciso para HEALTH subtype)
        const agg = await getLastRecordsForPet(petId);
        if (type === "HEALTH" && subtype) {
          // se agg.HEALTH existir e value == subtype, usa; senão null
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

  /* ---------------- open modal helpers que já buscam o último ---------------- */
  const openWalk = () => {
    if (pets.length === 0) { Alert.alert("Nenhum pet", "Cadastre um pet antes de registrar uma caminhada."); return; }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    fetchLastFor(id, "WALK");
    setWalkKm("");
    setWalkNote("");
    setWalkModalVisible(true);
    toggleDial();
  };
  const openWeight = () => {
    if (pets.length === 0) { Alert.alert("Nenhum pet", "Cadastre um pet antes de registrar o peso."); return; }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    fetchLastFor(id, "WEIGHT");
    setWeightKg("");
    setWeightNote("");
    setWeightModalVisible(true);
    toggleDial();
  };
  const openHealth = () => {
    if (pets.length === 0) { Alert.alert("Nenhum pet", "Cadastre um pet antes de registrar saúde."); return; }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    // busca já por healthType default
    fetchLastFor(id, "HEALTH", "VACCINE");
    setHealthNote("");
    setHealthType("VACCINE");
    setHealthModalVisible(true);
    toggleDial();
  };
  const openNote = () => {
    if (pets.length === 0) { Alert.alert("Nenhum pet", "Cadastre um pet antes de adicionar uma anotação."); return; }
    const id = pets[0].id ?? null;
    setSelectedPetId(id);
    setGeneralNote("");
    setNoteModalVisible(true);
    toggleDial();
  };

  // seleção de pet dentro dos modais: cada modal seleciona e busca o último respectivo
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
    // notes não precisa de último
  };

  // quando trocar subtype de health, refetch
  useEffect(() => {
    if (healthModalVisible && selectedPetId) fetchLastFor(selectedPetId, "HEALTH", healthType);
  }, [healthType]);

  const submitWalk = async () => {
    if (!selectedPetId) { Alert.alert("Selecione um pet"); return; }
    const km = Number(walkKm);
    if (Number.isNaN(km) || km <= 0) { Alert.alert("Valor inválido", "Informe a quilometragem (km)."); return; }

    try {
      await addPetRecord(selectedPetId, { type: "WALK", value: km, note: walkNote });
      // atualiza preview imediatamente
      fetchLastFor(selectedPetId, "WALK");
      setWalkModalVisible(false);
      Alert.alert("Registrado", `Caminhada de ${km} km registrada.`);
    } catch (e: any) {
      console.error("Erro registrar caminhada:", e);
      Alert.alert("Erro", e?.message ?? "Falha ao registrar.");
    }
  };

  const submitWeight = async () => {
    if (!selectedPetId) { Alert.alert("Selecione um pet"); return; }
    const kg = Number(weightKg);
    if (Number.isNaN(kg) || kg <= 0) { Alert.alert("Valor inválido", "Informe o peso (kg)."); return; }

    try {
      await addPetRecord(selectedPetId, { type: "WEIGHT", value: kg, note: weightNote });
      fetchLastFor(selectedPetId, "WEIGHT");
      setWeightModalVisible(false);
      Alert.alert("Registrado", `Peso ${kg} kg registrado.`);
    } catch (e: any) {
      console.error("Erro registrar peso:", e);
      Alert.alert("Erro", e?.message ?? "Falha ao registrar.");
    }
  };

  const submitHealth = async () => {
    if (!selectedPetId) { Alert.alert("Selecione um pet"); return; }
    try {
      await addPetRecord(selectedPetId, { type: "HEALTH", value: healthType, note: healthNote });
      // a nova entrada vira o último desse subtype
      fetchLastFor(selectedPetId, "HEALTH", healthType);
      setHealthModalVisible(false);
      Alert.alert("Registrado", `${healthType} registrado.`);
    } catch (e: any) {
      console.error("Erro registrar saúde:", e);
      Alert.alert("Erro", e?.message ?? "Falha ao registrar.");
    }
  };

  const submitNote = async () => {
    if (!selectedPetId) { Alert.alert("Selecione um pet"); return; }
    if (!generalNote.trim()) { Alert.alert("Nota vazia", "Escreva algo antes de salvar."); return; }
    try {
      await addPetRecord(selectedPetId, { type: "NOTE", value: generalNote.trim() });
      setNoteModalVisible(false);
      Alert.alert("Registrado", `Anotação salva.`);
    } catch (e: any) {
      console.error("Erro registrar nota:", e);
      Alert.alert("Erro", e?.message ?? "Falha ao registrar.");
    }
  };

  /* ------------------------- Render ------------------------- */

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Meus Pets</Text>

        {/* Botão topo para abrir formulário */}
        {!showForm && (
          <Pressable
            onPress={startCreate}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
              backgroundColor: "#e8f5ee",
              borderColor: "#0c6b41",
            }}
          >
            <Text style={{ fontWeight: "700", color: "#0c6b41" }}>+ Adicionar um pet</Text>
          </Pressable>
        )}

        {/* Formulário (colapsável) */}
        {showForm && (
          <View
            style={{
              gap: 8,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              borderColor: "#d1d5db",
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontWeight: "700" }}>{isEditing ? "Editar pet" : "Adicionar pet"}</Text>

            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: "#eee" }} />
            ) : null}

            <Pressable onPress={pickImage} style={{ alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderRadius: 8 }}>
              <Text>Escolher foto</Text>
            </Pressable>

            <TextInput placeholder="Nome *" placeholderTextColor={placeholderColor} value={name} onChangeText={setName} style={input} />
            <TextInput placeholder="Espécie (cão, gato...)" placeholderTextColor={placeholderColor} value={species} onChangeText={setSpecies} style={input} />
            <TextInput placeholder="Raça" placeholderTextColor={placeholderColor} value={breed} onChangeText={setBreed} style={input} />
            <TextInput placeholder="Idade (anos)" placeholderTextColor={placeholderColor} value={age} onChangeText={setAge} keyboardType="numeric" style={input} />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title={isEditing ? "Salvar alterações" : "Adicionar"} onPress={submit} />
              <Button title="Cancelar" onPress={resetForm} />
            </View>
          </View>
        )}

        {/* Lista de pets (cards colapsáveis) */}
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id!}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const petUrl = `https://barkbuddy-bd.web.app/${item.id}`;
            const expanded = !!expandedIds[item.id!];

            return (
              <View style={{ borderWidth: 1, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>
                {/* Cabeçalho clicável: foto + nome */}
                <Pressable onPress={() => toggleExpand(item.id!)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#f7f7f7" }}>
                  <Image
                    source={item.photoUrl ? { uri: item.photoUrl } : { uri: "https://placekitten.com/160/160" }}
                    style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#eee" }}
                  />
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
                  <View style={{ marginLeft: "auto" }}>
                    <Text style={{ opacity: 0.6 }}>{expanded ? "▲" : "▼"}</Text>
                  </View>
                </Pressable>

                {/* Conteúdo expandido */}
                {expanded && (
                  <View style={{ padding: 12, gap: 6 }}>
                    <Text>Espécie: {item.species ?? "-"}</Text>
                    <Text>Raça: {item.breed ?? "-"}</Text>
                    <Text>
                      Idade: {typeof item.age === "number" && !Number.isNaN(item.age) ? item.age : "-"}
                    </Text>

                    <View style={{ alignItems: "center", marginTop: 10 }}>
                      <QRCode value={petUrl} size={140} />
                      <Text style={{ fontSize: 12, marginTop: 4 }} selectable>
                        {petUrl}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                      <TouchableOpacity onPress={() => startEdit(item)}>
                        <Text style={link}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => remove(item.id)}>
                        <Text style={[link, { color: "crimson" }]}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text>Nenhum pet cadastrado ainda.</Text>}
          contentContainerStyle={{ paddingBottom: 280 }}
        />

        {/* Placeholder estilizado do Dashboard */}
<View
  style={{
    backgroundColor: "#e8f5ee",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  }}
>
  <Text style={{ fontSize: 18, fontWeight: "700", color: "#006B41", marginBottom: 8 }}>
    Dashboard
  </Text>

  <Text style={{ fontSize: 14, opacity: 0.7, textAlign: "center", marginBottom: 12 }}>
    Veja suas notas e os gráficos do seu pet. 
  </Text>

  <Pressable
    onPress={() => router.push("/pet/dashboard")}
    style={{
      backgroundColor: "#006B41",
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 12,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Abrir Dashboard</Text>
  </Pressable>
</View>


        {/* ---------------- Modais de registro (cada modal mostra o último registro para o pet selecionado) ---------------- */}

        {/* WALK modal */}
        <ModalWithKeyboard visible={walkModalVisible} onClose={() => setWalkModalVisible(false)} title="Registrar caminhada">
          <Text style={{ marginTop: 6 }}>Selecionar pet</Text>
          <View style={{ maxHeight: 180 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable onPress={() => selectPetInWalkModal(item.id!)} style={{ padding: 8, backgroundColor: selectedPetId === item.id ? "#eef6ef" : "transparent" }}>
                  <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>

          {/* PREVIEW: nome do pet + último walk */}
          {selectedPetId ? (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: "#fafafa", borderRadius: 8 }}>
              <Text style={{ fontWeight: "800" }}>
                {pets.find(p => p.id === selectedPetId)?.name ?? "—"}
              </Text>
              <Text style={{ fontSize: 13, marginTop: 4 }}>
                Última corrida: {lastModalRecord ? `${lastModalRecord.value} km — ${fmt(lastModalRecord.createdAt)}` : "—"}
              </Text>
            </View>
          ) : null}

          <TextInput placeholder="Quilômetros (ex: 2.5)" placeholderTextColor={placeholderColor} value={walkKm} onChangeText={setWalkKm} keyboardType="decimal-pad" style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8 }} />
          <TextInput placeholder="Observação (opcional)" placeholderTextColor={placeholderColor} value={walkNote} onChangeText={setWalkNote} style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8 }} />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Button title="Cancelar" onPress={() => setWalkModalVisible(false)} />
            <Button title="Registrar" onPress={submitWalk} />
          </View>
        </ModalWithKeyboard>

        {/* WEIGHT modal */}
        <ModalWithKeyboard visible={weightModalVisible} onClose={() => setWeightModalVisible(false)} title="Registrar peso">
          <Text style={{ marginTop: 6 }}>Selecionar pet</Text>
          <View style={{ maxHeight: 180 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable onPress={() => selectPetInWeightModal(item.id!)} style={{ padding: 8, backgroundColor: selectedPetId === item.id ? "#eef6ef" : "transparent" }}>
                  <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>

          {/* PREVIEW peso */}
          {selectedPetId ? (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: "#fafafa", borderRadius: 8 }}>
              <Text style={{ fontWeight: "800" }}>{pets.find(p => p.id === selectedPetId)?.name ?? "—"}</Text>
              <Text style={{ fontSize: 13, marginTop: 4 }}>
                Último peso: {lastModalRecord ? `${lastModalRecord.value} kg — ${fmt(lastModalRecord.createdAt)}` : "—"}
              </Text>
            </View>
          ) : null}

          <TextInput placeholder="Peso (kg)" placeholderTextColor={placeholderColor} value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8 }} />
          <TextInput placeholder="Observação (opcional)" placeholderTextColor={placeholderColor} value={weightNote} onChangeText={setWeightNote} style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8 }} />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Button title="Cancelar" onPress={() => setWeightModalVisible(false)} />
            <Button title="Registrar" onPress={submitWeight} />
          </View>
        </ModalWithKeyboard>

        {/* HEALTH modal */}
        <ModalWithKeyboard visible={healthModalVisible} onClose={() => setHealthModalVisible(false)} title="Registrar evento de saúde">
          <Text style={{ marginTop: 6 }}>Selecionar pet</Text>
          <View style={{ maxHeight: 120 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable onPress={() => selectPetInHealthModal(item.id!)} style={{ padding: 8, backgroundColor: selectedPetId === item.id ? "#eef6ef" : "transparent" }}>
                  <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>

          <Text style={{ marginTop: 8 }}>Tipo</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            {["VACCINE", "DEWORM", "BATH", "VISIT"].map((t) => (
              <Pressable key={t} onPress={() => { setHealthType(t); /* fetch em useEffect */ }} style={{ padding: 8, borderRadius: 8, backgroundColor: healthType === t ? "#eef6ef" : "#fafafa", borderWidth: 1 }}>
                <Text style={{ fontWeight: "700" }}>{t === "VACCINE" ? "Vacina" : t === "DEWORM" ? "Vermífugo" : t === "BATH" ? "Banho" : "Consulta"}</Text>
              </Pressable>
            ))}
          </View>

          {/* PREVIEW: último health do subtype selecionado */}
          {selectedPetId ? (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: "#fafafa", borderRadius: 8 }}>
              <Text style={{ fontWeight: "800" }}>{pets.find(p => p.id === selectedPetId)?.name ?? "—"}</Text>
              <Text style={{ fontSize: 13, marginTop: 4 }}>
                {healthType === "VACCINE" ? `Última vacina: ${lastModalRecord?.note ?? ""}` : healthType === "BATH" ? `Último banho` : healthType === "DEWORM" ? `Último vermífugo` : `Última consulta`} — {lastModalRecord ? fmt(lastModalRecord.createdAt) : "—"}
              </Text>
            </View>
          ) : null}

          <TextInput placeholder="Observação (opcional)" placeholderTextColor={placeholderColor} value={healthNote} onChangeText={setHealthNote} style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8 }} />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Button title="Cancelar" onPress={() => setHealthModalVisible(false)} />
            <Button title="Registrar" onPress={submitHealth} />
          </View>
        </ModalWithKeyboard>

        {/* NOTE modal */}
        <ModalWithKeyboard visible={noteModalVisible} onClose={() => setNoteModalVisible(false)} title="Adicionar anotação">
          <Text style={{ marginTop: 6 }}>Selecionar pet</Text>
          <View style={{ maxHeight: 180 }}>
            <FlatList
              data={pets}
              keyExtractor={(p) => p.id!}
              renderItem={({ item }) => (
                <Pressable onPress={() => selectPetInNoteModal(item.id!)} style={{ padding: 8, backgroundColor: selectedPetId === item.id ? "#eef6ef" : "transparent" }}>
                  <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>

          <TextInput placeholder="Escreva sua anotação aqui..." placeholderTextColor={placeholderColor} value={generalNote} onChangeText={setGeneralNote} multiline style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 8, minHeight: 80 }} />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Button title="Cancelar" onPress={() => setNoteModalVisible(false)} />
            <Button title="Salvar" onPress={submitNote} />
          </View>
        </ModalWithKeyboard>

        {/* ---------------- Speed Dial UI (4 itens) ---------------- */}
        {/* item 4 (mais alto) - anotação */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item4Style]}>
          <Pressable onPress={openNote} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>📝</Text>
          </Pressable>
        </Animated.View>

        {/* item 3 - saúde */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item3Style]}>
          <Pressable onPress={openHealth} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>💉</Text>
          </Pressable>
        </Animated.View>

        {/* item 2 (meio) - peso */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item2Style]}>
          <Pressable onPress={openWeight} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>⚖️</Text>
          </Pressable>
        </Animated.View>

        {/* item 1 (mais baixo) - caminhada */}
        <Animated.View style={[{ position: "absolute", right: 20, bottom: 24 }, item1Style]}>
          <Pressable onPress={openWalk} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>🚶</Text>
          </Pressable>
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
              backgroundColor: "#0c6b41",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 6,
            }}
            accessibilityLabel="Ações rápidas"
          >
            <Text style={{ color: "#fff", fontSize: 28, lineHeight: 28 }}>{dialOpen ? "×" : "＋"}</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}



const input = { borderWidth: 1, borderRadius: 8, padding: 10 } as const;
const link = { color: "#2563eb", fontWeight: "600" } as const;
