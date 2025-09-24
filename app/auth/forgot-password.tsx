import { auth } from '@/services/firebase';
import { useHeaderHeight } from '@react-navigation/elements';
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
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
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function ForgotPassword() {
  const headerHeight = useHeaderHeight();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [kbVisible, setKbVisible] = useState(false);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, () => setKbVisible(true));
    const h = Keyboard.addListener(hideEvt, () => setKbVisible(false));
    return () => { s.remove(); h.remove(); };
  }, []);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Ops', 'Informe seu e-mail.');
      return;
    }
    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Pronto!', 'Se o e-mail existir, enviaremos o link de recuperação.');
      router.back();
    } catch (e: any) {
      const msg =
        e?.code === 'auth/user-not-found' ? 'E-mail não encontrado.' :
        e?.code === 'auth/invalid-email' ? 'E-mail inválido.' :
        'Não foi possível enviar o e-mail agora.';
      Alert.alert('Erro', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#085f37' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
          {/* Topo */}
          <View>
            <View style={{ alignItems: 'center', marginTop: kbVisible ? 24 : 48, marginBottom: kbVisible ? 8 : 16 }}>
              <Image
                source={require('../../assets/images/Logo.png')}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
            </View>

            <View style={{ alignItems: 'center', marginBottom: kbVisible ? 12 : 24 }}>
              <Image
                source={require('../../assets/images/Wordmark.png')}
                style={{ width: 200, height: 40 }}
                resizeMode="contain"
              />
            </View>

            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
              Recuperar senha
            </Text>
            <Text style={{ color: '#dfeee6', marginBottom: 12 }}>
              Informe seu e-mail cadastrado e enviaremos um link para redefinição.
            </Text>

            <Text style={{ color: '#fff', marginBottom: 6 }}>E-mail</Text>
            <TextInput
              style={s.in}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="send"
              onSubmitEditing={busy ? undefined : handleReset}
            />

            <Pressable
              onPress={busy ? undefined : handleReset}
              style={({ pressed }) => ({
                marginTop: 16,
                backgroundColor: pressed ? '#c6d8cd' : '#d3e3d9',
                borderRadius: 16,
                paddingVertical: 16,
              })}
            >
              <Text style={s.btnt}>{busy ? '...' : 'Enviar link'}</Text>
            </Pressable>

            <Link href="/auth/login" asChild>
              <Pressable>
                <Text style={{ color: '#dfeee6', textAlign: 'center', marginTop: 10 }}>
                  Voltar ao login
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Rodapé: esconde com teclado aberto */}
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
  btnt: { textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 },
} as const;
