import { auth } from '@/services/firebase'; // se não usar alias @, troque para ../../services/firebase
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Ops', 'Informe seu e-mail.');
      return;
    }
    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Pronto!', 'Se o e-mail existir, enviaremos o link de recuperação.');
      router.back(); // volta para o login
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* LOGO topo */}
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 16 }}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>

          {/* WORDMARK (nome) */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={require('../../assets/images/Wordmark.png')}
              style={{ width: 200, height: 40 }}
              resizeMode="contain"
            />
          </View>

          {/* Título e instrução */}
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
            Recuperar senha
          </Text>
          <Text style={{ color: '#dfeee6', marginBottom: 12 }}>
            Informe seu e-mail cadastrado e enviaremos um link para redefinição.
          </Text>

          {/* Campo e-mail */}
          <Text style={{ color: '#fff', marginBottom: 6 }}>E-mail</Text>
          <TextInput
            style={s.in}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Botão enviar */}
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

          {/* Voltar para login */}
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text style={{ color: '#dfeee6', textAlign: 'center', marginTop: 10 }}>
                Voltar ao login
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Barra inferior com marca */}
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
  btnt: { textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 },
} as const;
