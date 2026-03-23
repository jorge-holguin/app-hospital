import { HospitalColors } from '@/constants/theme';
import { getTipoDocumentoOptions, register, TipoDocumentoOption } from '@/services/authApi';
import { showApiError } from '@/utils/apiErrorHandler';
import { SessionManager } from '@/utils/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Modal, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

const TERMS_TEXT = `TÉRMINOS Y CONDICIONES DE USO

APLICATIVO MÓVIL Y SITIO WEB
HOSPITAL JOSÉ AGURTO TELLO

1. IDENTIFICACIÓN DEL RESPONSABLE
Los presentes Términos y Condiciones de Uso (en adelante, los "Términos") regulan el acceso y utilización del aplicativo móvil, sitio web institucional y servicios digitales del Hospital José Agurto Tello, establecimiento de salud del Estado Peruano, adscrito al Ministerio de Salud (MINSA), con domicilio institucional en la República del Perú (en adelante, el "HOSPITAL").
El HOSPITAL actúa como titular del banco de datos personales conforme a la normativa vigente.

2. MARCO NORMATIVO APLICABLE
El uso del aplicativo móvil y sitio web se rige por la legislación peruana vigente, incluyendo:
• Ley N° 26842
• Ley N° 29733
• Decreto Supremo N° 003-2013-JUS
• Ley N° 27658
• Ley N° 27269
• Normativa y lineamientos emitidos por el Ministerio de Salud (MINSA) sobre Historia Clínica Electrónica, Gobierno Digital y Seguridad de la Información.

3. ACEPTACIÓN DE LOS TÉRMINOS
Al descargar, instalar, registrarse o utilizar el aplicativo móvil o sitio web, el Usuario declara:
• Haber leído íntegramente estos Términos.
• Aceptarlos expresamente.
• Cumplir con la normativa vigente.
Si el Usuario no está de acuerdo, deberá abstenerse de utilizar los servicios digitales del HOSPITAL.

4. FINALIDAD DEL APLICATIVO Y SITIO WEB
El aplicativo móvil y sitio web tienen como finalidad:
• Gestión de citas médicas.
• Consulta de programación.
• Información institucional.
• Acceso a resultados (cuando corresponda).
• Servicios digitales autorizados por el HOSPITAL.
La información publicada tiene carácter informativo y no sustituye consulta médica presencial ni constituye diagnóstico médico.

5. CONDICIONES DE USO
El Usuario se compromete a:
• Proporcionar información veraz y actualizada.
• No suplantar identidad.
• No realizar accesos indebidos.
• No intentar vulnerar la seguridad del sistema.
• No usar el sistema para fines ilícitos.
El HOSPITAL podrá suspender o bloquear cuentas ante incumplimientos.

6. USO POR MENORES DE EDAD
El uso del aplicativo por menores de edad deberá realizarse bajo representación de padre, madre o tutor legal conforme a la legislación peruana.

7. CUENTA DE USUARIO
Para acceder a determinados servicios, el Usuario deberá crear una cuenta.
El Usuario es responsable de:
• La confidencialidad de su contraseña.
• Las acciones realizadas desde su cuenta.
• Cerrar sesión en dispositivos compartidos.
El HOSPITAL podrá bloquear cuentas por razones de seguridad o uso indebido.

8. POLÍTICA DE CITAS MÉDICAS
8.1 Reserva de Citas
Las citas médicas están sujetas a disponibilidad de agenda institucional.
8.2 Pago de Citas
En el caso de servicios sujetos a pago:
• El pago se realizará el mismo día de la atención.
• El pago se efectuará en los canales autorizados por el HOSPITAL.
8.3 Tolerancia y Deserción
• El paciente deberá presentarse puntualmente a la hora programada.
• Si el paciente no se presenta a la hora exacta asignada, la cita será anulada automáticamente.
• El sistema registrará al paciente en condición de "deserción".
• La cita será liberada para otro paciente.
El HOSPITAL podrá establecer medidas administrativas ante reiteradas inasistencias conforme a normativa interna.

9. DISPONIBILIDAD DEL SERVICIO
El HOSPITAL realiza esfuerzos razonables para garantizar disponibilidad del sistema; sin embargo:
• No garantiza funcionamiento ininterrumpido.
• Puede suspender temporalmente el servicio por mantenimiento.
• No es responsable por fallas de conectividad del Usuario.

10. PROTECCIÓN DE DATOS PERSONALES
El tratamiento de datos personales se realiza conforme a Ley N° 29733.
Los datos de salud constituyen datos sensibles y reciben nivel de protección alto.
10.1 Finalidad
• Gestión de citas.
• Atención médica.
• Historia clínica.
• Estadísticas sanitarias.
• Cumplimiento de obligaciones legales.
10.2 Derechos ARCO
El Usuario puede ejercer derechos de:
• Acceso
• Rectificación
• Cancelación
• Oposición
Mediante solicitud formal ante el HOSPITAL.
10.3 Medidas de Seguridad
El HOSPITAL implementa:
• Protocolos HTTPS.
• Control de accesos.
• Registro de auditoría.
• Trazabilidad de accesos a historia clínica.
• Copias de seguridad.
• Gestión de incidentes.

11. HISTORIA CLÍNICA ELECTRÓNICA
Cuando el sistema permita acceso a información clínica:
• Los registros son inalterables.
• Todo acceso queda auditado.
• Solo personal autorizado puede acceder.
• El Usuario solo puede visualizar su propia información.

12. PROPIEDAD INTELECTUAL
Todo el contenido del aplicativo y sitio web pertenece al HOSPITAL o al Estado Peruano.
Está prohibida su reproducción sin autorización expresa.

13. LIMITACIÓN DE RESPONSABILIDAD
El HOSPITAL no será responsable por:
• Uso indebido del aplicativo.
• Pérdida de información causada por terceros.
• Interrupciones ajenas a su control.
• Ataques informáticos externos.
Sin perjuicio de las responsabilidades establecidas por ley.

14. ENLACES A TERCEROS
El sitio puede contener enlaces externos.
El HOSPITAL no es responsable por contenido de terceros.

15. SEGURIDAD Y BRECHAS
En caso de incidente de seguridad que comprometa datos personales, el HOSPITAL actuará conforme a la normativa vigente y procedimientos internos del Estado.

16. ELIMINACIÓN DE CUENTA
El Usuario podrá solicitar la eliminación de su cuenta, sin perjuicio de la conservación obligatoria de datos clínicos conforme a la Ley General de Salud.

17. MODIFICACIONES
El HOSPITAL podrá modificar los presentes Términos para adecuarlos a:
• Cambios normativos.
• Lineamientos MINSA.
• Mejoras tecnológicas.
• Disposiciones del Estado Peruano.
Las modificaciones serán publicadas en el sitio web institucional.

18. LEY APLICABLE Y JURISDICCIÓN
Estos Términos se rigen por las leyes de la República del Perú.
Cualquier controversia será sometida a la jurisdicción de los jueces competentes del Perú.

19. VIGENCIA
Los presentes Términos entran en vigencia desde su publicación oficial en el portal institucional del HOSPITAL.`;

