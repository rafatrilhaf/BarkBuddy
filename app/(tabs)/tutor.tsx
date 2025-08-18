import { Text, View } from "react-native";
import { auth } from "../../services/firebase";

export default function Tutor() {
  const user = auth.currentUser;
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center", padding:16}}>
      <Text>{user ? `Logado como: ${user.email}` : "Não logado"}</Text>
    </View>
  );
}
