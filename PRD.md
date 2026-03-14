# Product Requirements Document — DM Manager

**Version**: 1.1
**Fecha**: 2026-03-14
**Estado**: MVP en progreso
**Autor**: Adriel

---

## 1. Visión del Producto

DM Manager es una herramienta web de gestión centralizada para **Dungeon Masters (DM)** de juegos de rol de mesa. Su objetivo es unificar en un solo lugar toda la documentación que un DM necesita para dirigir sus campañas: campañas, grupos, misiones, sesiones y personajes.

**Problema que resuelve**: Los DMs gestionan grandes volúmenes de información dispersa (notas en papel, docs de texto, hojas de cálculo). DM Manager unifica esa información de forma visual e interactiva, reduciendo la fricción durante la preparación y ejecución de sesiones.

---

## 2. Usuarios Objetivo

| Perfil | Descripción |
|--------|-------------|
| Dungeon Master | Persona que dirige la partida. Usuario principal y único en el MVP. |

> En versiones futuras se podrían incorporar jugadores con acceso limitado a su propio personaje.

---

## 3. Alcance del MVP

El MVP cubre la gestión completa (crear, leer, actualizar) de las entidades principales de una campaña de rol, con una interfaz gráfica funcional para visualizar y operar sobre esa información.

### Fuera del alcance del MVP
- Autenticación / multi-usuario
- Compartir campañas con jugadores
- Exportación de documentos
- Mapas o assets gráficos
- Notificaciones o recordatorios
- Mobile-first / app nativa

---

## 4. Entidades del Dominio

### 4.1 Campaña (`Campaign`)
Entidad raíz. Agrupa todos los recursos de una partida.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string (min 3) | Nombre de la campaña |
| `description` | string (min 3) | Descripción general |
| `status` | `Activa` \| `Pausada` \| `Finalizada` | Estado actual |
| `sessions` | number | Contador de sesiones realizadas |
| `nextSessionAt` | Date (opcional) | Fecha de la próxima sesión |
| `lastSessionAt` | Date (opcional) | Fecha de la última sesión |
| `groups` | `{id, name}[]` | Grupos asociados a la campaña |

### 4.2 Grupo (`Group`)
Representa un grupo de personajes jugadores (party) dentro de una campaña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del grupo |
| `description` | string | Descripción del grupo |
| `members` | `{id, name, classType}[]` | Personajes miembros |

### 4.3 Personaje (`Character`)
Personaje jugable (PC) o no jugable (NPC) relacionado a una campaña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del personaje |
| `age` | `child` \| `teenager` \| `adult` \| `elderly` | Rango etario |
| `classType` | enum (18 clases D&D) | Clase del personaje |
| `level` | number (min 1) | Nivel actual |
| `hitPoints` | number (min 0) | Puntos de vida |
| `description` | string (opcional) | Trasfondo / descripción |
| `location` | string (opcional) | Ubicación actual |
| `isNPC` | boolean | `true` si es NPC |

### 4.4 Misión (`Mission`)
Aventura o tarea dentro de una campaña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre de la misión |
| `description` | string | Resumen de la misión |
| `missionGuide` | string | Guía detallada del DM |
| `missionPriority` | string | Prioridad de la misión |
| `status` | `Activa` \| `Pausada` \| `Finalizada` | Estado |
| `missionEvents` | `{name, difficult}[]` (opcional) | Eventos/encuentros |
| `relatedCharacters` | `{id, name}[]` (opcional) | Personajes involucrados |
| `rewards` | string (opcional) | Recompensas al completar |
| `startDate` / `endDate` | Date (opcional) | Fechas de la misión |

### 4.5 Sesión (`Session`)
Registro de una sesión de juego dentro de una campaña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `campaignId` | string | Campaña a la que pertenece |
| `title` | string | Título de la sesión |
| `notes` | string | Notas del DM sobre la sesión |
| `sessionNumber` | number (min 1) | Número de sesión |
| `date` | Date | Fecha en que se jugó |

---

## 5. Funcionalidades del MVP

### 5.1 Gestión de Campañas
- **Crear** una campaña con nombre, descripción y estado
- **Ver** listado de todas las campañas con su estado
- **Ver detalle** de una campaña (info + recursos asociados)
- **Actualizar** los datos de una campaña
- **Cambiar estado** de la campaña (Activa → Pausada → Finalizada)

### 5.2 Gestión de Grupos
- **Crear** un grupo y asignarle personajes
- **Ver** los grupos de una campaña
- **Actualizar** miembros y descripción del grupo

