import { HospitalColors } from '@/constants/theme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const HospitalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: HospitalColors.primary,
    background: HospitalColors.background,
    card: HospitalColors.white,
    text: HospitalColors.textPrimary,
    border: HospitalColors.border,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={HospitalTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register-step1" />
        <Stack.Screen name="register-step2" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="recover-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order-detail" />
        <Stack.Screen name="citas" />
        <Stack.Screen name="consultar-referencia" />
        <Stack.Screen name="solicitud-cita" />
        <Stack.Screen name="consultar-solicitud" />
        <Stack.Screen name="select-specialty" />
        <Stack.Screen name="search-type" />
        <Stack.Screen name="select-doctor" />
        <Stack.Screen name="select-datetime" />
        <Stack.Screen name="confirm-appointment" />
        <Stack.Screen name="edit-profile" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
