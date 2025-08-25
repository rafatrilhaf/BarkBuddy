import { Stack } from 'expo-router';
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown:false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="auth/forgot-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="about" options={{ presentation:'transparentModal', animation:'fade' }} />
    </Stack>
  );
}
