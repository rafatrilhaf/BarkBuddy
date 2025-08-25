import { auth } from "@/services/firebase"; // se não usar alias @, troque para ../../services/firebase
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // opcional
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Campos obrigatórios", "Informe nome, e-mail e senha.");
      return;
    }
    try {
      setBusy(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });

      const db = getFirestore();
      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cep: cep.trim(),
        username: username.trim() || null,
        createdAt: serverTimestamp(),
      });

      router.replace("/(tabs)");
    } catch (e: any) {
      const msg =
        e?.code === "auth/email-already-in-use" ? "E-mail já cadastrado." :
        e?.code === "auth/weak-password" ? "Senha muito fraca (mínimo 6 caracteres)." :
        "Não foi possível criar sua conta.";
      Alert.alert("Erro no cadastro", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#085f37' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 24 }}>
            <Image source={require('../../assets/images/Logo.png')} style={{ width: 120, height: 120 }} />
          </View>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Nome completo:</Text>
          <TextInput style={s.in} placeholder="Seu nome" placeholderTextColor="#666" value={name} onChangeText={setName} />

          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 12, marginBottom: 6 }}>Usuário (opcional):</Text>
          <TextInput style={s.in} placeholder="ex.: juliana" placeholderTextColor="#666" autoCapitalize="none" value={username} onChangeText={setUsername} />

          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 12, marginBottom: 6 }}>E-mail:</Text>
          <TextInput style={s.in} placeholder="voce@exemplo.com" placeholderTextColor="#666" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 12, marginBottom: 6 }}>Telefone:</Text>
          <TextInput style={s.in} placeholder="(11) 99999-9999" placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 12, marginBottom: 6 }}>CEP:</Text>
          <TextInput style={s.in} placeholder="13251-360" placeholderTextColor="#666" keyboardType="numeric" value={cep} onChangeText={setCep} />

          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 12, marginBottom: 6 }}>Senha:</Text>
          <TextInput style={s.in} placeholder="••••••••" placeholderTextColor="#666" secureTextEntry value={password} onChangeText={setPassword} />

          <Pressable
            onPress={busy ? undefined : handleRegister}
            style={({ pressed }) => ({
              marginTop: 16,
              backgroundColor: pressed ? '#c6d8cd' : '#d3e3d9',
              borderRadius: 16,
              paddingVertical: 16,
            })}
          >
            <Text style={s.btnt}>{busy ? '...' : 'Criar conta'}</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: '#1b6d49', paddingVertical: 14, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center' }}>
          <Image source={require('../../assets/images/Wordmark.png')} style={{ width: 180, height: 28 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = {
  in: { backgroundColor: '#ececec', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  btnt: { textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 },
} as const;
