# Stack Tecnológico - Sistema de Nómina SODIMAC

## 📋 Información General

**Proyecto:** Sistema de Gestión de Nómina  
**Arquitectura:** Monolito Modular (Frontend + Backend separados)  
**Última actualización:** 2025-11-24

---

## 🔧 Backend Stack

### Core Framework
- **NestJS** `^11.0.1` - Framework Node.js progresivo con arquitectura modular
  - Propósito: Estructura de aplicación, DI, módulos
  - Política: Actualizar minor versions automáticamente

### ORM & Database
- **Prisma** `^6.9.0` - ORM type-safe para PostgreSQL
  - Propósito: Gestión de base de datos, migraciones, queries
  - Cliente: `@prisma/client` sincronizado con Prisma
- **PostgreSQL** `pg ^8.14.1` - Driver de base de datos
  - Versión DB: PostgreSQL 14+

### Autenticación & Seguridad
- **Passport** `^0.7.0` + **passport-jwt** `^4.0.1` - Autenticación JWT
- **jsonwebtoken** `^9.0.2` - Generación y validación de tokens
- **cookie-parser** `^1.4.7` - Manejo de cookies HTTP-only
- **@nestjs/jwt** `^11.0.0` - Integración JWT con NestJS

### API & Documentación
- **Swagger** `@nestjs/swagger ^11.2.0` - Documentación OpenAPI
  - Endpoint: `/Nomina/docs`
- **swagger-ui-express** `^5.0.1` - UI para documentación

### Utilidades
- **axios** `^1.10.0` - Cliente HTTP (llamadas externas)
- **date-fns** `^4.1.0` - Manipulación de fechas
- **exceljs** `^4.4.0` - Generación de archivos Excel
- **multer** `^2.0.1` - Manejo de uploads de archivos

### Testing & Quality
- **Jest** `^29.7.0` - Framework de testing
- **@nestjs/testing** `^11.0.1` - Utilidades de testing NestJS
- **supertest** `^7.0.0` - Testing HTTP
- **ESLint** `^9.18.0` + **Prettier** `^3.4.2` - Linting y formateo

### Desarrollo
- **TypeScript** `^5.7.3` - Lenguaje principal
- **ts-node** `^10.9.2` - Ejecución TypeScript
- **@swc/core** `^1.10.7` - Compilación rápida

---

## ⚛️ Frontend Stack

### Core Framework
- **React** `^18.2.0` - Biblioteca UI
  - Propósito: Componentes, estado, lifecycle
- **React DOM** `^18.2.0` - Renderizado DOM
- **TypeScript** `^5.8.3` - Type safety

### Build Tool
- **Vite** `^6.3.2` - Build tool ultra-rápido
  - Dev server, HMR, optimización de producción
- **@vitejs/plugin-react** `^4.4.1` - Plugin React para Vite

### Routing & State
- **React Router DOM** `^7.5.3` - Enrutamiento SPA
- **React Context API** - Gestión de estado global (auth)

### UI & Styling
- **TailwindCSS** `^3.0.0` - Framework CSS utility-first
- **PostCSS** `^8.5.3` + **Autoprefixer** `^10.4.21` - Procesamiento CSS
- **Lucide React** `^0.522.0` - Iconos modernos
- **React Icons** `^5.5.0` - Biblioteca adicional de iconos
- **@headlessui/react** `^2.2.2` - Componentes accesibles sin estilos

### Forms & Validation
- **React Hook Form** `^7.55.0` - Manejo de formularios
- **Zod** `^3.24.3` - Validación de schemas
- **react-datepicker** `^8.4.0` - Selector de fechas

### HTTP & Auth
- **Axios** `^1.8.4` - Cliente HTTP
  - Configuración centralizada en `src/api/client.ts`
- **@react-oauth/google** `^0.12.1` - OAuth Google
- **jwt-decode** `^4.0.0` - Decodificación de JWT

### Utilidades
- **date-fns** `^4.1.0` - Manipulación de fechas
- **date-holidays** `^3.24.4` - Cálculo de festivos

### Testing (Nuevas)
- **Vitest** `^1.0.0` - Framework de testing (compatible con Vite)
- **@testing-library/react** `^14.0.0` - Testing de componentes React
- **@testing-library/jest-dom** `^6.1.0` - Matchers de DOM
- **@testing-library/user-event** `^14.5.0` - Simulación de eventos
- **jsdom** `latest` - Entorno DOM para tests

### Quality & Linting
- **ESLint** `^9.25.0` - Linter JavaScript/TypeScript
- **Prettier** `^3.5.3` - Formateador de código
- **TypeScript ESLint** `^8.30.1` - Reglas TypeScript

---

## 🔄 Política de Actualización

### Actualizaciones Automáticas (CI/CD)
- **Patch versions** (`~`): Automáticas semanalmente
- **Minor versions** (`^`): Revisión mensual, auto-update si tests pasan
- **Major versions**: Manual, requiere revisión de breaking changes

### Monitoreo
- **npm audit**: Ejecutar semanalmente
- **npm outdated**: Revisar mensualmente
- **Dependabot**: Configurar para PRs automáticos (recomendado)

### Versiones Críticas (No actualizar sin pruebas)
- React (major)
- NestJS (major)
- Prisma (major - posibles cambios en schema)
- PostgreSQL driver

---

## 🛡️ Seguridad

### Estado Actual
- ✅ **0 vulnerabilidades** conocidas (npm audit)
- ✅ Dependencias actualizadas <30 días
- ✅ Sin librerías deprecated

### Mejores Prácticas
- Usar `npm ci` en producción (lock file exacto)
- Versionar `package-lock.json`
- Ejecutar `npm audit` antes de cada deploy
- Revisar CVEs de librerías críticas mensualmente

---

## 📊 Compatibilidad

### Navegadores (Frontend)
- Chrome/Edge: últimas 2 versiones
- Firefox: últimas 2 versiones
- Safari: últimas 2 versiones
- Mobile: iOS 14+, Android 8+

### Node.js (Backend/Frontend)
- **Requerido:** Node.js >= 18.x
-  **Recomendado:** Node.js 20.x LTS
- **Package Manager:** npm >= 9.x

### Base de Datos
- PostgreSQL >= 14.0
- Prisma Schema version: 4+

---

## 🚀 Comandos Útiles

### Backend
```bash
npm run start:dev    # Desarrollo con watch
npm run build        # Compilar producción
npm test             # Ejecutar tests
npm run lint         # Revisar código
```

### Frontend
```bash
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run preview      # Preview build
npm run test         # Ejecutar tests (Vitest)
npm run test:ui      # UI de tests
```

### Mantenimiento
```bash
npm outdated         # Ver actualizaciones disponibles
npm audit            # Revisar vulnerabilidades
npm update           # Actualizar minor/patch
```

---

## 📝 Notas

- Frontend usa Vite en vez de Create React App (más rápido)
- Backend usa Prisma en vez de TypeORM (más type-safe)
- Autenticación sin refresh tokens (solo JWT en cookies HTTP-only)
- Testing configurado pero coverage meta: 70%+

**Última revisión:** 2025-11-24  
**Mantenedor:** Equipo de Desarrollo
