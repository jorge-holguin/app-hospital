import { HospitalColors } from '@/constants/theme';
import { forgotPassword } from '@/services/authApi';
import { showApiError } from '@/utils/apiErrorHandler';
import { useRouter } from 'expo-router';
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

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Ingrese un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      // Auto-navigate to reset-password screen
      router.push({ pathname: '/reset-password', params: { email: email.trim() } });
    } catch (error: any) {
      showApiError(error, 'Error', 'Error al enviar el código. Intente nuevamente.');
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
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🔒</Text>
          </View>

          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.description}>
            Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.{'\n\n'}
            <Text style={{ fontStyle: 'italic', fontSize: 12 }}>El correo puede tardar unos minutos en llegar.</Text>
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: correo@ejemplo.com"
            placeholderTextColor={HospitalColors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, loading && { opacity: 0.7 }]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={HospitalColors.white} size="small" />
              ) : (
                <Text style={styles.sendText}>Enviar código</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HospitalColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: HospitalColors.white,
    borderRadius: 20,
    padding: 28,
    elevation: 5,
    shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: HospitalColors.border,
  },
  iconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: HospitalColors.primarySoft, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 20,
  },
  iconText: { fontSize: 28 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: HospitalColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: HospitalColors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 6, marginLeft: 2,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: HospitalColors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: HospitalColors.textPrimary,
    marginBottom: 20,
    backgroundColor: HospitalColors.inputBg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HospitalColors.inputBg,
    borderWidth: 1,
    borderColor: HospitalColors.border,
    marginRight: 10,
  },
  cancelText: {
    color: HospitalColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HospitalColors.primary,
    marginLeft: 10,
  },
  sendText: {
    color: HospitalColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
