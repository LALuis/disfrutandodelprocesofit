# Disfrutando del proceso fit

Sitio web público y plataforma de gestión del gimnasio **Disfrutando del proceso fit**.

| Área | Ruta | Quién accede |
| --- | --- | --- |
| Sitio público | `/`, `/planes`, `/contacto`, `/login` | Cualquier visitante |
| Portal del alumno | `/app` | Usuarios con rol `STUDENT` |
| Portal de administración | `/admin` | Usuarios con rol `ADMIN` |

> **Estado: los 10 milestones están implementados.** Sitio público, autenticación con roles, gestión de alumnos, agenda con cupos transaccionales, mediciones y progreso con gráficos, planes de entrenamiento y nutrición, recetario con imágenes, planes de membresía, configuración del gimnasio, reglas de seguridad y tests (unitarios + emuladores).

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura](#arquitectura)
3. [DESARROLLO LOCAL](#desarrollo-local)
   - [Prerrequisitos](#prerrequisitos) · [Instalación](#instalación) · [Arranque](#arranque) · [Seed](#datos-de-prueba-seed) · [Usuarios demo](#usuarios-demo) · [Comandos](#comandos) · [Tests](#tests)
4. [Funcionalidades](#funcionalidades)
5. [Configuración de entornos](#configuración-de-entornos)
6. [Identidad de marca](#identidad-de-marca)
7. [Modelo de seguridad](#modelo-de-seguridad)
8. [Cloud Functions](#cloud-functions)
9. [Modelo de datos (Firestore)](#modelo-de-datos-firestore)
10. [Estructura del proyecto](#estructura-del-proyecto)
11. [DESPLIEGUE A PRODUCCIÓN](#despliegue-a-producción)

---

## Stack tecnológico

**Frontend**

- Angular 22 (standalone components, zoneless, signals + `rxResource`, Router con lazy loading, Reactive Forms)
- TypeScript estricto, SCSS con design tokens (CSS custom properties), diseño mobile-first
- Íconos [`lucide`](https://lucide.dev) con un registro curado (`shared/components/icon/app-icons.ts`)
- Firebase JS SDK v12 (modular) integrado vía tokens de inyección propios — sin AngularFire (no soporta Angular 22 todavía)
- Gráficos: componente SVG propio (`shared/components/line-chart`), sin dependencias
- Vitest (unitarios y emulador), ESLint (angular-eslint), Prettier

**Backend (Firebase / Google Cloud)**

- Firebase Authentication (email + contraseña, roles en custom claims)
- Cloud Firestore, Firebase Storage
- Cloud Functions for Firebase (2.ª gen, TypeScript, Node 22)
- Firestore / Storage Security Rules
- Firebase Emulator Suite para desarrollo 100 % local

---

## Arquitectura

```
Angular (browser)
  ├─ Firebase Auth SDK ──────────► Auth (custom claim `role`)
  ├─ Firestore SDK (onSnapshot) ─► Firestore (Security Rules: propiedad, rol, feature flags)
  ├─ Storage SDK ────────────────► Storage (Security Rules)
  └─ Functions SDK (callables) ──► Cloud Functions ──► Admin SDK
                                   createStudent · setUserActive · setUserRole
                                   createBooking · cancelBooking (transacciones)
```

Principios:

- **Local-first**: todo corre contra emuladores; el proyecto `demo-disfrutando-fit` nunca toca un proyecto real.
- **Seguridad en capas**: guards de Angular (UX) + Security Rules + validación server-side en Cloud Functions. El frontend nunca es la fuente de verdad de roles, permisos ni cupos.
- **Feature-based**: `features/public`, `features/student`, `features/admin`; `core` (Firebase, auth, guards, servicios de datos) y `shared` (UI reutilizable, modelos, utilidades).
- **Signals para estado de UI, RxJS para streams**: los servicios exponen `Observable`s realtime de Firestore; los componentes los consumen con `rxResource` (loading / error / vacío) o `toSignal`.

---

## DESARROLLO LOCAL

### Prerrequisitos

| Herramienta | Versión | Notas |
| --- | --- | --- |
| Node.js | **≥ 22.22.3** o **≥ 24.15.0** | Requisito de Angular 22 |
| npm | ≥ 10 | |
| Java (JDK) | **≥ 21** | Lo necesitan los emuladores de Firestore y Storage. Verificá con `java -version` en una terminal nueva. |

`firebase-tools` viene como dependencia de desarrollo: no hace falta instalarlo globalmente.

### Instalación

```bash
npm install
```

El `postinstall` instala también las dependencias de `functions/`.

### Arranque

Todo junto (compila functions, levanta emuladores y `ng serve`):

```bash
npm run dev
```

O en dos terminales:

```bash
npm run firebase:emulators
```

```bash
npm start
```

| Servicio | URL |
| --- | --- |
| Aplicación Angular | http://localhost:4200 |
| Emulator UI | http://127.0.0.1:4000 |
| Auth / Firestore / Functions / Storage | 127.0.0.1:9099 / 8080 / 5001 / 9199 |

Los emuladores arrancan vacíos. Para persistir datos entre reinicios usá `npm run firebase:emulators:persist` (exporta a `.emulator-data/`, ignorado por git).

### Datos de prueba (seed)

Con los emuladores corriendo, en otra terminal:

```bash
npm run seed
```

Crea usuarios con su claim `role`, perfiles, configuración pública, planes de membresía, mediciones (6 meses para `student1`), un plan de entrenamiento activo y uno anterior, un plan de nutrición, 5 recetas (una archivada) y 2 semanas de horarios (lunes a viernes; el turno de las 07:00 del día siguiente tiene **cupo 1** para probar la carrera por el último lugar) con una reserva de ejemplo. Es idempotente.

El script **solo** apunta a emuladores: se niega a correr si el proyecto no empieza con `demo-` o si Auth/Firestore no responden.

### Usuarios demo

> ⚠️ **Credenciales exclusivamente locales**, válidas solo contra el emulador de Auth.

| Email | Rol | Nutrición | Recetario |
| --- | --- | --- | --- |
| `admin@gym.local` | ADMIN | – | – |
| `student1@gym.local` | STUDENT | ✔ | ✔ |
| `student2@gym.local` | STUDENT | ✖ | ✖ |

Contraseña de todos: `demo1234` (configurable con `SEED_PASSWORD`).

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Compila functions y levanta emuladores + `ng serve` |
| `npm start` | Solo el dev server de Angular |
| `npm run firebase:emulators` | Emuladores de Auth, Firestore, Functions y Storage (+ UI) |
| `npm run firebase:emulators:persist` | Igual, importando/exportando `.emulator-data/` |
| `npm run seed` | Carga datos demo en los emuladores |
| `npm run build` | Build de producción de Angular (`dist/disfrutandodelprocesofit/browser`) |
| `npm run functions:build` / `functions:watch` | Compila las Cloud Functions |
| `npm run lint` | ESLint en Angular, scripts, tests y functions |
| `npm test` | Tests unitarios de Angular (Vitest) |
| `npm run test:functions` | Tests unitarios de Cloud Functions |
| `npm run test:all` | Ambos |
| `npm run test:emulator` | Tests de reglas y de Cloud Functions contra los emuladores (los levanta y baja solo) |

### Tests

**Unitarios (Angular, 70)** — `core/auth` (roles, mapeo de errores, `AuthService`), guards (`auth`, `role`, `guest`, `feature`, saneo de `redirectTo`), login (validación, redirect por rol, errores), mappers de documentos (defaults seguros), modelos (comparación de mediciones, cupos), utilidades de fechas y enlaces, filtros de alumnos/recetas, series de gráficos, `PlanCard` y `PlansList` en sus 4 estados.

**Unitarios (functions, 24)** — `requireAuth`/`requireRole`, validación de payloads y reglas puras de reserva (`booking-rules`).

**Emulador (32)** — `npm run test:emulator`:

- *Firestore rules*: anónimo solo lee planes activos y settings públicos; un alumno no lee el perfil, mediciones, planes ni reservas de otro; no puede auto-promoverse ni activar features; el admin edita perfiles pero no rol/email/estado; mediciones append-only; nutrición requiere el flag; recetas requieren flag y `active`; slots: el admin nunca escribe `bookedCount`, no borra slots con reservas; reservas solo las escriben las functions.
- *Storage rules*: imágenes de recetas públicas y solo admin sube imágenes; archivos privados solo dueño/admin; el resto denegado.
- *Cloud Functions*: reserva + espejo + contador; duplicado, deshabilitado, pasado y desconocido rechazados; **dos alumnos concurrentes por el último lugar → exactamente uno gana** (`resource-exhausted` para el otro); cancelación libera el cupo; admin/inactivo/anónimo rechazados; `createStudent` (claims, perfil, link de contraseña, email duplicado), `setUserActive`/`setUserRole` con protecciones de auto-bloqueo.

---

## Funcionalidades

**Sitio público**: home (hero, beneficios, metodología, gimnasio, planes desde Firestore, testimonios placeholder, contacto, ubicación placeholder), planes, contacto, redes, configuración del gym en tiempo real.

**Portal del alumno** (`/app`, mobile-first con tabs inferiores + menú "Más"):
- *Inicio*: próxima reserva, plan activo, peso actual y cambio, mediciones, estado de nutrición, próximas sesiones.
- *Agenda*: 14 días, turnos con cupo en vivo, reservar / cancelar (Cloud Functions), historial.
- *Progreso*: actual / anterior / cambio y gráfico de evolución para peso, grasa corporal y masa muscular.
- *Ficha*: datos personales, última medición e historial completo.
- *Entrenamiento*: plan activo (días y ejercicios) y planes anteriores.
- *Nutrición* y *Recetario* (solo con la feature habilitada; también bloqueadas por guard y por rules): plan de comidas; recetas con búsqueda, filtro por categoría y detalle.
- *Cuenta*: teléfono (único dato auto-editable), cambio de contraseña con re-autenticación, cerrar sesión.

**Portal admin** (`/admin`, sidebar en desktop, drawer en móvil):
- *Dashboard*: alumnos activos, reservas de hoy y próximos 7 días, turnos con lugar / completos, alumnos con nutrición / recetario.
- *Alumnos*: búsqueda y filtro, alta vía Cloud Function (con enlace único para definir contraseña), ficha con pestañas Perfil (edición + features), Mediciones (alta append-only, historial, borrado), Entrenamiento y Nutrición (editor de planes anidados, activar/desactivar, historial), Reservas; habilitar/deshabilitar cuenta y dar/quitar rol admin (Cloud Functions).
- *Horarios*: generador en bloque (rango, días de semana, horas, cupo), gestión por día (cupo, habilitar, borrar si no tiene reservas), alta de turno suelto.
- *Reservas*: por día, con los alumnos anotados en cada turno y el cupo restante.
- *Entrenamiento / Nutrición*: panorama de qué alumnos tienen plan activo.
- *Recetario*: CRUD, imagen a Storage, publicar/archivar.
- *Planes*: CRUD de planes de membresía (orden, destacado, activo).
- *Configuración*: datos públicos del gimnasio.

---

## Configuración de entornos

`src/environments/`:

| Archivo | Uso |
| --- | --- |
| `environment.model.ts` | Interfaz `AppEnvironment` |
| `environment.ts` | **Local**: `useEmulators: true`, proyecto `demo-disfrutando-fit`, puertos de los emuladores |
| `environment.prod.ts` | **Producción**: `useEmulators: false`, valores `REPLACE_ME` a completar con tu config web de Firebase |

`ng build` reemplaza `environment.ts` por `environment.prod.ts`. El cambio emuladores ↔ producción es un único flag (`useEmulators`) aplicado en `src/app/core/firebase/firebase.providers.ts`. La config web de Firebase no es secreta (viaja al navegador) pero no se commitea con valores reales.

---

## Identidad de marca

El logo original vive en `brand/logo-original.png` (ilustración raster de 1254×1254 con
transparencia). Todo lo que se publica se deriva de ahí:

| Archivo | Qué es | Dónde se usa |
| --- | --- | --- |
| `public/logo.png` | Logo completo, 760 px (2× su tamaño máximo en pantalla) | Hero de la home, solo ≥ 1024 px |
| `public/isotipo.png` | Recorte de cabeza + vincha, 256 px | Header público, header de los portales, login, footer |
| `public/favicon.ico` | 16 + 32 + 48 px | Pestaña del navegador |
| `public/icon-192.png` · `icon-512.png` | Icono transparente | Android / Chrome |
| `public/apple-touch-icon.png` | 180 px sobre el fondo de marca | iOS (ignora la transparencia) |

Decisiones:

- **El isotipo es un recorte, no el logo completo.** Debajo de ~64 px la ilustración entera se
  convierte en una mancha rosa; el recorte de cabeza mantiene una silueta reconocible incluso a
  32 px. Además el texto arranca en y≈730, así que cualquier recorte más alto arrastra
  fragmentos de letras al icono.
- **PNG con paleta**: reduce los archivos ~4× sin bandeado visible en esta ilustración.
- El componente `<app-brand-logo>` centraliza las dos variantes, tamaños y accesibilidad
  (decorativo por defecto; `alt` cuando el logo va solo).

### Merch

El logo es una **ilustración de mapa de bits**, no un vector: tiene degradados, sombreado y pelo
al detalle. De un PNG no se puede obtener un vector fiel automáticamente. En `brand/` quedan dos
SVG con usos distintos:

| Archivo | Qué contiene | Para qué sirve | Límite |
| --- | --- | --- | --- |
| `brand/logo-merch.svg` | El PNG original embebido | Maquetar y escalar el logo en Illustrator, Inkscape, Canva o el software del proveedor | Adentro sigue siendo raster: ampliado más allá de su resolución pixela |
| `brand/logo-trace.svg` | Trazado automático (paths reales, 24 colores) | Corte de vinilo, versiones de un color, cuando el proveedor exige vectores | Posteriza los degradados y ensucia "DEL" y "FIT": es una aproximación |

En números: el original son 1254 px, o sea **10,6 cm a 300 dpi**. Alcanza para estampa de pecho,
tazas, stickers o etiquetas. Para una espalda completa, una lona o un cartel conviene:

1. Pedirle al diseñador el archivo vectorial original (`.ai`, `.eps` o `.svg`), o
2. Encargar un redibujo vectorial del logo (es trabajo de diseño, no de conversión).

Para regenerar todo después de cambiar el original:

```bash
npm i -D sharp imagetracerjs
```

```bash
node scripts/brand/build-brand-assets.mjs && npm uninstall sharp imagetracerjs
```

Las herramientas se instalan solo para ese paso: los PNG/ICO quedan versionados, así que no son
dependencias permanentes del proyecto. Los dos SVG de `brand/` no se versionan por tamaño
(1-2 MB cada uno); se regeneran con el mismo comando.

El logo anterior queda archivado en `brand/legacy/`.

---

## Modelo de seguridad

**Autenticación**

- Email + contraseña. Sin auto-registro público.
- **Onboarding**: el admin crea la cuenta desde *Alumnos → Nuevo alumno*. La Cloud Function `createStudent` crea el usuario con una contraseña aleatoria que nunca se muestra, asigna el claim `role: STUDENT`, escribe el perfil y devuelve un **enlace de un solo uso para definir la contraseña** (`generatePasswordResetLink`) que el admin comparte con el alumno. Alternativa: "¿Olvidaste tu contraseña?" en `/login`, que envía el email de restablecimiento de Firebase (en el emulador, el enlace aparece en su log).
- El alumno puede cambiar su contraseña desde *Mi cuenta* (con re-autenticación).

**Autorización (capas)**

1. **Angular** (UX): `authGuard`, `roleGuard('ADMIN' | 'STUDENT')`, `guestGuard`, `featureGuard('nutritionEnabled' | 'recipesEnabled')`, navegación condicional por rol y features.
2. **Security Rules** (`firestore.rules`, `storage.rules`): deny-by-default; rol desde `request.auth.token.role`; features leídas del perfil del llamante (`get(users/{uid})`); rol, email y `active` nunca se modifican desde el cliente; `bookedCount` y las reservas solo las escriben las functions; mediciones append-only.
3. **Cloud Functions**: cada callable valida autenticación, rol e input (`functions/src/shared/`) y devuelve `HttpsError` con mensajes en español.

**Roles**: `ADMIN` → `/admin`; `STUDENT` → `/app`; sin claim → `/unauthorized`. Un admin no puede deshabilitarse ni cambiar su propio rol (siempre queda al menos uno).

---

## Cloud Functions

| Función | Quién | Qué hace |
| --- | --- | --- |
| `createStudent` | ADMIN | Crea usuario Auth (contraseña aleatoria), claim `STUDENT`, perfil en `users/{uid}`; devuelve `uid` y `passwordSetupLink`. Rechaza email duplicado. |
| `setUserActive` | ADMIN | Habilita/deshabilita en Auth (revoca refresh tokens) y en el perfil. No permite auto-deshabilitarse. |
| `setUserRole` | ADMIN | Cambia el claim y la copia en el perfil. No permite cambiar el propio rol. |
| `createBooking` | STUDENT | Transacción: valida perfil activo, slot existente/habilitado/futuro, no duplicado, cupo; escribe la reserva bajo el slot, el espejo en `users/{uid}/bookings` y `bookedCount + 1`. |
| `cancelBooking` | STUDENT | Transacción: exige reserva confirmada y slot futuro; marca cancelada y `bookedCount - 1`. |
| `ping` | autenticado | Health check del cableado (devuelve uid y rol). |

**Concurrencia de cupos**: `createBooking` lee el slot y la reserva dentro de `runTransaction`. Si dos alumnos compiten por el último lugar, ambos leen `bookedCount = capacity - 1`; el primero en confirmar gana; el segundo falla el commit por contención, Firestore reintenta la transacción, relee `bookedCount = capacity` y la función responde `resource-exhausted`. El contador nunca se escribe desde el cliente (las rules lo impiden). Cubierto por `tests/emulator/functions.spec.ts`.

---

## Modelo de datos (Firestore)

```
users/{userId}                         perfil, role (copia informativa del claim), active, features,
                                       activeTrainingPlanId, activeNutritionPlanId
users/{userId}/measurements/{id}       histórico append-only (date, weight, height, bodyFatPercentage, …)
users/{userId}/trainingPlans/{id}      plan con days[] → exercises[] embebidos; uno activo
users/{userId}/nutritionPlans/{id}     plan con meals[] → foods[] embebidos; uno activo
users/{userId}/bookings/{slotId}       espejo de las reservas del alumno (lo escriben las functions)
scheduleSlots/{slotId}                 id = `AAAA-MM-DD_HHmm`; date, startTime, startsAt, capacity,
                                       bookedCount, enabled
scheduleSlots/{slotId}/bookings/{uid}  reserva (id = uid → un alumno no puede duplicar por diseño)
recipes/{recipeId}                     receta; imagen en Storage `recipes/{uuid}.{ext}`
membershipPlans/{planId}               planes públicos
gymSettings/public                     configuración pública
```

Razonamiento:

- Los datos privados cuelgan de `users/{uid}`: una sola regla de propiedad protege todo el subárbol y las consultas del alumno no necesitan filtros por usuario.
- Planes autocontenidos (días/comidas embebidos): se leen completos, son chicos y evitan N lecturas. El perfil guarda un puntero al plan activo para dashboards sin consultas extra. La misma forma sirve para plantillas reutilizables en una colección top-level a futuro.
- Reservas bajo el slot con el `uid` como id: duplicado y contador se resuelven en una transacción sobre el mismo padre; el espejo bajo el usuario evita consultas *collection group* (y sus reglas más laxas).
- Ids de slot deterministas: generar dos veces el mismo horario no duplica turnos.
- `bookedCount` desnormalizado en el slot: la agenda muestra cupos con una sola lectura por turno.
- Índices compuestos en `firestore.indexes.json` (alumnos por rol+apellido, slots por fecha+inicio, reservas por estado+nombre, recetas por activo+título).

---

## Estructura del proyecto

```
.
├── firebase.json / .firebaserc / firestore.rules / storage.rules / firestore.indexes.json
├── functions/src/
│   ├── index.ts                 Registro de funciones + región
│   ├── shared/                  auth.ts, validation.ts, errors.ts, firebase-admin.ts
│   ├── auth/                    create-student, set-user-active, set-user-role
│   ├── booking/                 booking-rules (puras + tests), create-booking, cancel-booking
│   └── system/ping.ts
├── brand/                       Logo original + derivados para merch (no se publican)
├── scripts/
│   ├── brand/                   Deriva isotipo, logo y iconos desde el original
│   ├── seed/                    Seed de datos demo (solo emuladores)
│   └── bootstrap-admin.ts       Otorga ADMIN al primer usuario de un proyecto real (lo corrés vos)
├── tests/emulator/              Rules de Firestore y Storage + Cloud Functions contra emuladores
└── src/
    ├── environments/            Config local / producción
    ├── styles/                  tokens, reset, tipografía, breakpoints, utilidades, forms, tables, sections
    └── app/
        ├── core/
        │   ├── firebase/        tokens de inyección, provideFirebase(), wrappers RxJS, mapeo de errores
        │   ├── auth/            AuthService, CurrentUserService (perfil + features), modelos, errores
        │   ├── guards/          auth, role, guest, feature
        │   └── services/        users, measurements, training/nutrition plans (UserPlansStore),
        │                        schedule, bookings, recipes, membership plans, gym settings, stats
        ├── shared/
        │   ├── components/      BrandLogo, Button, Card, PageHeader, FormField, Icon, Spinner, Badge,
        │   │                    StatCard,
        │   │                    UserAvatar, ConfirmDialog, Toasts, LineChart, DateNav, BookingList,
        │   │                    MeasurementHistory, TrainingPlanView, NutritionPlanView, SocialLinks,
        │   │                    LoadingState, EmptyState, ErrorState, PortalShell
        │   ├── models/          UserProfile, Measurement, TrainingPlan, NutritionPlan, Recipe, Schedule…
        │   ├── pipes/ utilities/ services/   PricePipe · fechas, enlaces, validadores · confirm, toast
        │   └── config/          Branding estático de respaldo
        └── features/
            ├── public/          layout, home, plans, contact
            ├── auth/            login (+ recuperar contraseña), unauthorized
            ├── student/         dashboard, booking, progress, profile, training, nutrition, recipes, account
            ├── admin/           dashboard, students (+ tabs), schedule, bookings, training, nutrition,
            │                    recipes, plans, settings
            └── not-found/
```

Convenciones: archivos sin sufijo `.component` (guía de estilo Angular 20+), textos de UI en español rioplatense, código y comentarios en inglés.

---

## DESPLIEGUE A PRODUCCIÓN

> Solo documentación. Nada del repositorio despliega ni se conecta a un proyecto real.

1. **Crear el proyecto Firebase** en https://console.firebase.google.com (plan Blaze: Cloud Functions 2.ª gen lo requiere).
2. **Habilitar Authentication** → *Email/Password*. Opcional: personalizar la plantilla del email de restablecimiento de contraseña (es el flujo de onboarding).
3. **Habilitar Firestore** en modo producción (región sugerida: `southamerica-east1`).
4. **Habilitar Storage**.
5. **Cloud Functions**: región `us-central1` por defecto (`functions/src/index.ts` y `functionsRegion` en los environments). Si la cambiás, hacelo en ambos lugares.
6. **Completar `src/environments/environment.prod.ts`** con la configuración web (Consola → Configuración del proyecto → Tus apps).
7. **Seleccionar el proyecto** en la CLI (una vez):
   ```bash
   npx firebase login
   npx firebase use --add
   ```
   Asignale el alias `prod` y usá siempre `--project prod` (el alias `default` sigue siendo el proyecto demo de emuladores).
8. **Índices de Firestore** (se despliegan junto con las reglas desde `firestore.indexes.json`).
9. **Reglas de Firestore**:
   ```bash
   npx firebase deploy --only firestore --project prod
   ```
10. **Reglas de Storage**:
    ```bash
    npx firebase deploy --only storage --project prod
    ```
11. **Cloud Functions**:
    ```bash
    npx firebase deploy --only functions --project prod
    ```
12. **Build de Angular**:
    ```bash
    npm run build
    ```
13. **Hosting**: ya configurado en `firebase.json` (SPA rewrite, cache inmutable de assets).
14. **Desplegar Hosting**:
    ```bash
    npx firebase deploy --only hosting --project prod
    ```
15. **Primer administrador**: creá el usuario (email + contraseña) en Authentication desde la consola y otorgale el rol con tus credenciales:
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json FIREBASE_PROJECT_ID=tu-proyecto npx tsx scripts/bootstrap-admin.ts admin@tu-gym.com --yes
    ```
    Desde ese momento, todos los demás usuarios se crean desde el panel admin.
