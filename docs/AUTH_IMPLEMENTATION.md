# Implementación de Autenticación y Offline-First

## Resumen

Se ha implementado un sistema completo de autenticación con soporte offline-first para la aplicación HJATCH. La implementación incluye:

- ✅ Autenticación completa (login, registro, verificación de email, recuperación de contraseña)
- ✅ Interceptor de axios con refresh token automático
- ✅ Patrón offline-first con SQLite para sincronización de requests
- ✅ Términos y condiciones con tratamiento de datos personales
- ✅ Gestión de sesión persistente con AsyncStorage

---

## 🔐 Flujos de Autenticación

### 1. Login (Iniciar Sesión)

**Endpoint:** `POST /api/auth/login`

**Payload:**
```json
{
  "email": "string",      // DNI o correo electrónico
  "password": "string"
}
```

**Respuesta:**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

**Flujo:**
1. Usuario ingresa DNI/email y contraseña en `app/login.tsx`
2. Se llama a `authApi.login()` con las credenciales
3. Los tokens se guardan en AsyncStorage vía `SessionManager.saveTokens()`
4. Usuario es redirigido al dashboard

---

### 2. Registro (Crear Cuenta)

**Endpoint:** `POST /api/auth/register`

**Payload:**
```json
{
  "nombres": "string",
  "apellidos": "string",
  "email": "string",
  "celular": "string",
  "fechaNacimiento": "YYYY-MM-DD",
  "password": "string",
  "termsAccepted": true
}
```

**Respuesta:**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

**Flujo:**
1. **Paso 1** (`app/register-step1.tsx`): Usuario ingresa nombres, apellidos, email y contraseña
2. **Paso 2** (`app/register-step2.tsx`): Usuario ingresa celular, fecha de nacimiento y acepta términos
3. Se muestra modal con términos y condiciones (Ley N° 29733)
4. Se llama a `authApi.register()` con todos los datos
5. Los tokens se guardan en AsyncStorage
6. Usuario es redirigido a `app/verify-email.tsx` para verificar su correo

---

### 3. Verificación de Email

**Endpoint:** `POST /api/auth/verify-email`

**Payload:**
```json
{
  "email": "string",
  "code": "string"
}
```

**Respuesta:** `200 OK`

**Flujo:**
1. Después del registro, el backend envía un código al correo del usuario
2. Usuario ingresa el código en `app/verify-email.tsx`
3. Se llama a `authApi.verifyEmail()` con email y código
4. Si es exitoso, usuario puede iniciar sesión

---

### 4. Recuperación de Contraseña

#### 4.1 Solicitar Código

**Endpoint:** `POST /api/auth/forgot-password?email={email}`

**Flujo:**
1. Usuario ingresa su email en `app/recover-password.tsx`
2. Se llama a `authApi.forgotPassword(email)`
3. Backend envía código al correo del usuario
4. Usuario es redirigido a `app/reset-password.tsx`

#### 4.2 Restablecer Contraseña

**Endpoint:** `POST /api/auth/reset-password?email={email}&code={code}&newPassword={newPassword}`

**Flujo:**
1. Usuario ingresa email, código recibido y nueva contraseña en `app/reset-password.tsx`
2. Se llama a `authApi.resetPassword(email, code, newPassword)`
3. Si es exitoso, usuario puede iniciar sesión con la nueva contraseña

---

## 🔄 Refresh Token Automático

### Interceptor de Axios

El archivo `services/apiClient.ts` implementa un interceptor que:

1. **Request Interceptor:** Adjunta el `accessToken` a cada request en el header `Authorization: Bearer {token}`

2. **Response Interceptor:** 
   - Detecta respuestas `401 Unauthorized`
   - Llama automáticamente a `POST /api/auth/refresh-token` con el `refreshToken`
   - Obtiene nuevos tokens y los guarda
   - Reintenta el request original con el nuevo token
   - Si el refresh falla, limpia la sesión y redirige a login

**Ejemplo de uso:**
```typescript
import { apiClient } from '@/services/apiClient';

// El token se adjunta automáticamente
const response = await apiClient.get('/solicitudes');

// Si el token expira, se refresca automáticamente y se reintenta
```

---

## 📱 Patrón Offline-First

### Arquitectura

```
┌─────────────────┐
│  React Native   │
│   Components    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  offlineAxios   │◄────►│ NetworkMgr   │
│   (wrapper)     │      │ (NetInfo)    │
└────────┬────────┘      └──────────────┘
         │
         ├─── Online ───► apiClient (axios)
         │
         └─── Offline ──► SQLite sync_queue
                          (offlineDatabase)
```

### Componentes

#### 1. `services/offlineDatabase.ts`
Base de datos SQLite con tabla `sync_queue`:

```sql
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers TEXT NOT NULL DEFAULT '{}',
  body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  retries INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
);
```

**Funciones principales:**
- `enqueueRequest()`: Guarda un request pendiente
- `getPendingRequests()`: Obtiene requests pendientes
- `removeRequest()`: Elimina request sincronizado
- `incrementRetry()`: Incrementa contador de reintentos

#### 2. `services/networkManager.ts`
Monitorea conectividad y sincroniza automáticamente:

- Usa `@react-native-community/netinfo` para detectar cambios de red
- Cuando vuelve internet, procesa la cola de `sync_queue`
- Refresca tokens antes de reintentar requests

**Funciones principales:**
- `startNetworkMonitor()`: Inicia monitoreo (llamado en splash screen)
- `isOnline()`: Verifica estado de conectividad
- `syncPendingRequests()`: Procesa cola de sincronización
- `addNetworkListener()`: Registra listeners para cambios de red

