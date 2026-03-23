import { HospitalColors } from '@/constants/theme';
import { verifyEmail } from '@/services/authApi';
import { showApiError } from '@/utils/apiErrorHandler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Por favor ingrese el código de verificación.');
      return;
    }

    setLoading(true);
    try {
      const verifyPromise = verifyEmail({ email: params.email, code: code.trim() });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 8000)
      );
      await Promise.race([verifyPromise, timeoutPromise]);
      setVerified(true);
      // Auto-redirect after short delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      showApiError(error, 'Error de verificación', 'Código inválido o expirado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {verified ? (
          <>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Text style={styles.iconText}>✅</Text>
            </View>
            <Text style={styles.title}>¡Correo verificado!</Text>
            <Text style={styles.description}>
              Su correo ha sido verificado exitosamente.{'\n'}
              Redirigiendo al inicio de sesión...
            </Text>
            <ActivityIndicator color={HospitalColors.primary} size="large" style={{ marginTop: 20 }} />
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>✉️</Text>
            </View>

            <Text style={styles.title}>Verifica tu correo</Text>
            <Text style={styles.description}>
              Hemos enviado un código de verificación a{'\n'}
              <Text style={styles.emailHighlight}>{params.email}</Text>
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>Código de verificación</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="Ingrese el código"
                placeholderTextColor={HospitalColors.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="default"
                autoCapitalize="none"
                maxLength={10}
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                onPress={handleVerify}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={HospitalColors.white} />
                ) : (
                  <Text style={styles.verifyButtonText}>Verificar</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.helpText}>
              El correo con el código puede tardar unos minutos en llegar.{'\n'}
              ¿No lo recibiste? Revisa tu carpeta de spam o correo no deseado.
            </Text>

            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backLink}>
              <Text style={styles.backLinkText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: {
    flexGrow: 1, paddingTop: 80, paddingBottom: 40, paddingHorizontal: 28, alignItems: 'center',
  },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: HospitalColors.primarySoft, justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  iconText: { fontSize: 36 },
  title: {
    fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary,
    textAlign: 'center', marginBottom: 12,
  },
  description: {
    fontSize: 14, color: HospitalColors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  emailHighlight: { fontWeight: '700', color: HospitalColors.primary },
  card: {
    width: '100%', backgroundColor: HospitalColors.white, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: HospitalColors.border, marginBottom: 24,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 8, marginLeft: 2,
  },
  codeInput: {
    height: 56, borderWidth: 1.5, borderColor: HospitalColors.border, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 20, fontWeight: '700', letterSpacing: 4,
    color: HospitalColors.textPrimary, backgroundColor: HospitalColors.inputBg, marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  verifyButtonText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  helpText: {
    fontSize: 13, color: HospitalColors.textLight, textAlign: 'center', lineHeight: 20,
    marginBottom: 20,
  },
  backLink: { paddingVertical: 8 },
  backLinkText: { fontSize: 14, color: HospitalColors.primary, fontWeight: '600' },
});
