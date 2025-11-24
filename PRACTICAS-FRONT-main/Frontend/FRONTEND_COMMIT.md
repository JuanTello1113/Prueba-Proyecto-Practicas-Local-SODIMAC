feat: Centralize API client and improve frontend code quality

## Infrastructure Improvements
- **Centralized API Client**: Created `src/api/client.ts` with automatic baseURL configuration
  - Axios instance with `VITE_API_URL` environment variable support
  - Request/response interceptors for development debugging
  - Automatic credential handling (withCredentials: true)

- **Error Boundary**: Implemented React ErrorBoundary component
  - Graceful error handling with user-friendly UI
  - Development mode shows detailed error information
  - Page reload option for recovery

- **Environment Configuration**: Created `.env.example` documenting all variables
  - VITE_API_URL for backend endpoint
  - VITE_GOOGLE_CLIENT_ID for OAuth

## Code Quality Enhancements
- **URL Refactoring**: Migrated 25+ files from hardcoded URLs to centralized API client
  - User Management: UsersGestion.tsx, UsuserRegis.tsx
  - Dashboards: DashboardNomina.tsx
  - Forms: FormBasico.tsx, FormHorasExt.tsx, FormVacaciones.tsx, etc.
  - Filters: All filter components
  - Export views: VistaArchivoExportNomina.tsx, VistaArchivoExportTienda.tsx

- **Console Cleanup**: Wrapped debug console.logs in `import.meta.env.DEV` checks
  - AuthProvider.tsx
  - ProtectedRoute.tsx
  - LoginPage.tsx
  - FormBasico.tsx
  
- **Code Cleanup**:
  - Removed unused imports (axios, React, icons)
  - Removed duplicate apiClient imports
  - Removed stub console.log statements
  - Fixed import organization

## UI Improvements
- **Custom Favicon**: Added project-specific favicon (public/favicon.png)
- **Updated index.html**: Changed favicon reference from SVG to PNG

## User Management Fixes
- **UsersGestion.tsx**: Fixed icon imports (Ban instead of XCircle)
- **AlerFormCrearUser.tsx**: 
  - Fixed API URLs to use relative paths
  - Added store selection validation for "Jefe de Tienda" role
  - Improved role auto-selection logic

- **DashboardAdministrador.tsx**: Enhanced error messages from backend

## Tooling
- **Automation Scripts**:
  - refactor-urls.ps1: Bulk URL refactoring automation
  - cleanup-duplicates.ps1: Remove duplicate import statements

## Dependencies Updated
- Updated browserslist database (caniuse-lite)

## Testing & Verification
- ✅ All user management flows tested
- ✅ API calls working with centralized client
- ✅ Console clean in production mode
- ✅ Error boundary catches and displays errors
- ✅ Environment variables properly configured

## Breaking Changes
None - All changes are backward compatible

## Migration Notes
- Set `VITE_API_URL` in `.env` before deployment
- Default fallback is `http://localhost:3000` for development

---
Production-ready frontend with improved maintainability and code quality.
