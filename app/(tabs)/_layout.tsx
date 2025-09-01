import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import theme from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarStyle:{ backgroundColor: theme.green, height:64 },
      tabBarActiveTintColor:'#fff',
      tabBarInactiveTintColor:'#c9e3d7',
    }}>
      <Tabs.Screen name="index" options={{ title:'Localização', tabBarIcon:({color,size})=><Ionicons name="home" color={color} size={size}/> }} />
      <Tabs.Screen name="blog"  options={{ title:'Blog',        tabBarIcon:({color,size})=><Ionicons name="paw"  color={color} size={size}/> }} />
      <Tabs.Screen name="pet"   options={{ title:'Pet',         tabBarIcon:({color,size})=><Ionicons name="medkit" color={color} size={size}/> }} />
      <Tabs.Screen name="tutor" options={{ title:'Tutor',       tabBarIcon:({color,size})=><Ionicons name="person" color={color} size={size}/> }} />
    </Tabs>
  );
}


