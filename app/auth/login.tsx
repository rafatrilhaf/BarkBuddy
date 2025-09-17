import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// se já existir esses helpers no seu projeto, use-os:
import { auth } from '@/services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

export default function Login() {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resolveEmailIfUsername = async (value: string) => {
    if (value.includes('@')) return value.trim();
    // opcional: login por "usuário" -> busca o email na coleção users
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('username', '==', value.trim()));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const data = snap.docs[0].data() as any;
      return (data?.email || '').trim() || null;
    } catch {
      return null;
    }
  };

  const handleLogin = async () => {
    if (!userOrEmail || !password) {
      Alert.alert('Ops', 'Informe login e senha.');
      return;
    }
    try {
      setBusy(true);
      let email = await resolveEmailIfUsername(userOrEmail);
      if (!email) {
        Alert.alert('Conta não encontrada', 'Verifique seu e-mail/usuário.');
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ navega para as tabs
      router.replace('/(tabs)/blog');
      // se preferir, pode usar: router.replace('/(tabs)/index');
    } catch (e: any) {
      const msg =
        e?.code === 'auth/invalid-credential' ? 'Credenciais inválidas.' :
        e?.code === 'auth/too-many-requests' ? 'Muitas tentativas. Tente mais tarde.' :
        'Não foi possível entrar. Tente novamente.';
      Alert.alert('Erro no login', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#085f37' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 40 }}>
            <Image source={require('../../assets/images/Logo.png')} style={{ width: 120, height: 120 }} />
          </View>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Login:</Text>
          <TextInput
            style={s.in}
            placeholder="email ou usuário"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={userOrEmail}
            onChangeText={setUserOrEmail}
          />

          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 16, marginBottom: 6 }}>Senha:</Text>
          <View style={s.passwordContainer}>
            <TextInput
              style={s.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* ABRE ESQUECEU SENHA */}
          <Pressable onPress={() => router.push('/auth/forgot-password')}>
            <Text style={{ color: '#dfeee6', alignSelf: 'flex-end', marginTop: 8 }}>*Esqueceu a senha?</Text>
          </Pressable>

          {/* LOGIN → TABS (sem mudar visual) */}
          <Pressable
            onPress={busy ? undefined : handleLogin}
            style={({ pressed }) => ({
              marginTop: 20,
              backgroundColor: pressed ? '#c6d8cd' : '#d3e3d9',
              borderRadius: 16,
              paddingVertical: 16,
            })}
          >
            <Text style={s.btnt}>{busy ? 'Carregando...' : 'Login'}</Text>
          </Pressable>

          {/* ABRE CADASTRO */}
          <Link href="/auth/register" asChild>
            <Pressable>
              <Text style={{ color: '#dfeee6', textAlign: 'center', marginTop: 12 }}>
                Não tem login? Clique aqui
              </Text>
            </Pressable>
          </Link>
        </View>

        <View
          style={{
            backgroundColor: '#1b6d49',
            paddingVertical: 14,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            alignItems: 'center',
          }}
        >
          <Image source={require('../../assets/images/Wordmark.png')} style={{ width: 180, height: 28 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = {
  in: { backgroundColor: '#ececec', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ececec', 
    borderRadius: 14, 
    paddingHorizontal: 14, 
    paddingVertical: 12 
  },
  passwordInput: { 
    flex: 1, 
    paddingRight: 10 
  },
  eyeButton: { 
    padding: 5 
  },
  btn: { marginTop: 16, backgroundColor: '#ececec', borderRadius: 16, paddingVertical: 16 },
  btnt: { textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 },
} as const;