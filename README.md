# Academic Papers Showcase

Website to explore and visualize research publications from the FONDECYT research group at **Universidad de Valparaíso**, led by Dr. Rodrigo Olivares. The project focuses on using artificial learning behaviors to intelligently balance convergence and search procedures in bio-inspired optimization solvers.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Analytics:** Vercel Analytics
- **Package Manager:** pnpm

## Features

- **Papers catalog:** Loads and parses BibTeX (`.bib`) files with conference papers and journal articles.
- **Search & filters:** Search by title, authors, and keywords. Filter by year, publication type, and keywords.
- **Pagination:** Paginated navigation for papers.
- **Team profiles:** Collaborators with biography, expertise areas, and publication metrics (clickable).
- **Paper cards:** Show type, year, title, authors, expandable abstract, keywords, and external links.
- **Under Review badge:** Papers without a URL display an "Under Review" badge instead of a View button.
- **Responsive design:** Adapted for mobile, tablet, and desktop.
- **Dark mode:** Supported via next-themes.

## Project Structure

```
cv-web/
├── app/
│   ├── layout.tsx          # Root layout with metadata and fonts
│   ├── page.tsx            # Main page (core component)
│   ├── loading.tsx         # Loading skeleton
│   └── globals.css         # Global styles with CSS variables
├── components/
│   ├── ui/                 # shadcn/ui components (~50 components)
│   └── theme-provider.tsx  # Theme context provider
├── hooks/
│   ├── use-toast.ts        # Toast notifications hook
│   └── use-mobile.ts       # Mobile device detection hook
├── lib/
│   ├── bibtex-parser.ts    # BibTeX file parser
│   └── utils.ts            # Utilities (cn helper)
├── public/
│   ├── refsConf.bib        # Conference papers (BibTeX)
│   ├── refsJour.bib        # Journal articles (BibTeX)
│   ├── refs.bib            # FONDECYT papers (BibTeX)
│   └── *.png / *.jpeg      # Team photos and logos
└── package.json
```

## Installation & Usage

### Prerequisites

- Node.js 18+
- pnpm

### Development

```bash
pnpm install
pnpm dev
```

The site will be available at `http://localhost:3000`.

### Production build

```bash
pnpm build
```

### Deployment (Apache)

```bash
cd /tmp/cv-web && git pull && rm -rf node_modules && pnpm install && pnpm build && sudo cp -r out/* /Library/WebServer/Documents/
```

## Data

Papers are loaded from BibTeX files located in `/public/`:

- `refsConf.bib` — Conference papers
- `refsJour.bib` — Journal articles
- `refs.bib` — FONDECYT-tagged papers

Team member data is defined directly in `app/page.tsx`.

Papers without a valid URL (e.g., `to appear`) are automatically shown as "Under Review".

## Repository

[https://github.com/BenjaminSerrano/cv-web](https://github.com/BenjaminSerrano/cv-web)
