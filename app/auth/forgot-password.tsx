import { Link, router } from 'expo-router';
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
              // de app/auth/forgot-password.tsx → ../../assets/...
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
            style={{ backgroundColor: '#ececec', borderRadius: 14, padding: 12 }}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Botão enviar */}
          <Pressable
            onPress={() => {
              // quando conectar o Firebase: sendPasswordResetEmail(...)
              Alert.alert('Pronto!', 'Se o e-mail existir, enviaremos o link de recuperação.');
              router.back(); // volta para o login
            }}
            style={({ pressed }) => ({
              marginTop: 16,
              backgroundColor: pressed ? '#c6d8cd' : '#d3e3d9',
              borderRadius: 16,
              paddingVertical: 16,
            })}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '800',
                color: '#0e3b28',
                fontSize: 20,
                lineHeight: 24,
              }}
            >
              Enviar link
            </Text>
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
