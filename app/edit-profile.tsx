import { HospitalColors } from '@/constants/theme';
import { updateUser, uploadProfileImage } from '@/services/userApi';
import { showApiError } from '@/utils/apiErrorHandler';
import { SessionManager } from '@/utils/session';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nroDocumento, setNroDocumento] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SessionManager.getUserData();
      if (userData) {
        setUserId(userData.id || null);
        setNombres(userData.nombres || '');
        setApellidos(userData.apellidos || '');
        setCelular(userData.celular || '');
        setEmail(userData.email || '');
        setFechaNacimiento(userData.fechaNacimiento || '');
        setNroDocumento(userData.nroDocumento || '');
        setProfileImage(userData.profileImage || null);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const initials = `${(nombres || '').charAt(0)}${(apellidos || '').charAt(0)}`.toUpperCase();

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handleUploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handleUploadImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async (uri: string) => {
    if (!userId) {
      setProfileImage(uri);
      return;
    }
    setLoadingImage(true);
    try {
      await uploadProfileImage(userId, uri);
      setProfileImage(uri);
      // Update session
      const userData = await SessionManager.getUserData();
      if (userData) {
        await SessionManager.saveUserData({ ...userData, profileImage: uri });
      }
      Alert.alert('Éxito', 'Foto de perfil actualizada.');
    } catch (error: any) {
      console.error('Upload image error:', error);
      Alert.alert('Error', 'No se pudo subir la imagen. Intente nuevamente.');
      setProfileImage(uri); // Still show locally
    } finally {
      setLoadingImage(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Cambiar foto de perfil', 'Selecciona una opción', [
      { text: 'Tomar foto', onPress: takePhoto },
      { text: 'Elegir de galería', onPress: pickImageFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (celular.length < 9) {
      Alert.alert('Error', 'El celular debe tener al menos 9 dígitos.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Cierre sesión e ingrese nuevamente.');
      return;
    }

    setLoading(true);
    try {
      await updateUser(userId, {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
        celular: celular.trim(),
        fechaNacimiento: fechaNacimiento || '2000-01-01',
        termsAccepted: true,
      });
      // Update local session
      const userData = await SessionManager.getUserData();
      await SessionManager.saveUserData({
        ...userData,
        email: email.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        celular: celular.trim(),
        fechaNacimiento,
      });
      Alert.alert('Perfil actualizado', 'Tus datos han sido actualizados correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      showApiError(error, 'Error', 'Error al actualizar el perfil. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={HospitalColors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>Actualiza tu información personal</Text>
        </View>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8}>
            {loadingImage ? (
              <View style={styles.avatar}>
                <ActivityIndicator color={HospitalColors.primary} />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handleChangePhoto} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Nombre(s)</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{nombres || 'No registrado'}</Text>
            <Text style={styles.readOnlyBadge}>No editable</Text>
          </View>

          <Text style={styles.label}>Apellidos</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{apellidos || 'No registrado'}</Text>
            <Text style={styles.readOnlyBadge}>No editable</Text>
          </View>

          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={styles.input}
            value={celular}
            onChangeText={setCelular}
            placeholder="Ej: 987654321"
            placeholderTextColor={HospitalColors.textLight}
            keyboardType="phone-pad"
            maxLength={9}
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{email || 'No registrado'}</Text>
            <Text style={styles.readOnlyBadge}>No editable</Text>
          </View>

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{fechaNacimiento || 'No registrada'}</Text>
          </View>

          {nroDocumento ? (
            <>
              <Text style={styles.label}>Nº Documento</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{nroDocumento}</Text>
                <Text style={styles.readOnlyBadge}>No editable</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Change password button */}
        <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => router.push('/change-password')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18, marginRight: 10 }}>🔒</Text>
          <Text style={styles.changePasswordText}>Cambiar contraseña</Text>
          <Text style={{ fontSize: 18, color: HospitalColors.textLight, marginLeft: 'auto' }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={HospitalColors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: HospitalColors.inputBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: HospitalColors.border, marginBottom: 12,
  },
  avatarText: { color: HospitalColors.textSecondary, fontSize: 30, fontWeight: '700' },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: HospitalColors.border, marginBottom: 12,
  },
  changePhotoBtn: {
    backgroundColor: HospitalColors.primarySoft, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: { fontSize: 13, fontWeight: '600', color: HospitalColors.primaryDark },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 22,
    borderWidth: 1, borderColor: HospitalColors.border, marginBottom: 20,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 6, marginLeft: 2,
  },
  input: {
    height: 50, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 15, color: HospitalColors.textPrimary,
    backgroundColor: HospitalColors.inputBg, marginBottom: 16,
  },
  readOnlyInput: {
    height: 50, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 12,
    paddingHorizontal: 14, backgroundColor: '#F3F4F6', marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  readOnlyText: { fontSize: 15, color: HospitalColors.textLight },
  readOnlyBadge: { fontSize: 10, color: HospitalColors.textLight, fontWeight: '600' },
  changePasswordBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: HospitalColors.border,
  },
  changePasswordText: {
    fontSize: 15, fontWeight: '600', color: HospitalColors.textPrimary,
  },
  saveBtn: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  saveBtnText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: HospitalColors.border,
  },
  cancelBtnText: { color: HospitalColors.textSecondary, fontSize: 15, fontWeight: '600' },
});
