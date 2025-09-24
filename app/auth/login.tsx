import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { auth } from '@/services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

export default function Login() {
  const headerHeight = useHeaderHeight();

  const [userOrEmail, setUserOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [kbVisible, setKbVisible] = useState(false);

  // Fecha teclado ao tocar fora + colapsa rodapé quando teclado abre
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, () => setKbVisible(true));
    const h = Keyboard.addListener(hideEvt, () => setKbVisible(false));
    return () => { s.remove(); h.remove(); };
  }, []);

  const resolveEmailIfUsername = async (value: string) => {
    if (value.includes('@')) return value.trim();
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
      const email = await resolveEmailIfUsername(userOrEmail);
      if (!email) {
        Alert.alert('Conta não encontrada', 'Verifique seu e-mail/usuário.');
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/blog');
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
      // iOS: compensa header; Android: 0 (com "pan" no app.json)
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      {/* Tocar em qualquer área vazia fecha o teclado */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
          {/* Topo */}
          <View>
            <View style={{ alignItems: 'center', marginTop: kbVisible ? 24 : 60, marginBottom: kbVisible ? 16 : 40 }}>
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
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss()}
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
                returnKeyType="go"
                onSubmitEditing={busy ? undefined : handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Pressable onPress={() => router.push('/auth/forgot-password')}>
              <Text style={{ color: '#dfeee6', alignSelf: 'flex-end', marginTop: 8 }}>*Esqueceu a senha?</Text>
            </Pressable>

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

            <Link href="/auth/register" asChild>
              <Pressable>
                <Text style={{ color: '#dfeee6', textAlign: 'center', marginTop: 12 }}>
                  Não tem login? Clique aqui
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Rodapé: esconde quando teclado está aberto para sobrar espaço pro botão */}
          {!kbVisible && (
            <View
              style={{
                backgroundColor: '#1b6d49',
                paddingVertical: 20,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                alignItems: 'center',
                marginHorizontal: -20,
                marginVertical: -20,
                paddingHorizontal: 20,
              }}
            >
              <Image source={require('../../assets/images/Wordmark.png')} style={{ width: 180, height: 42 }} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
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
  passwordInput: { flex: 1, paddingRight: 10 },
  eyeButton: { padding: 5 },
  btnt: { textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 },
} as const;
