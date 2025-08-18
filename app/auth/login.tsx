import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { signIn } from "../../services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    try {
      await signIn(email.trim(), senha);
      router.replace("/(tabs)/map");
    } catch (e: any) {
      Alert.alert("Erro ao entrar", e?.message ?? "Tente novamente");
    }
  }

  return (
    <View style={{ flex:1, gap:12, padding:20, justifyContent:"center" }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <Button title="Entrar" onPress={handleLogin} />
      <Button title="Esqueceu a senha?" onPress={() => router.push("/auth/forgot-password")} />
      <Link href="/auth/register">Não tem login? Clique aqui</Link>
    </View>
  );
}
