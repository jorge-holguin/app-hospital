import { HospitalColors } from '@/constants/theme';
import { login } from '@/services/authApi';
import { getUserByEmail } from '@/services/userApi';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingrese su correo electrónico.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Correo inválido', 'Ingrese un correo electrónico válido (ej: usuario@correo.com).');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingrese su contraseña.');
      return;
    }

    setLoading(true);
    try {
      // Login with 5s timeout
      const loginPromise = login({ email: email.trim(), password });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      );
      const tokens = await Promise.race([loginPromise, timeoutPromise]);
      await SessionManager.saveTokens(tokens);

      // Fetch full user profile
      try {
        const userProfile = await getUserByEmail(email.trim());
        await SessionManager.saveUserData({
          id: userProfile.id,
          email: userProfile.email,
          nombres: userProfile.nombres,
          apellidos: userProfile.apellidos,
          celular: userProfile.celular,
          fechaNacimiento: userProfile.fechaNacimiento,
          tipoDocumento: userProfile.tipoDocumento,
          nroDocumento: userProfile.nroDocumento,
          profileImage: userProfile.profileImage,
          role: userProfile.role,
        });
      } catch {
        // If profile fetch fails, save basic data
        await SessionManager.saveUserData({ email: email.trim() });
      }

      router.replace('/dashboard');
    } catch (error: any) {
      if (error.message === 'TIMEOUT') {
        Alert.alert(
          'Tiempo agotado',
          'El servidor no respondió a tiempo. Verifique su conexión a internet e intente nuevamente.',
        );
      } else if (error.response?.status === 400) {
        Alert.alert(
          'Usuario inválido',
          'Revise si su contraseña o correo electrónico es correcto.',
        );
      } else if (error.response?.status === 403) {
        Alert.alert(
          'Cuenta no verificada',
          'Debe verificar su correo electrónico antes de iniciar sesión.',
        );
      } else if (!error.response) {
        Alert.alert(
          'Sin conexión',
          'No se pudo conectar al servidor. Verifique que está conectado a la red del hospital o a internet.',
        );
      } else {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Error al iniciar sesión. Intente nuevamente.';
        Alert.alert('Error', msg);
      }
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
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={HospitalColors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputBox, { flexDirection: 'row', alignItems: 'center' }]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={HospitalColors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ paddingHorizontal: 10, paddingVertical: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
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
