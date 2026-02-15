import { HospitalColors } from '@/constants/theme';
import { login } from '@/services/authApi';
import { SessionManager } from '@/utils/session';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!documentId.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingrese su documento de identidad y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const tokens = await login({ email: documentId.trim(), password });
      await SessionManager.saveTokens(tokens);
      await SessionManager.saveUserData({ email: documentId.trim() });
      router.replace('/dashboard');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Credenciales incorrectas o error de conexión.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Image source={require('@/assets/images/hospital-logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerTextBox}>
            <Text style={styles.hospitalName}>HJATCH</Text>
            <Text style={styles.hospitalSub}>Hospital de Chosica</Text>
          </View>
        </View>

        <Text style={styles.welcomeText}>Iniciar Sesión</Text>
        <Text style={styles.welcomeSub}>Ingresa tus datos para continuar</Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Documento de identidad</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Ej: 72345678"
              placeholderTextColor={HospitalColors.textLight}
              value={documentId}
              onChangeText={setDocumentId}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={HospitalColors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/recover-password')} style={styles.forgotWrap}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginButton, loading && { opacity: 0.7 }]} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={HospitalColors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register-step1')}
          activeOpacity={0.85}
        >
          <Text style={styles.registerButtonText}>Crear una cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.white },
  scrollContent: {
    flexGrow: 1, paddingTop: 56, paddingBottom: 40, paddingHorizontal: 28,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 40,
  },
  logo: { width: 52, height: 52 },
  headerTextBox: { marginLeft: 12 },
  hospitalName: {
    fontSize: 18, fontWeight: '800', color: HospitalColors.primaryDark, letterSpacing: 1,
  },
  hospitalSub: { fontSize: 12, color: HospitalColors.textLight },
  welcomeText: {
    fontSize: 28, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 6,
  },
  welcomeSub: { fontSize: 15, color: HospitalColors.textSecondary, marginBottom: 32 },
  formSection: { width: '100%' },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 6, marginLeft: 2,
  },
  inputBox: {
    backgroundColor: HospitalColors.inputBg,
    borderRadius: 12, borderWidth: 1, borderColor: HospitalColors.border,
    marginBottom: 18, paddingHorizontal: 14, height: 50, justifyContent: 'center',
  },
  input: { fontSize: 15, color: HospitalColors.textPrimary },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, color: HospitalColors.primary, fontWeight: '500' },
  loginButton: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: HospitalColors.primary,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8,
  },
  loginButtonText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  divider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 28,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: HospitalColors.border },
  dividerText: { marginHorizontal: 14, fontSize: 13, color: HospitalColors.textLight },
  registerButton: {
    height: 52, borderRadius: 14, borderWidth: 2, borderColor: HospitalColors.primary,
    justifyContent: 'center', alignItems: 'center', backgroundColor: HospitalColors.white,
  },
  registerButtonText: { color: HospitalColors.primary, fontSize: 16, fontWeight: '700' },
});
