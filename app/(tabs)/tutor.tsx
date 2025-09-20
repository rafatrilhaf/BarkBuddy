// app/(tabs)/tutor.tsx
import { auth } from "@/services/firebase";
import { uploadPetImageLocal } from "@/services/pets";
import { getUser, subscribeUser, updateUser, UserProfile } from "@/services/users";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function Tutor() {
  const { colors, fontSizes } = useTheme();
  const { t } = useLanguage();

  /* ───────────────────────────  auth / guards  ─────────────────────────── */
  const user = auth.currentUser;
  useEffect(() => {
    if (!user) router.replace("/auth/login");
  }, [user]);

  const uid = user?.uid;
  const [loading, setLoading] = useState(false);

  /* ───────────────────────  perfil realtime + edição  ────────────────────── */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

  /* subscribe */
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeUser(uid, (u) => {
      setProfile(u);
      if (!editing && u) {
        setName(u.name ?? "");
        setPhone(u.phone ?? "");
        setAddress(u.address ?? "");
        setEmail(u.email ?? (user?.email ?? ""));
      }
    });
    return unsub;
  }, [uid, editing]);

  /* cria doc se não existir */
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const existing = await getUser(uid);
      if (!existing) {
        const initial: UserProfile = {
          name: user?.displayName ?? "",
          email: user?.email ?? "",
          photoUrl: "",
        };
        await updateUser(uid, initial).catch(() => {});
        setProfile(initial);
        setName(initial.name ?? "");
        setEmail(initial.email ?? "");
      }
    })();
  }, [uid]);

  /* ─────────────────────────  handlers  ────────────────────────── */
  /** escolhe nova imagem */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t('general.error'), "Autorize o acesso às fotos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });
    if (!res.canceled) setLocalPhotoUri(res.assets[0].uri);
  };

  /** remove foto atual */
  const removePhoto = () => {
    Alert.alert(t('general.confirm'), "Tem certeza?", [
      { text: t('general.cancel'), style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setLocalPhotoUri(null);
          updateUser(uid!, { photoUrl: "" }).catch(() => {});
        },
      },
    ]);
  };

  /** salvar atualização */
  const onSave = async () => {
    if (!uid) return;
    if (!name.trim()) {
      Alert.alert(t('general.error'), "Informe seu nome.");
      return;
    }

    setLoading(true);
    try {
      let remotePhoto = profile?.photoUrl;
      if (localPhotoUri) {
        remotePhoto = await uploadPetImageLocal(localPhotoUri);
        setLocalPhotoUri(null);
      }

      await updateUser(uid, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        email: email.trim() || undefined,
        photoUrl: remotePhoto || "",
      });

      Alert.alert(t('general.success'), "Informações atualizadas.");
      setEditing(false);
    } catch (err: any) {
      Alert.alert(t('general.error'), err?.message ?? "Falha ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setEditing(false);
    setLocalPhotoUri(null);
  };

  /* ────────────────────────────  UI  ───────────────────────────── */
  const avatar = localPhotoUri || profile?.photoUrl;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* avatar + ações */}
        <View style={{ alignItems: "center", marginTop: 30 }}>
          <View style={{ position: "relative" }}>
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{ width: 140, height: 140, borderRadius: 100 }}
              />
            ) : (
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 100,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="person" size={70} color={colors.textSecondary} />
              </View>
            )}

            {editing && (
              <>
                {/* editar foto */}
                <Pressable
                  onPress={pickImage}
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    backgroundColor: colors.primary,
                    borderRadius: 20,
                    padding: 6,
                  }}
                >
                  <Ionicons name="pencil" color="#fff" size={16} />
                </Pressable>

                {/* remover foto */}
                {avatar && (
                  <Pressable
                    onPress={removePhoto}
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      backgroundColor: colors.error,
                      borderRadius: 20,
                      padding: 6,
                    }}
                  >
                    <Ionicons name="trash" color="#fff" size={16} />
                  </Pressable>
                )}
              </>
            )}
          </View>

          <Text
            style={{
              color: colors.primary,
              fontSize: fontSizes.xl,
              fontWeight: "900",
              marginTop: 8,
            }}
          >
            {profile?.name ?? ""}
          </Text>
        </View>

        {/* campos formulario */}
        <View style={{ gap: 12, marginTop: 24 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('tutor.name')}
            editable={editing}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { 
              borderColor: colors.border, 
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: fontSizes.md
            }]}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t('tutor.phone')}
            editable={editing}
            keyboardType="phone-pad"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { 
              borderColor: colors.border, 
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: fontSizes.md
            }]}
          />
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder={t('tutor.address')}
            editable={editing}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { 
              borderColor: colors.border, 
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: fontSizes.md
            }]}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('tutor.email')}
            editable={editing}
            keyboardType="email-address"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { 
              borderColor: colors.border, 
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: fontSizes.md
            }]}
          />
        </View>

        {/* botões inferiores */}
        <View style={{ marginTop: 24, gap: 12 }}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : editing ? (
            <>
              <Pressable
                onPress={onSave}
                style={[styles.btn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.btnTxt, { fontSize: fontSizes.md }]}>{t('general.save')}</Text>
              </Pressable>
              <Pressable
                onPress={onCancel}
                style={[styles.btn, { backgroundColor: colors.textSecondary }]}
              >
                <Text style={[styles.btnTxt, { fontSize: fontSizes.md }]}>{t('general.cancel')}</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => setEditing(true)}
              style={[styles.btn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.btnTxt, { fontSize: fontSizes.md }]}>{t('general.edit')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  btn: {
    padding: 14,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  btnTxt: {
    color: "#fff",
    fontWeight: "800" as const,
    textAlign: "center" as const,
  },
} as const;
