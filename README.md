# Academic Papers Showcase

Sitio web para visualizar y explorar publicaciones de investigación del grupo de investigación FONDECYT de la **Universidad de Valparaíso**, liderado por el Dr. Rodrigo Olivares. El proyecto se enfoca en el uso de comportamientos de aprendizaje artificial para balancear inteligentemente los procedimientos de convergencia y búsqueda en solvers de optimización bioinspirados.

## Tech Stack

- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix UI)
- **Iconos:** Lucide React
- **Analytics:** Vercel Analytics
- **Package Manager:** pnpm

## Funcionalidades

- **Catálogo de papers:** Carga y parsea archivos BibTeX (`.bib`) con papers de conferencias y artículos de revista.
- **Búsqueda y filtrado:** Búsqueda por título, autores y keywords. Filtros por año, tipo de publicación y palabras clave.
- **Paginación:** Navegación paginada para papers y miembros del equipo.
- **Perfiles del equipo:** 14 investigadores con biografía, áreas de expertise, métricas de publicación e información de contacto.
- **Tarjetas de papers:** Muestran tipo, año, título, autores, abstract expandible, keywords y enlaces externos.
- **Diseño responsive:** Adaptado para móvil, tablet y escritorio.
- **Modo oscuro:** Soporte mediante next-themes.

## Estructura del Proyecto

```
academic-papers-showcase/
├── app/
│   ├── layout.tsx          # Layout raíz con metadata y fuentes
│   ├── page.tsx            # Página principal (componente central)
│   ├── loading.tsx         # Skeleton de carga
│   └── globals.css         # Estilos globales con variables CSS
├── components/
│   ├── ui/                 # Componentes shadcn/ui (~50 componentes)
│   └── theme-provider.tsx  # Proveedor de contexto para temas
├── hooks/
│   ├── use-toast.ts        # Hook para notificaciones toast
│   └── use-mobile.ts       # Hook para detección de dispositivos móviles
├── lib/
│   ├── bibtex-parser.ts    # Parser de archivos BibTeX
│   └── utils.ts            # Utilidades (cn helper)
├── public/
│   ├── refsConf.bib        # Papers de conferencias (BibTeX)
│   ├── refsJour.bib        # Artículos de revista (BibTeX)
│   └── *.png               # Imágenes del equipo y logos
└── package.json
```

## Instalación y Uso

### Requisitos previos

- Node.js 18+
- pnpm

### Desarrollo

```bash
pnpm install
pnpm dev
```

El sitio estará disponible en `http://localhost:3000`.

### Build de producción

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## Datos

Los papers se cargan desde archivos BibTeX ubicados en `/public/`:

- `refsConf.bib` — Papers de conferencias (~25 publicaciones)
- `refsJour.bib` — Artículos de revista (~25 publicaciones)

Los datos del equipo de investigación están definidos directamente en `app/page.tsx`.

## Deployment

El proyecto está configurado para desplegarse en **Netlify** o **Vercel**. No requiere variables de entorno ni backend; todos los datos son estáticos.

La optimización de imágenes de Next.js está deshabilitada (`unoptimized: true`) para compatibilidad con hosting estático.

## Repositorio

[https://github.com/BenjaminSerrano/cv-web](https://github.com/BenjaminSerrano/cv-web)
