import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { resetPassword } from "../../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function handleReset() {
    try {
      await resetPassword(email.trim());
      Alert.alert("Pronto!", "Se o email existir, enviamos um link de recuperação.");
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Tente novamente");
    }
  }

  return (
    <View style={{ flex:1, gap:12, padding:20, justifyContent:"center" }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Button title="Enviar link" onPress={handleReset} />
    </View>
  );
}
