# Peluquería Reyna - Sistema de Gestión con LucIA

Sistema de gestión inteligente de citas para peluquería con asistente virtual **LucIA** que automatiza la atención al cliente vía WhatsApp.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff.svg)

## 🌟 Características Principales

- **🤖 Asistente Virtual LucIA**: Gestión automática de conversaciones por WhatsApp 24/7
- **📅 Gestión de Citas**: Sistema completo de reservas con confirmaciones y recordatorios
- **💬 Mensajes en Tiempo Real**: Visualización de conversaciones con clientes
- **⚙️ Panel de Configuración**: Administración de servicios, horarios y datos del salón
- **📊 Estadísticas**: Dashboard con métricas de citas y estado en tiempo real
- **🎨 Diseño Premium**: Interfaz elegante con tema oscuro y efectos dorados
- **📱 Responsive**: Optimizado para desktop, tablet y móvil

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3.1** - Biblioteca de UI
- **TypeScript 5.8.3** - Tipado estático
- **Vite 5.4.19** - Build tool y dev server
- **Tailwind CSS 3.4.17** - Framework de estilos
- **shadcn/ui** - Componentes UI (Radix UI)
- **Framer Motion 12.23.26** - Animaciones
- **React Router DOM 6.30.1** - Enrutamiento

### Backend & Base de Datos
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Realtime - Actualizaciones en tiempo real
  - Row Level Security (RLS)

### Gestión de Estado
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Gestión de formularios
- **Zod 3.25.76** - Validación de esquemas

### Utilidades
- **date-fns 3.6.0** - Manipulación de fechas
- **lucide-react 0.462.0** - Iconos
- **sonner 1.7.4** - Notificaciones toast

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **bun** >= 1.0.0
- Cuenta de **Supabase** (para backend)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd reyna-appointments-1
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_PROJECT_ID=tu_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
VITE_SUPABASE_URL=https://tu_project_id.supabase.co
```

### 4. Configurar Supabase

Ejecuta las migraciones de base de datos ubicadas en `supabase/migrations/`:

```bash
# Usando Supabase CLI
supabase db push
```

O ejecuta manualmente el archivo SQL en tu proyecto de Supabase.

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

## 📁 Estructura del Proyecto

```
reyna-appointments-1/
├── src/
│   ├── components/          # Componentes React
│   │   ├── dashboard/       # Componentes del dashboard
│   │   │   ├── MessagesTab.tsx
│   │   │   ├── AppointmentsTab.tsx
│   │   │   └── SettingsTab.tsx
│   │   └── ui/              # Componentes shadcn/ui (49 componentes)
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useMessages.ts
│   │   ├── useAppointments.ts
│   │   └── useSalonSettings.ts
│   ├── integrations/        # Integraciones externas
│   │   └── supabase/        # Cliente Supabase
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Landing.tsx      # Página de inicio
│   │   ├── Login.tsx        # Inicio de sesión
│   │   ├── Register.tsx     # Registro
│   │   ├── Dashboard.tsx    # Panel principal
│   │   └── NotFound.tsx     # 404
│   ├── lib/                 # Utilidades
│   ├── App.tsx              # Componente raíz
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── supabase/
│   └── migrations/          # Migraciones de base de datos
├── public/                  # Archivos estáticos
├── .env                     # Variables de entorno
├── package.json
├── tailwind.config.ts       # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
└── vite.config.ts           # Configuración de Vite
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `messages`
Almacena las conversaciones de WhatsApp
- `id` (UUID)
- `phone_number` (TEXT)
- `message_content` (TEXT)
- `sender` (TEXT) - 'client' o 'assistant'
- `received_at` (TIMESTAMP)
- `read` (BOOLEAN)

#### `appointments`
Gestión de citas
- `id` (UUID)
- `phone_number` (TEXT)
- `client_name` (TEXT)
- `appointment_date` (TIMESTAMP)
- `service_type` (TEXT)
- `status` (TEXT) - 'pending', 'confirmed', 'cancelled'
- `reminder_sent` (BOOLEAN)
- `notes` (TEXT)

#### `salon_settings`
Configuración del salón (singleton)
- `salon_name`, `salon_address`, `salon_phone`, `salon_email`
- `working_hours` (JSONB)
- `services` (TEXT[])
- `whatsapp_webhook_url` (TEXT)
- `timezone`, `google_maps_url`

#### `profiles`
Perfiles de usuarios autenticados
- `id` (UUID) - FK a auth.users
- `email`, `full_name`
- `role` (TEXT) - 'admin' o 'staff'

## 🎨 Servicios de la Peluquería

1. **Corte/Peinado** - 45 min
2. **Tratamiento de Cauterización** - Desde 60€ - 3h
3. **Tratamiento Células Madre** - Desde 35€ - 1h 30min
4. **Tintes/Baños de Color** - Precio estándar - 2h
5. **Keratina (Alisado)** - Desde 150€ - 4h 30min
6. **Botox Capilar** - Desde 80€ - 4h 30min
7. **Reconstrucción (Radiante Glock)** - Desde 50€ - 4h

## 📍 Información del Salón

**Dirección:** C. Alcalde Suárez Llanos, 19, 03012 Alicante

**Horarios:**
- Martes a Sábado: 10:00-14:00, 16:00-20:00
- Pausa almuerzo: 14:00-16:00
- Cerrado: Domingo y Lunes

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Build para producción
npm run build:dev    # Build en modo desarrollo

# Calidad de código
npm run lint         # Ejecuta ESLint

# Preview
npm run preview      # Preview del build de producción
```

## 🎯 Funcionalidades del Dashboard

### 📨 Pestaña de Mensajes
- Lista de conversaciones de WhatsApp
- Vista de chat con burbujas de mensajes
- Búsqueda de conversaciones
- Indicadores de mensajes leídos/no leídos
- Actualización en tiempo real

### 📅 Pestaña de Citas
- Tabla completa de citas
- Estadísticas (hoy, pendientes, confirmadas, canceladas)
- Filtros por estado y servicio
- Búsqueda por nombre/teléfono
- Acciones: confirmar/cancelar citas
- Indicador de recordatorios enviados

### ⚙️ Pestaña de Configuración
- Información del salón
- Gestión de horarios
- Administración de servicios
- Configuración de webhook de WhatsApp

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Autenticación mediante Supabase Auth
- ✅ Políticas de acceso basadas en roles
- ✅ Variables de entorno para credenciales
- ✅ Validación de formularios con Zod

## 🌐 Despliegue

### Opción 1: Lovable (Recomendado)
1. Visita [Lovable](https://lovable.dev)
2. Conecta tu repositorio
3. Click en Share → Publish

### Opción 2: Vercel
```bash
npm run build
vercel --prod
```

### Opción 3: Netlify
```bash
npm run build
netlify deploy --prod
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Peluquería Reyna.

## 📞 Contacto

**Peluquería Reyna**
- Ubicación: C. Alcalde Suárez Llanos, 19, 03012 Alicante
- Web: [Google Maps](https://www.google.es/maps/place/Sal%C3%B3n+de+Belleza+Reina/@38.3549848,-2.9195577,8z)

---

**Powered by LucIA** - Tu asistente virtual 24/7 ✨