#### 3. `services/offlineAxios.ts`
Wrapper que decide si ejecutar o encolar:

```typescript
import { offlineRequest } from '@/services/offlineAxios';

const result = await offlineRequest('POST', '/solicitudes', payload);

if (result.queued) {
  // Request guardado offline
  Alert.alert('Sin conexión', 'Tu solicitud se enviará cuando vuelva internet');
} else {
  // Request exitoso
  Alert.alert('Éxito', 'Solicitud enviada');
}
```

### Uso en la App

```typescript
// En lugar de usar apiClient directamente:
import { offlineRequest } from '@/services/offlineAxios';

async function submitAppointment(data) {
  const result = await offlineRequest('POST', '/solicitudes', data);
  
  if (result.queued) {
    // Mostrar UI de "guardado offline"
    showOfflineNotification();
  } else {
    // Mostrar UI de éxito
    showSuccessNotification();
  }
}
```

---

## 💾 Gestión de Sesión

### SessionManager (`utils/session.ts`)

Almacena tokens y datos de usuario en AsyncStorage:

```typescript
import { SessionManager } from '@/utils/session';

// Guardar tokens después de login/registro
await SessionManager.saveTokens({ accessToken, refreshToken });

// Guardar datos de usuario
await SessionManager.saveUserData({ email, nombres, apellidos, celular });

// Verificar si hay sesión activa
const isLoggedIn = await SessionManager.isLoggedIn();

// Obtener tokens (usado por interceptor)
const accessToken = await SessionManager.getAccessToken();
const refreshToken = await SessionManager.getRefreshToken();

// Cerrar sesión
await SessionManager.clearSession();
```

---

## 📂 Estructura de Archivos

### Servicios Creados
```
services/
├── apiClient.ts          # Axios con interceptor de refresh token
├── authApi.ts            # Endpoints de autenticación
├── offlineDatabase.ts    # SQLite para sync_queue
├── networkManager.ts     # Monitor de conectividad
└── offlineAxios.ts       # Wrapper offline-aware
```

### Pantallas de Autenticación
```
app/
├── index.tsx             # Splash (verifica sesión, inicia network monitor)
├── login.tsx             # Login con API real
├── register-step1.tsx    # Registro paso 1 (datos personales)
├── register-step2.tsx    # Registro paso 2 (contacto + términos)
├── verify-email.tsx      # Verificación de email con código
├── recover-password.tsx  # Solicitar código de recuperación
├── reset-password.tsx    # Restablecer contraseña con código
└── dashboard.tsx         # Dashboard (logout con clearSession)
```

### Utilidades
```
utils/
└── session.ts            # SessionManager para tokens y user data
```

---

## 🔧 Configuración

### Variables de Entorno (`.env`)
```bash
EXPO_PUBLIC_API_BASE_URL=https://citas.hospitalchosica.gob.pe/api/api/v1/app-citas
EXPO_PUBLIC_AUTH_API_BASE_URL=http://192.168.0.252:9012/api/auth
```

### Dependencias Instaladas
```json
{
  "axios": "^1.x.x",
  "expo-sqlite": "^14.x.x",
  "@react-native-community/netinfo": "^11.x.x"
}
```

---

## 📝 Términos y Condiciones

Se incluye un modal completo con términos y condiciones que cumple con:

- **Ley N° 29733** - Ley de Protección de Datos Personales (Perú)
- Tratamiento de datos personales
- Responsabilidad sobre el manejo de datos
- Obligaciones del usuario
- Finalidad del servicio

El usuario debe aceptar explícitamente antes de completar el registro.

---

## 🚀 Inicialización

El flujo de inicio de la app (`app/index.tsx`):

1. **Inicia network monitor** para offline-first
2. **Verifica sesión existente** con `SessionManager.isLoggedIn()`
3. **Redirige automáticamente:**
   - Si hay sesión → `/dashboard`
   - Si no hay sesión → `/login`

---

## ✅ Checklist de Implementación

- [x] Login con API real
- [x] Registro en 2 pasos con todos los campos requeridos
- [x] Verificación de email con código
- [x] Recuperación de contraseña (forgot + reset)
- [x] Interceptor de axios con refresh token automático en 401
- [x] Términos y condiciones con Ley N° 29733
- [x] SQLite sync_queue para requests offline
- [x] Network manager con auto-sync
- [x] Wrapper offlineAxios para requests offline-aware
- [x] SessionManager con AsyncStorage
- [x] Splash screen con verificación de sesión
- [x] Logout con limpieza de sesión
- [x] Eliminación de carpeta citas-legacy
- [x] TypeScript compila sin errores

---

## 🧪 Testing

### Probar Autenticación
1. Registrar nuevo usuario con email válido
2. Verificar que llega el código de verificación
3. Verificar email con el código
4. Iniciar sesión con las credenciales
5. Cerrar sesión y verificar que redirige a login
6. Probar recuperación de contraseña

### Probar Offline-First
1. Hacer un request con internet
2. Desactivar internet
3. Hacer otro request → debe guardarse en sync_queue
4. Reactivar internet → debe sincronizarse automáticamente
5. Verificar en SQLite que la cola se vacía

### Probar Refresh Token
1. Iniciar sesión
2. Esperar a que expire el accessToken (o forzar 401)
3. Hacer un request → debe refrescarse automáticamente
4. Verificar que el request se completa sin error

---

## 📞 Soporte

Para dudas o problemas con la implementación, revisar:
- Logs de axios en `services/apiClient.ts`
- Logs de sync en `services/networkManager.ts`
- Logs de SQLite en `services/offlineDatabase.ts`
