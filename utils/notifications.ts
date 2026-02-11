/**
 * Push Notification utility for appointment reminders.
 * Shows a local notification when an appointment is within 24 hours.
 *
 * Prerequisites:
 *   npx expo install expo-notifications expo-device expo-constants
 *
 * Usage example:
 *   import { scheduleAppointmentReminder, registerForPushNotifications } from '@/utils/notifications';
 *
 *   // 1. Register on app start (e.g., in _layout.tsx or dashboard):
 *   useEffect(() => { registerForPushNotifications(); }, []);
 *
 *   // 2. After confirming an appointment, schedule a reminder:
 *   scheduleAppointmentReminder({
 *     appointmentId: 'cita-1',
 *     specialtyName: 'Cardiología',
 *     doctorName: 'Dr. García López',
 *     dateTime: new Date('2026-02-18T09:00:00'),
 *   });
 *
 * The notification fires 24 hours before the appointment date.
 * On web, this degrades gracefully (logs to console).
 */

import { Platform } from 'react-native';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface AppointmentReminderInput {
  appointmentId: string;
  specialtyName: string;
  doctorName: string;
  dateTime: Date;
}

// ──────────────────────────────────────────────
// Registration
// ──────────────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform — skipping push registration.');
    return null;
  }

  try {
    const Notifications = require('expo-notifications');
    const Device = require('expo-device');

    if (!Device.isDevice) {
      console.warn('[Notifications] Push notifications require a physical device.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted.');
      return null;
    }

    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('appointment-reminders', {
        name: 'Recordatorio de Citas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0891B2',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('[Notifications] Push token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('[Notifications] Registration error:', error);
    return null;
  }
}

// ──────────────────────────────────────────────
// Schedule a local reminder 24h before appointment
// ──────────────────────────────────────────────
export async function scheduleAppointmentReminder(
  input: AppointmentReminderInput
): Promise<string | null> {
  const { appointmentId, specialtyName, doctorName, dateTime } = input;

  // Calculate trigger: 24 hours before the appointment
  const triggerDate = new Date(dateTime.getTime() - 24 * 60 * 60 * 1000);
  const now = new Date();

  if (triggerDate <= now) {
    console.log('[Notifications] Appointment is less than 24h away — sending immediately or skipping.');
    // If within 24h but not past, notify immediately
    if (dateTime > now) {
      return scheduleImmediate(input);
    }
    return null;
  }

  if (Platform.OS === 'web') {
    console.log(`[Notifications] (Web mock) Would schedule reminder for ${specialtyName} at ${triggerDate.toISOString()}`);
    return `web-mock-${appointmentId}`;
  }

  try {
    const Notifications = require('expo-notifications');

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Recordatorio de Cita',
        body: `Tu cita de ${specialtyName} con ${doctorName} es mañana a las ${dateTime.getHours()}:${String(dateTime.getMinutes()).padStart(2, '0')}hs. Recuerda llegar 30 min antes.`,
        data: { appointmentId, screen: 'consultar-solicitud' },
        sound: true,
      },
      trigger: {
        date: triggerDate,
        channelId: 'appointment-reminders',
      },
    });

    console.log(`[Notifications] Scheduled reminder ${id} for ${triggerDate.toISOString()}`);
    return id;
  } catch (error) {
    console.error('[Notifications] Scheduling error:', error);
    return null;
  }
}

// ──────────────────────────────────────────────
// Send an immediate notification (for appointments < 24h away)
// ──────────────────────────────────────────────
async function scheduleImmediate(input: AppointmentReminderInput): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log(`[Notifications] (Web mock) Immediate reminder for ${input.specialtyName}`);
    return `web-immediate-${input.appointmentId}`;
  }

  try {
    const Notifications = require('expo-notifications');

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Cita próxima',
        body: `Tu cita de ${input.specialtyName} con ${input.doctorName} es hoy/mañana. ¡No olvides asistir!`,
        data: { appointmentId: input.appointmentId },
        sound: true,
      },
      trigger: null, // fires immediately
    });

    return id;
  } catch (error) {
    console.error('[Notifications] Immediate notification error:', error);
    return null;
  }
}

// ──────────────────────────────────────────────
// Cancel a scheduled notification
// ──────────────────────────────────────────────
export async function cancelAppointmentReminder(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = require('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notifications] Cancelled reminder ${notificationId}`);
  } catch (error) {
    console.error('[Notifications] Cancel error:', error);
  }
}
