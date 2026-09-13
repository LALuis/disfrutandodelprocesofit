# Disfrutando del proceso fit

Sitio web público y plataforma de gestión del gimnasio **Disfrutando del proceso fit**.

La aplicación tiene tres áreas:

| Área | Ruta | Quién accede |
| --- | --- | --- |
| Sitio público | `/`, `/planes`, `/contacto`, `/login` | Cualquier visitante |
| Portal del alumno | `/app` | Usuarios con rol `STUDENT` |
| Portal de administración | `/admin` | Usuarios con rol `ADMIN` |

> **Estado actual: Milestone 1 (fundación).** Angular + Firebase configurados, emuladores, sistema de diseño, layout público con hero, autenticación con roles, layouts de ambos portales y guards. Las secciones funcionales (agenda, progreso, entrenamiento, nutrición, recetas, gestión de alumnos, etc.) llegan en los siguientes milestones.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura](#arquitectura)
3. [DESARROLLO LOCAL](#desarrollo-local)
   - [Prerrequisitos](#prerrequisitos)
   - [Instalación](#instalación)
   - [Arranque](#arranque)
   - [Datos de prueba (seed)](#datos-de-prueba-seed)
   - [Usuarios demo](#usuarios-demo)
   - [Comandos](#comandos)
   - [Tests](#tests)
4. [Configuración de entornos](#configuración-de-entornos)
5. [Modelo de seguridad](#modelo-de-seguridad)
6. [Modelo de datos (Firestore)](#modelo-de-datos-firestore)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [DESPLIEGUE A PRODUCCIÓN](#despliegue-a-producción)

---

## Stack tecnológico

**Frontend**

- Angular 22 (standalone components, zoneless, signals, Router con lazy loading, Reactive Forms)
- TypeScript estricto
- SCSS con design tokens (CSS custom properties)
- Íconos: [`lucide`](https://lucide.dev) (registro curado en `shared/components/icon/app-icons.ts` para mantener el bundle chico)
- Firebase JS SDK v12 (modular) integrado vía tokens de inyección propios — sin AngularFire (todavía no soporta Angular 22)
- Vitest para tests unitarios, ESLint (angular-eslint), Prettier

**Backend (Firebase / Google Cloud)**

- Firebase Authentication (email + contraseña, roles en custom claims)
- Cloud Firestore
- Firebase Storage
- Cloud Functions for Firebase (2.ª gen, TypeScript, Node 22)
- Firestore / Storage Security Rules
- Firebase Emulator Suite para desarrollo 100 % local

---

## Arquitectura

```
Angular (browser)
  ├─ Firebase Auth SDK ──────────► Auth (emulador / producción)
  ├─ Firestore SDK ──────────────► Firestore (reglas de seguridad)
  ├─ Storage SDK ────────────────► Storage (reglas de seguridad)
  └─ Functions SDK (callables) ──► Cloud Functions ──► Admin SDK
                                   (valida auth + rol + input en cada llamada)
```

Principios:

- **Local-first**: todo corre contra los emuladores; el id de proyecto `demo-disfrutando-fit` garantiza que nunca se toque un proyecto real.
- **Seguridad en capas**: guards de Angular (UX) + Security Rules + validación server-side en Cloud Functions. El frontend nunca es la fuente de verdad de roles, permisos ni cupos.
- **Feature-based**: el código se organiza por dominio (`features/public`, `features/student`, `features/admin`) con una capa `core` (Firebase, auth, guards) y una `shared` (UI reutilizable, modelos).
- **Signals para estado de UI, RxJS para streams** (por ejemplo, el estado de autenticación se expone de ambas formas).

---

## DESARROLLO LOCAL

### Prerrequisitos

| Herramienta | Versión | Notas |
| --- | --- | --- |
| Node.js | **≥ 22.22.3** o **≥ 24.15.0** | Requisito de Angular 22 |
| npm | ≥ 10 | |
| Java (JDK) | **≥ 21** | Lo necesitan los emuladores de Firestore y Storage. Verificá con `java -version` en una terminal nueva. |

No hace falta instalar `firebase-tools` globalmente: viene como dependencia de desarrollo y se usa vía `npx`/scripts.

### Instalación

```bash
npm install
```

El `postinstall` instala también las dependencias de `functions/`.

### Arranque

Opción A — todo junto (emuladores + Angular):

```bash
npm run dev
```

Opción B — en dos terminales:

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
| Auth emulator | 127.0.0.1:9099 |
| Firestore emulator | 127.0.0.1:8080 |
| Functions emulator | 127.0.0.1:5001 |
| Storage emulator | 127.0.0.1:9199 |

Los emuladores arrancan vacíos cada vez. Si querés que los datos persistan entre reinicios usá `npm run firebase:emulators:persist` (exporta a `.emulator-data/`, ignorado por git).

### Datos de prueba (seed)

Con los emuladores corriendo, en otra terminal:

```bash
npm run seed
```

Crea usuarios en el emulador de Auth (con su custom claim `role`), sus perfiles en `users/{uid}`, la configuración pública del gimnasio (`gymSettings/public`) y planes de membresía de ejemplo. Es idempotente: se puede volver a ejecutar.

El script **solo** apunta a emuladores: se niega a correr si el proyecto no empieza con `demo-` o si los emuladores de Auth/Firestore no están levantados. Nunca recibe credenciales reales.

### Usuarios demo

> ⚠️ **Credenciales exclusivamente locales**, válidas solo contra el emulador de Auth. No existen en ningún proyecto real.

| Email | Rol | Nutrición | Recetario |
| --- | --- | --- | --- |
| `admin@gym.local` | ADMIN | – | – |
| `student1@gym.local` | STUDENT | ✔ | ✔ |
| `student2@gym.local` | STUDENT | ✖ | ✖ |

Contraseña de todos: `demo1234` (se puede cambiar con la variable de entorno `SEED_PASSWORD` al correr el seed).

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Compila functions y levanta emuladores + `ng serve` |
| `npm start` | Solo el dev server de Angular (http://localhost:4200) |
| `npm run firebase:emulators` | Emuladores de Auth, Firestore, Functions y Storage (+ Emulator UI) |
| `npm run firebase:emulators:persist` | Igual, importando/exportando datos en `.emulator-data/` |
| `npm run seed` | Carga datos demo en los emuladores |
| `npm run build` | Build de producción de Angular (`dist/disfrutandodelprocesofit/browser`) |
| `npm run functions:build` | Compila las Cloud Functions a `functions/lib` |
| `npm run functions:watch` | Compila functions en modo watch (el emulador recarga solo) |
| `npm run lint` | ESLint en Angular y en functions |
| `npm test` | Tests unitarios de Angular (Vitest) |
| `npm run test:functions` | Tests unitarios de Cloud Functions |
| `npm run test:all` | Ambos |

### Tests

Los tests priorizan comportamiento con valor real, no "el componente existe":

- `core/auth`: parseo de roles, mapeo de errores de Firebase a mensajes de usuario, `AuthService` (estado, claims, replay para guards).
- `core/guards`: `authGuard`, `roleGuard`, `guestGuard` y saneo de `redirectTo` (evita open redirects).
- `features/auth/login`: validación del formulario, navegación según rol, errores de credenciales.
- `functions/src/shared/auth.spec.ts`: `requireAuth` / `requireRole` devuelven los códigos `unauthenticated` / `permission-denied` correctos.

Los tests de reglas de seguridad contra el emulador (`@firebase/rules-unit-testing`) se incorporan a partir del milestone de autenticación/usuarios, cuando las reglas cubran las colecciones reales.

---

## Configuración de entornos

`src/environments/`:

| Archivo | Uso |
| --- | --- |
| `environment.model.ts` | Interfaz `AppEnvironment` (tipado de la configuración) |
| `environment.ts` | **Local**: `useEmulators: true`, proyecto `demo-disfrutando-fit`, puertos de los emuladores |
| `environment.prod.ts` | **Producción**: `useEmulators: false`, valores `REPLACE_ME` a completar con tu config web de Firebase |

`ng build` (configuración `production`) reemplaza `environment.ts` por `environment.prod.ts`. El cambio entre emuladores y producción es un único flag (`useEmulators`), aplicado en `src/app/core/firebase/firebase.providers.ts`.

La configuración web de Firebase (`apiKey`, `authDomain`, …) **no es un secreto** —se sirve al navegador— pero igualmente no se commitea con valores reales: completala justo antes de compilar para producción.

---

## Modelo de seguridad

**Autenticación**

- Firebase Authentication con email y contraseña.
- No hay auto-registro público. Las cuentas las crea el administrador mediante una Cloud Function (`createStudent`, milestone 3) que usa el Admin SDK: crea el usuario de Auth, su perfil en Firestore y asigna el custom claim `role`.
- Onboarding previsto: contraseña aleatoria no revelada + enlace de "establecer contraseña" (flujo de password reset de Firebase).

**Autorización (capas)**

1. **Angular** (solo UX): `authGuard`, `roleGuard('ADMIN' | 'STUDENT')`, `guestGuard`, navegación condicional. El root espera a que Firebase resuelva la sesión persistida para no parpadear estados incorrectos.
2. **Firestore / Storage Security Rules**: deny-by-default. El rol se lee de `request.auth.token.role`. Los roles y flags de permisos no pueden modificarse por escrituras de cliente.
3. **Cloud Functions**: cada callable valida autenticación, rol e input (`functions/src/shared/auth.ts`) y devuelve errores estructurados (`HttpsError`).

**Roles**

| Claim `role` | Portal | Descripción |
| --- | --- | --- |
| `ADMIN` | `/admin` | Gestiona alumnos, agenda, planes, recetas y configuración |
| `STUDENT` | `/app` | Accede solo a sus propios datos |
| _(sin claim)_ | `/unauthorized` | Cuenta creada pero sin rol asignado |

**Permisos por feature** (`users/{uid}.features`): `nutritionEnabled`, `recipesEnabled`. Cuando están en `false` se oculta la navegación, se bloquea la ruta y las reglas de Firestore niegan la lectura.

---

## Modelo de datos (Firestore)

Diseño pensado en patrones de acceso (no relacional). Colecciones actuales y previstas:

```
users/{userId}                         perfil, rol (copia informativa del claim), features
users/{userId}/measurements/{id}       histórico de mediciones (nunca se sobreescribe)
users/{userId}/trainingPlans/{id}      planes de entrenamiento con días y ejercicios embebidos
users/{userId}/nutritionPlans/{id}     planes de nutrición con comidas embebidas
scheduleSlots/{slotId}                 horarios: fecha, hora, capacidad, cupo usado, habilitado
scheduleSlots/{slotId}/bookings/{uid}  reservas (id = uid → evita duplicados por diseño)
recipes/{recipeId}                     recetario (imagen en Storage)
membershipPlans/{planId}               planes de membresía públicos
gymSettings/public                     configuración pública del gimnasio
```

Razonamiento:

- Los datos privados del alumno cuelgan de `users/{uid}` → una sola regla de propiedad protege todo el subárbol.
- Los planes se guardan como documentos autocontenidos (días/ejercicios embebidos): se leen siempre completos y son chicos.
- Las reservas viven bajo el slot, con el `uid` como id de documento: el chequeo de duplicado y el contador de cupo se resuelven en una transacción sobre el mismo documento padre.
- `membershipPlans` y `gymSettings/public` son las únicas lecturas anónimas.

---

## Estructura del proyecto

```
.
├── firebase.json                Emuladores, hosting, rules, functions
├── .firebaserc                  Proyecto por defecto: demo-disfrutando-fit (solo emuladores)
├── firestore.rules / storage.rules / firestore.indexes.json
├── functions/                   Cloud Functions (TypeScript, Node 22)
│   └── src/
│       ├── index.ts             Registro de funciones + opciones globales
│       ├── shared/              auth.ts (requireAuth/requireRole), errors.ts
│       └── system/ping.ts       Health check autenticado
├── scripts/seed/                Seed de datos demo (solo emuladores)
└── src/
    ├── environments/            Config local / producción
    ├── styles/                  Design tokens, reset, tipografía, breakpoints, utilidades
    └── app/
        ├── core/
        │   ├── firebase/        Tokens de inyección + provideFirebase()
        │   ├── auth/            AuthService, modelos de rol, mapeo de errores
        │   └── guards/          authGuard, roleGuard, guestGuard
        ├── shared/
        │   ├── components/      Button, Card, PageHeader, FormField, Icon, Spinner,
        │   │                    LoadingState, EmptyState, ErrorState, PortalShell
        │   ├── config/          Branding por defecto
        │   └── models/          Tipos compartidos (NavItem)
        └── features/
            ├── public/          Layout público, home, placeholders de planes/contacto
            ├── auth/            Login, página "sin acceso"
            ├── student/         Layout del portal alumno (tabs móviles) + dashboard
            ├── admin/           Layout del portal admin (sidebar/drawer) + dashboard
            └── not-found/       404
```

Convenciones: nombres de archivo sin sufijo `.component` (guía de estilo Angular 20+), textos de UI en español rioplatense, código y comentarios en inglés.

---

## DESPLIEGUE A PRODUCCIÓN

> Esta sección es **solo documentación**. Nada del repositorio despliega ni se conecta a un proyecto real; el despliegue lo hacés vos manualmente.

1. **Crear el proyecto Firebase** en https://console.firebase.google.com (plan Blaze, necesario para Cloud Functions 2.ª gen).
2. **Habilitar Authentication** → método *Email/Password*.
3. **Habilitar Firestore** en modo producción, eligiendo la región (por ejemplo `southamerica-east1`).
4. **Habilitar Storage**.
5. **Cloud Functions**: la región por defecto es `us-central1` (`functions/src/index.ts` y `functionsRegion` en los environments). Si la cambiás, cambiala en ambos lugares.
6. **Completar `src/environments/environment.prod.ts`** con la configuración web de tu proyecto (Consola → Configuración del proyecto → Tus apps → SDK). No la commitees con valores reales.
7. **Seleccionar el proyecto** en la CLI (una sola vez):
   ```bash
   npx firebase login
   npx firebase use --add
   ```
   Elegí tu proyecto y asignale el alias `prod`. Para deploy usá siempre `--project prod` (el alias `default` sigue apuntando al proyecto demo de emuladores).
8. **Índices de Firestore**: se despliegan desde `firestore.indexes.json` (se completa a medida que aparecen consultas compuestas).
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
12. **Build de Angular para producción**:
    ```bash
    npm run build
    ```
13. **Hosting**: ya está configurado en `firebase.json` (`public: dist/disfrutandodelprocesofit/browser`, rewrite SPA a `index.html`, cache inmutable para assets con hash).
14. **Desplegar Hosting**:
    ```bash
    npx firebase deploy --only hosting --project prod
    ```

Después del primer despliegue vas a necesitar crear el primer usuario administrador. El procedimiento documentado (script de bootstrap con Admin SDK, ejecutado por vos con tus credenciales) se agrega junto con la Cloud Function `createStudent` en el milestone 3.
