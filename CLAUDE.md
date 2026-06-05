# CLAUDE.md

## Project

Curso de **Spec-Driven Development (SDD)** con Claude. Monorepo con tres capas independientes: `back/` (Spring Boot), `front/` (React + Vite), `e2e/` (Playwright).

## Commands

### Frontend (`front/`)
```
npm run dev        # dev server en http://localhost:5173
npm run build      # compilar TypeScript + Vite
npm run lint       # ESLint
npm test           # Vitest (single run)
npm run test:watch # Vitest en modo watch
```

### Backend (`back/`)
```
./mvnw spring-boot:run   # API en http://localhost:8080  (Windows: mvnw.cmd)
./mvnw test              # JUnit tests
```

### E2E (`e2e/`)
```
npm test           # Playwright — arranca back y front automáticamente
npm run test:headed
```

## Architecture

### Backend — Spring Boot 3.5 / Java 21 / SQLite

Paquete base: `dev.aiddbot.abjavareact`. Una carpeta por feature bajo `src/main/java/.../`:
- `Controller` — REST endpoint, mapea HTTP status
- `Service` — lógica de negocio, inyección por constructor
- `Repository` — Spring Data JPA (`JpaRepository`)
- `HealthResponse` / records — DTOs como Java records

Base de datos SQLite en `data/app.db`. CORS habilitado sólo para `http://localhost:5173`.

Ruta base de la API: `/api/`.

### Frontend — React 19 / TypeScript / Vite

Organización por features bajo `src/features/{feature}/`:
- `{Feature}.tsx` — componente de presentación, consume el hook
- `use{Feature}.ts` — custom hook con estado y efecto
- `{feature}Api.ts` — llamadas HTTP usando `httpClient`
- CSS colocado junto al componente

Utilidades compartidas en `src/shared/`:
- `api/httpClient.ts` — wrapper fino sobre `fetch`, lee `VITE_API_BASE_URL`
- `types/` — interfaces TypeScript compartidas

### Coding rules (`maneras-de-programar.rules.md`)

Para nuevo código TypeScript en `front/`:
- Usar **POO** (clases)
- Escribir **logs** de las operaciones
- **Controlar errores** con try/catch
- Añadir **tests unitarios** (Vitest)
- Hacer **commit** al acabar siguiendo Conventional Commits

### Spec workflow

Las especificaciones de funcionalidades se crean en la raíz con la forma `{slug}.spec.md`, usando la plantilla `cosas-que-hacer.template.md` y el skill `cosas-que-hacer.skill.md`.