export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    nombres: string; apellidos: string; email: string; password: string;
  }>();

  const [celular, setCelular] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [adultAccepted, setAdultAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpedicionPicker, setShowExpedicionPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tipo documento
  const [tipoDocumentoOptions, setTipoDocumentoOptions] = useState<TipoDocumentoOption[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoOption | null>(null);
  const [showTipoDocPicker, setShowTipoDocPicker] = useState(false);
  const [nroDocumento, setNroDocumento] = useState('');
  const [digitoVerificacion, setDigitoVerificacion] = useState('');
  const [fechaExpedicion, setFechaExpedicion] = useState('');

  // Date picker state (for fecha nacimiento)
  const [pickerYear, setPickerYear] = useState(1990);
  const [pickerMonth, setPickerMonth] = useState(1);
  const [pickerDay, setPickerDay] = useState(1);

  // Date picker state (for fecha expedicion)
  const [expPickerYear, setExpPickerYear] = useState(new Date().getFullYear());
  const [expPickerMonth, setExpPickerMonth] = useState(1);
  const [expPickerDay, setExpPickerDay] = useState(1);

  useEffect(() => {
    loadTipoDocumentoOptions();
  }, []);

  const loadTipoDocumentoOptions = async () => {
    const options = await getTipoDocumentoOptions();
    setTipoDocumentoOptions(options);
    // Default to DNI
    const dniOption = options.find((o: TipoDocumentoOption) => o.tipoDocumento.trim() === 'D');
    if (dniOption) setTipoDocumento(dniOption);
  };

  const isDNI = tipoDocumento?.tipoDocumento?.trim() === 'D';

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateConfirm = () => {
    const m = String(pickerMonth).padStart(2, '0');
    const d = String(pickerDay > daysInMonth ? daysInMonth : pickerDay).padStart(2, '0');
    const selectedDate = new Date(pickerYear, pickerMonth - 1, Math.min(pickerDay, daysInMonth));
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();
    const isUnder18 = age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));
    
    if (isUnder18) {
      Alert.alert(
        'Edad no permitida',
        'Esta aplicación solo está disponible para mayores de 18 años de edad.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setFechaNacimiento(`${pickerYear}-${m}-${d}`);
    setShowDatePicker(false);
  };

  const expDaysInMonth = new Date(expPickerYear, expPickerMonth, 0).getDate();
  const expYears = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const expDays = Array.from({ length: expDaysInMonth }, (_, i) => i + 1);

  const handleExpedicionConfirm = () => {
    const m = String(expPickerMonth).padStart(2, '0');
    const d = String(expPickerDay > expDaysInMonth ? expDaysInMonth : expPickerDay).padStart(2, '0');
    setFechaExpedicion(`${expPickerYear}-${m}-${d}`);
    setShowExpedicionPicker(false);
  };

  const handleRegister = async () => {
    if (!celular.trim() || !fechaNacimiento.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
      return;
    }
    if (celular.length < 9) {
      Alert.alert('Error', 'El número de celular debe tener al menos 9 dígitos.');
      return;
    }
    if (!tipoDocumento) {
      Alert.alert('Error', 'Seleccione un tipo de documento.');
      return;
    }
    if (!nroDocumento.trim()) {
      Alert.alert('Error', 'Ingrese su número de documento.');
      return;
    }
    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaNacimiento)) {
      Alert.alert('Error', 'La fecha de nacimiento debe tener formato AAAA-MM-DD (ej: 1990-05-15).');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Error', 'Debe aceptar los términos y condiciones para continuar.');
      return;
    }
    if (!adultAccepted) {
      Alert.alert('Error', 'Debe confirmar que es mayor de 18 años para continuar.');
      return;
    }

    setLoading(true);
    try {
      const tokens = await register({
        nombres: params.nombres,
        apellidos: params.apellidos,
        email: params.email,
        celular: celular.trim(),
        fechaNacimiento: fechaNacimiento.trim(),
        password: params.password,
        termsAccepted: true,
        tipoDocumento: tipoDocumento.tipoDocumento,
        nroDocumento: nroDocumento.trim(),
        digitoVerificacion: isDNI ? digitoVerificacion.trim() : undefined,
        fechaExpedicion: fechaExpedicion.trim() || undefined,
      });
      await SessionManager.saveTokens(tokens);
      await SessionManager.saveUserData({
        email: params.email,
        nombres: params.nombres,
        apellidos: params.apellidos,
        celular: celular.trim(),
        tipoDocumento: tipoDocumento.tipoDocumento,
        nroDocumento: nroDocumento.trim(),
      });
      // Navigate to email verification screen
      router.replace({
        pathname: '/verify-email',
        params: { email: params.email },
      });
    } catch (error: any) {
      showApiError(error, 'Error de registro', 'No se pudo completar el registro. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.stepLabel}>Paso 2 de 2 — Datos de contacto</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Info chip from step 1 */}
        <View style={styles.infoChip}>
          <Text style={styles.infoChipText}>
            {params.nombres} {params.apellidos} — {params.email}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 987654321"
            placeholderTextColor={HospitalColors.textLight}
            value={celular}
            onChangeText={setCelular}
            keyboardType="phone-pad"
            maxLength={9}
          />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, color: fechaNacimiento ? HospitalColors.textPrimary : HospitalColors.textLight }}>
              {fechaNacimiento || 'Seleccionar fecha de nacimiento'}
            </Text>
          </TouchableOpacity>

          {/* Tipo de Documento */}
          <Text style={styles.label}>Tipo de documento</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowTipoDocPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, color: tipoDocumento ? HospitalColors.textPrimary : HospitalColors.textLight }}>
              {tipoDocumento?.nombre || 'Seleccionar tipo de documento'}
            </Text>
          </TouchableOpacity>

          {/* Número de documento */}
          <Text style={styles.label}>Número de documento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 12345678"
            placeholderTextColor={HospitalColors.textLight}
            value={nroDocumento}
            onChangeText={(text) => setNroDocumento(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={15}
          />

          {/* Dígito verificador (solo para DNI) */}
          {isDNI && (
            <>
              <Text style={styles.label}>Dígito verificador</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 5"
                placeholderTextColor={HospitalColors.textLight}
                value={digitoVerificacion}
                onChangeText={(text) => setDigitoVerificacion(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={1}
              />
            </>
          )}

          {/* Fecha de expedición */}
          <Text style={styles.label}>Fecha de emisión</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowExpedicionPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, color: fechaExpedicion ? HospitalColors.textPrimary : HospitalColors.textLight }}>
              {fechaExpedicion || 'Seleccionar fecha de expedición'}
            </Text>
          </TouchableOpacity>

          {/* Terms checkbox */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Acepto los{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                Términos y Condiciones
              </Text>{' '}
              y autorizo el tratamiento de mis datos personales.
            </Text>
          </TouchableOpacity>

          {/* Adult checkbox */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAdultAccepted(!adultAccepted)}>
            <View style={[styles.checkbox, adultAccepted && styles.checkboxChecked]}>
              {adultAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Confirmo que soy mayor de 18 años de edad.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={HospitalColors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Registrarme</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginLink}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginBtnText}>Inicia tu Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: HospitalColors.white, borderRadius: 20, padding: 24, width: '85%', maxWidth: 340 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, textAlign: 'center', marginBottom: 20 }}>
              Fecha de nacimiento
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {/* Day - Primera columna */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: HospitalColors.textLight, marginBottom: 6, textAlign: 'center' }}>Día</Text>
                <ScrollView style={{ height: 120, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 10, backgroundColor: HospitalColors.inputBg }}>
                  {days.map(d => (
                    <TouchableOpacity key={d} onPress={() => setPickerDay(d)} style={{ paddingVertical: 8, paddingHorizontal: 6, backgroundColor: d === pickerDay ? HospitalColors.primarySoft : 'transparent', borderRadius: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: d === pickerDay ? '700' : '400', color: d === pickerDay ? HospitalColors.primary : HospitalColors.textPrimary }}>{String(d).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Month - Segunda columna */}
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: HospitalColors.textLight, marginBottom: 6, textAlign: 'center' }}>Mes</Text>
                <ScrollView style={{ height: 120, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 10, backgroundColor: HospitalColors.inputBg }}>
                  {months.map(m => (
                    <TouchableOpacity key={m} onPress={() => setPickerMonth(m)} style={{ paddingVertical: 8, paddingHorizontal: 6, backgroundColor: m === pickerMonth ? HospitalColors.primarySoft : 'transparent', borderRadius: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: m === pickerMonth ? '700' : '400', color: m === pickerMonth ? HospitalColors.primary : HospitalColors.textPrimary }}>{String(m).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Year - Tercera columna */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: HospitalColors.textLight, marginBottom: 6, textAlign: 'center' }}>Año</Text>
                <ScrollView style={{ height: 120, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 10, backgroundColor: HospitalColors.inputBg }}>
                  {years.map(y => (
                    <TouchableOpacity key={y} onPress={() => setPickerYear(y)} style={{ paddingVertical: 8, paddingHorizontal: 6, backgroundColor: y === pickerYear ? HospitalColors.primarySoft : 'transparent', borderRadius: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: y === pickerYear ? '700' : '400', color: y === pickerYear ? HospitalColors.primary : HospitalColors.textPrimary }}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary, marginBottom: 16 }}>
              {String(Math.min(pickerDay, daysInMonth)).padStart(2, '0')}/{String(pickerMonth).padStart(2, '0')}/{pickerYear}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: HospitalColors.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: HospitalColors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDateConfirm} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: HospitalColors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: HospitalColors.white }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal visible={showTermsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.termsTitle}>APLICATIVO MÓVIL Y SITIO WEB</Text>
            <Text style={styles.termsSubtitle}>HOSPITAL JOSÉ AGURTO TELLO</Text>
            
            <Text style={styles.termsSectionTitle}>1. IDENTIFICACIÓN DEL RESPONSABLE</Text>
            <Text style={styles.termsText}>
              Los presentes Términos y Condiciones de Uso (en adelante, los "Términos") regulan el acceso y utilización del aplicativo móvil, sitio web institucional y servicios digitales del Hospital José Agurto Tello, establecimiento de salud del Estado Peruano, adscrito al Ministerio de Salud (MINSA), con domicilio institucional en la República del Perú (en adelante, el "HOSPITAL").
            </Text>
            <Text style={styles.termsText}>
              El HOSPITAL actúa como titular del banco de datos personales conforme a la normativa vigente.
            </Text>

            <Text style={styles.termsSectionTitle}>2. MARCO NORMATIVO APLICABLE</Text>
            <Text style={styles.termsText}>
              El uso del aplicativo móvil y sitio web se rige por la legislación peruana vigente, incluyendo:
            </Text>
            <Text style={styles.termsBullet}>• Ley N° 26842</Text>
            <Text style={styles.termsBullet}>• Ley N° 29733</Text>
            <Text style={styles.termsBullet}>• Decreto Supremo N° 003-2013-JUS</Text>
            <Text style={styles.termsBullet}>• Ley N° 27658</Text>
            <Text style={styles.termsBullet}>• Ley N° 27269</Text>
            <Text style={styles.termsBullet}>• Normativa y lineamientos emitidos por el Ministerio de Salud (MINSA)</Text>

            <Text style={styles.termsSectionTitle}>3. ACEPTACIÓN DE LOS TÉRMINOS</Text>
            <Text style={styles.termsText}>
              Al descargar, instalar, registrarse o utilizar el aplicativo móvil o sitio web, el Usuario declara:
            </Text>
            <Text style={styles.termsBullet}>• Haber leído íntegramente estos Términos</Text>
            <Text style={styles.termsBullet}>• Aceptarlos expresamente</Text>
            <Text style={styles.termsBullet}>• Cumplir con la normativa vigente</Text>

            <Text style={styles.termsSectionTitle}>4. FINALIDAD DEL APLICATIVO Y SITIO WEB</Text>
            <Text style={styles.termsText}>El aplicativo móvil y sitio web tienen como finalidad:</Text>
            <Text style={styles.termsBullet}>• Gestión de citas médicas</Text>
            <Text style={styles.termsBullet}>• Consulta de programación</Text>
            <Text style={styles.termsBullet}>• Información institucional</Text>
            <Text style={styles.termsBullet}>• Acceso a resultados (cuando corresponda)</Text>

            <Text style={styles.termsSectionTitle}>8. POLÍTICA DE CITAS MÉDICAS</Text>
            <Text style={styles.termsSubsection}>8.3 Tolerancia y Deserción</Text>
            <Text style={styles.termsBullet}>• El paciente deberá presentarse puntualmente a la hora programada</Text>
            <Text style={styles.termsBullet}>• Si el paciente no se presenta a la hora exacta asignada, la cita será anulada automáticamente</Text>
            <Text style={styles.termsBullet}>• El sistema registrará al paciente en condición de "deserción"</Text>
            <Text style={styles.termsBullet}>• La cita será liberada para otro paciente</Text>

            <Text style={styles.termsSectionTitle}>10. PROTECCIÓN DE DATOS PERSONALES</Text>
            <Text style={styles.termsText}>
              El tratamiento de datos personales se realiza conforme a Ley N° 29733. Los datos de salud constituyen datos sensibles y reciben nivel de protección alto.
            </Text>
            <Text style={styles.termsSubsection}>10.2 Derechos ARCO</Text>
            <Text style={styles.termsText}>El Usuario puede ejercer derechos de:</Text>
            <Text style={styles.termsBullet}>• Acceso</Text>
            <Text style={styles.termsBullet}>• Rectificación</Text>
            <Text style={styles.termsBullet}>• Cancelación</Text>
            <Text style={styles.termsBullet}>• Oposición</Text>

            <Text style={styles.termsSectionTitle}>18. LEY APLICABLE Y JURISDICCIÓN</Text>
            <Text style={styles.termsText}>
              Estos Términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a la jurisdicción de los jueces competentes del Perú.
            </Text>

            <Text style={styles.termsFooter}>
              Para ver el texto completo de los Términos y Condiciones, visite el portal institucional del Hospital José Agurto Tello.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.modalAcceptBtn}
            onPress={() => { setTermsAccepted(true); setShowTermsModal(false); }}
          >
            <Text style={styles.modalAcceptText}>Aceptar Términos y Condiciones</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Tipo Documento Picker Modal */}
      <Modal visible={showTipoDocPicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: HospitalColors.white, borderRadius: 20, padding: 24, width: '85%', maxWidth: 340 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, textAlign: 'center', marginBottom: 20 }}>
              Tipo de documento
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {tipoDocumentoOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.tipoDocumento}
                  onPress={() => { setTipoDocumento(opt); setShowTipoDocPicker(false); }}
                  style={{
                    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 8,
                    backgroundColor: tipoDocumento?.tipoDocumento === opt.tipoDocumento ? HospitalColors.primarySoft : HospitalColors.inputBg,
                    borderWidth: 1, borderColor: tipoDocumento?.tipoDocumento === opt.tipoDocumento ? HospitalColors.primary : HospitalColors.border,
                  }}
                >
                  <Text style={{
                    fontSize: 15,
                    fontWeight: tipoDocumento?.tipoDocumento === opt.tipoDocumento ? '700' : '400',
                    color: tipoDocumento?.tipoDocumento === opt.tipoDocumento ? HospitalColors.primary : HospitalColors.textPrimary,
                  }}>
                    {opt.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowTipoDocPicker(false)} style={{ marginTop: 16, height: 44, borderRadius: 12, borderWidth: 1, borderColor: HospitalColors.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: HospitalColors.textSecondary }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fecha Expedicion Picker Modal */}
      <Modal visible={showExpedicionPicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: HospitalColors.white, borderRadius: 20, padding: 24, width: '85%', maxWidth: 340 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, textAlign: 'center', marginBottom: 20 }}>
              Fecha de emisión
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {/* Year */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: HospitalColors.textLight, marginBottom: 6, textAlign: 'center' }}>Año</Text>
                <ScrollView style={{ height: 120, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 10, backgroundColor: HospitalColors.inputBg }}>
                  {expYears.map(y => (
                    <TouchableOpacity key={y} onPress={() => setExpPickerYear(y)} style={{ paddingVertical: 8, paddingHorizontal: 6, backgroundColor: y === expPickerYear ? HospitalColors.primarySoft : 'transparent', borderRadius: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: y === expPickerYear ? '700' : '400', color: y === expPickerYear ? HospitalColors.primary : HospitalColors.textPrimary }}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Month */}
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: HospitalColors.textLight, marginBottom: 6, textAlign: 'center' }}>Mes</Text>
                <ScrollView style={{ height: 120, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 10, backgroundColor: HospitalColors.inputBg }}>
                  {months.map(m => (
                    <TouchableOpacity key={m} onPress={() => setExpPickerMonth(m)} style={{ paddingVertical: 8, paddingHorizontal: 6, backgroundColor: m === expPickerMonth ? HospitalColors.primarySoft : 'transparent', borderRadius: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: m === expPickerMonth ? '700' : '400', color: m === expPickerMonth ? HospitalColors.primary : HospitalColors.textPrimary }}>{String(m).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Day */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: HospitalColors.textLight, marginBottom: 6, textAlign: 'center' }}>Día</Text>
                <ScrollView style={{ height: 120, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 10, backgroundColor: HospitalColors.inputBg }}>
                  {expDays.map(d => (
                    <TouchableOpacity key={d} onPress={() => setExpPickerDay(d)} style={{ paddingVertical: 8, paddingHorizontal: 6, backgroundColor: d === expPickerDay ? HospitalColors.primarySoft : 'transparent', borderRadius: 6 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: d === expPickerDay ? '700' : '400', color: d === expPickerDay ? HospitalColors.primary : HospitalColors.textPrimary }}>{String(d).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary, marginBottom: 16 }}>
              {expPickerYear}-{String(expPickerMonth).padStart(2, '0')}-{String(Math.min(expPickerDay, expDaysInMonth)).padStart(2, '0')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowExpedicionPicker(false)} style={{ flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: HospitalColors.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: HospitalColors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExpedicionConfirm} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: HospitalColors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: HospitalColors.white }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { flexGrow: 1, paddingTop: 56, paddingBottom: 40, paddingHorizontal: 24 },
  header: { marginBottom: 20 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: HospitalColors.textPrimary },
  stepLabel: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4, marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: HospitalColors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: HospitalColors.primary, borderRadius: 2 },
  infoChip: {
    backgroundColor: HospitalColors.primarySoft, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16,
  },
  infoChipText: { fontSize: 12, fontWeight: '600', color: HospitalColors.primaryDark },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 22,
    borderWidth: 1, borderColor: HospitalColors.border,
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
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: HospitalColors.primary,
    borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2,
  },
  checkboxChecked: { backgroundColor: HospitalColors.primary },
  checkmark: { color: HospitalColors.white, fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 13, color: HospitalColors.textSecondary, lineHeight: 20 },
  termsLink: { color: HospitalColors.primary, fontWeight: '600', textDecorationLine: 'underline' },
  registerButton: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  registerButtonText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 28 },
  loginText: { fontSize: 14, color: HospitalColors.textSecondary, marginBottom: 8 },
  loginBtnText: { color: HospitalColors.primary, fontSize: 15, fontWeight: '600' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: HospitalColors.white, paddingTop: Platform.OS === 'ios' ? 56 : 24 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: HospitalColors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary },
  modalClose: { fontSize: 15, color: HospitalColors.primary, fontWeight: '600' },
  modalBody: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  modalText: { fontSize: 14, color: HospitalColors.textSecondary, lineHeight: 22 },
  modalAcceptBtn: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', margin: 24,
  },
  modalAcceptText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  // Estilos para términos y condiciones
  termsTitle: { 
    fontSize: 16, fontWeight: '700', color: HospitalColors.textPrimary, 
    textAlign: 'center', marginBottom: 4 
  },
  termsSubtitle: { 
    fontSize: 14, fontWeight: '600', color: HospitalColors.primary, 
    textAlign: 'center', marginBottom: 20 
  },
  termsSectionTitle: { 
    fontSize: 15, fontWeight: '700', color: HospitalColors.textPrimary, 
    marginTop: 16, marginBottom: 8 
  },
  termsSubsection: { 
    fontSize: 14, fontWeight: '600', color: HospitalColors.textSecondary, 
    marginTop: 8, marginBottom: 6 
  },
  termsText: { 
    fontSize: 13, color: HospitalColors.textSecondary, lineHeight: 20, 
    marginBottom: 8, textAlign: 'justify' 
  },
  termsBullet: { 
    fontSize: 13, color: HospitalColors.textSecondary, lineHeight: 20, 
    marginBottom: 4, paddingLeft: 8 
  },
  termsFooter: { 
    fontSize: 12, color: HospitalColors.textLight, fontStyle: 'italic', 
    marginTop: 20, textAlign: 'center', lineHeight: 18 
  },
});