### 5.3 Gestión de Personajes
- **Crear** un personaje (PC o NPC)
- **Ver** listado de personajes (con filtro PC/NPC)
- **Ver detalle** de un personaje
- **Actualizar** la información del personaje (nivel, HP, ubicación, etc.)

### 5.4 Gestión de Misiones
- **Crear** una misión con guía, eventos y personajes relacionados
- **Ver** listado de misiones con estado y prioridad
- **Ver detalle** de una misión
- **Actualizar** la misión (eventos, recompensas, estado)

### 5.5 Gestión de Sesiones
- **Registrar** una sesión con título, notas y fecha
- **Ver** el historial de sesiones de una campaña ordenado por número
- **Actualizar** las notas de una sesión

### 5.6 Interfaz Gráfica
- **Dashboard** de campañas como punto de entrada
- **Vista de detalle de campaña** mostrando grupos, misiones y sesiones asociadas
- **Formularios** para crear y editar cada entidad
- **Navegación** fluida entre campaña → misión / personaje / sesión

---

## 6. API (Estado Actual)

Todos los endpoints siguen el patrón REST con respuestas JSON.

### 6.1 Endpoints CRUD por entidad

| Entidad | GET lista | POST | GET por ID | PUT | DELETE |
|---------|-----------|------|-----------|-----|--------|
| Campaign | ✅ | ✅ | ✅ | ✅ | ✅ |
| Character | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mission | ✅ | ✅ | ✅ | ✅ | ✅ |
| Session | ✅ | ✅ | ✅ | ✅ | ✅ |
| Group | ✅ | ✅ | ✅ | ✅ | ✅ |

### 6.2 Endpoints de Dashboard

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Estadísticas globales (totales de campañas, personajes, misiones, sesiones) |
| `/api/dashboard/recent-campaigns` | GET | Campañas más recientes (param: `?limit=n`, default 5) |
| `/api/dashboard/recent-groups` | GET | Grupos más recientes (param: `?limit=n`, default 5) |

> La API REST está completa para todas las entidades del MVP. Adicionalmente cuenta con endpoints de Dashboard para alimentar la vista de inicio.

---

## 7. Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | ^16.1.6 |
| Runtime UI | React | 19.1.0 |
| Lenguaje | TypeScript | ^5 |
| Base de datos | MongoDB | ^6.18.0 |
| Validación de entrada | Zod | ^4.0.10 |
| UI Components | HeroUI | ^2.8.2 |
| Estilos | Tailwind CSS | ^4.1.11 |
| Animaciones | Framer Motion | ^12.23.12 |
| Tests unitarios | Vitest + Testing Library | ^3.2.4 |
| Tests E2E | Playwright | ^1.58.2 |
| Arquitectura | Hexagonal (Ports & Adapters) | — |
| Infraestructura local | Docker Compose (MongoDB) | — |

---

## 8. Criterios de Aceptación del MVP

### 8.1 Funcionalidad CRUD
- [x] El DM puede crear, ver y actualizar campañas
- [x] El DM puede crear, ver y actualizar personajes (PC y NPC)
- [x] El DM puede crear, ver y actualizar misiones
- [x] El DM puede crear, ver y actualizar sesiones
- [x] El DM puede crear, ver y actualizar grupos

### 8.2 Interfaz Gráfica
- [x] Dashboard con estadísticas globales y accesos rápidos
- [x] Vista de listado de campañas
- [x] Vista de detalle de campaña mostrando grupos, misiones y sesiones asociadas
- [x] Vista de listado de personajes con filtro PC/NPC
- [x] Vista de listado de grupos
- [ ] Formularios de edición con validación en el cliente antes de enviar
- [ ] Los errores de API se muestran de forma comprensible al usuario

### 8.3 Calidad y Tests
- [x] Tests unitarios de use cases para todas las entidades (campaign, character, mission, session, group, dashboard)
- [x] Tests unitarios de entidades de dominio (campaign, character, group)
- [ ] Tests E2E cubren los flujos principales de usuario (campaigns, characters, campaign-detail)
- [x] La aplicación corre en local con `npm run dev` + `npm run dockerstart`

---

## 9. Roadmap Post-MVP

| Fase | Funcionalidades |
|------|----------------|
| v1.1 | Dashboard con estadísticas de campaña |
| v1.2 | Búsqueda y filtros avanzados |
| v2.0 | Autenticación + multi-DM |
| v2.1 | Acceso limitado para jugadores |
| v3.0 | Exportación de campaña (PDF / Markdown) |

---

## 10. Métricas de Éxito (MVP)

- El DM puede gestionar una campaña completa sin salir de la aplicación
- Tiempo de carga de listados < 1 segundo
- Cero pérdida de datos en operaciones CRUD
