// app/auth/login.tsx
import { Link, router } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function Login() {
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#085f37' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 24 }}>
            <Image source={require('../../assets/images/Logo.png')} style={{ width: 120, height: 120 }} />
          </View>

          <Text style={{ color: '#fff', fontWeight: '800', marginBottom: 6 }}>Login:</Text>
          <TextInput style={s.in} placeholder="email ou usuário" placeholderTextColor="#666" autoCapitalize="none" />
          <Text style={{ color: '#fff', fontWeight: '800', marginTop: 12, marginBottom: 6 }}>Senha:</Text>
          <TextInput style={s.in} placeholder="••••••••" placeholderTextColor="#666" secureTextEntry />

          {/* ABRE ESQUECEU SENHA */}
          <Pressable onPress={() => router.push('/auth/forgot-password')}>
            <Text style={{ color: '#dfeee6' , alignSelf:'flex-end' , marginTop:6 }}>*Esqueceu a senha?</Text>
          </Pressable>


          {/* LOGIN → TABS */}
          <Pressable onPress={() => router.replace('./(tabs)')} style={({ pressed }) => ({
            marginTop: 16,
            backgroundColor: pressed ? '#c6d8cd' : '#d3e3d9',
            borderRadius: 16,
            paddingVertical: 16,
          })}
          >
            <Text style={s.btnt}>Login</Text>
          </Pressable>

          {/* ABRE CADASTRO */}
          {/* ABRE CADASTRO */}
          <Link href="/auth/register" asChild>
            <Pressable>
              <Text style={{ color: '#dfeee6', textAlign: 'center', marginTop: 8 }}>
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
  btn: { marginTop: 16, backgroundColor: '#ececec', borderRadius: 16, paddingVertical: 16 },
  btnt: { textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 },
} as const;
