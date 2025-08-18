import { router } from "expo-router";
import { Button, Linking, View } from "react-native";
import { SITE_URL } from "../constants/urls";

export default function Index() {
  return (
    <View style={{ flex:1, justifyContent:"center", gap:16, padding:24 }}>
      <Button title="Sou dono de pet" onPress={() => router.push("/auth/login")} />
      <Button title="Conhecer o BarkBuddy" onPress={() => Linking.openURL(SITE_URL)} />
    </View>
  );
}
