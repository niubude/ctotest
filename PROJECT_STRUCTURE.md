# Project Structure

```
svn-commit-ui/
├── __tests__/                          # Test files
│   ├── commit-list.test.tsx           # CommitList component tests (11 tests)
│   └── repository-selector.test.tsx   # RepositorySelector tests (7 tests)
│
├── app/                                # Next.js App Router
│   ├── api/                           # API routes
│   │   └── svn/
│   │       ├── commits/
│   │       │   └── route.ts          # GET /api/svn/commits
│   │       ├── diff/
│   │       │   └── route.ts          # GET /api/svn/diff
│   │       └── repositories/
│   │           └── route.ts          # GET/POST /api/svn/repositories
│   ├── globals.css                    # Global styles (Tailwind + shadcn)
│   ├── layout.tsx                     # Root layout component
│   └── page.tsx                       # Main page (home)
│
├── components/                         # React components
│   ├── ui/                            # shadcn/ui components
│   │   ├── button.tsx                # Button component
│   │   ├── card.tsx                  # Card component
│   │   ├── checkbox.tsx              # Checkbox component
│   │   ├── input.tsx                 # Input component
│   │   ├── label.tsx                 # Label component
│   │   ├── select.tsx                # Select dropdown component
│   │   ├── sheet.tsx                 # Sheet/Drawer component
│   │   └── table.tsx                 # Table component
│   ├── commit-detail.tsx              # Commit detail drawer with diffs
│   ├── commit-list.tsx                # Commit list table with filters
│   └── repository-selector.tsx        # Repository dropdown selector
│
├── lib/                                # Utilities and shared code
│   ├── prisma.ts                      # Prisma client singleton
│   └── utils.ts                       # Utility functions (cn helper)
│
├── prisma/                             # Prisma database
│   ├── schema.prisma                  # Database schema
│   ├── seed.ts                        # Database seeding script
│   └── dev.db                         # SQLite database (gitignored)
│
├── .env                                # Environment variables (gitignored)
├── .env.example                        # Example environment variables
├── .eslintrc.json                      # ESLint configuration
├── .gitignore                          # Git ignore rules
├── components.json                     # shadcn/ui configuration
├── FEATURES.md                         # Feature documentation
├── IMPLEMENTATION.md                   # Implementation summary
├── jest.config.js                      # Jest configuration
├── jest.setup.js                       # Jest setup with polyfills
├── next.config.js                      # Next.js configuration
├── package.json                        # NPM dependencies and scripts
├── postcss.config.js                   # PostCSS configuration
├── PROJECT_STRUCTURE.md               # This file
├── README.md                           # Main documentation
├── REQUIREMENTS_CHECKLIST.md          # Requirements verification
├── tailwind.config.ts                  # Tailwind CSS configuration
└── tsconfig.json                       # TypeScript configuration
```

## Key Directories

### `/app`
Next.js 14 App Router directory containing all pages and API routes. Uses server components by default with client components marked with 'use client' directive.

### `/components`
Reusable React components split into:
- `/ui` - Base shadcn/ui components (buttons, inputs, etc.)
- Root level - Application-specific components (commit list, repository selector, etc.)

### `/lib`
Shared utilities and configurations:
- Prisma client setup
- Utility functions for styling

### `/prisma`
Database-related files:
- Schema definition
- Seed scripts
- SQLite database file (generated)

### `/__tests__`
Component tests using Jest and React Testing Library. Each component has its own test file with comprehensive coverage.

## File Naming Conventions

- **Components**: kebab-case (e.g., `commit-list.tsx`)
- **Tests**: kebab-case with `.test.tsx` suffix (e.g., `commit-list.test.tsx`)
- **API Routes**: `route.ts` in directory structure
- **Utilities**: kebab-case (e.g., `prisma.ts`, `utils.ts`)
- **Config files**: Standard names (e.g., `tsconfig.json`, `next.config.js`)

## Component Dependencies

```
app/page.tsx (Main Page)
├── RepositorySelector
│   └── ui/Select
│       └── ui/Label
├── CommitList
│   ├── ui/Input (filters)
│   ├── ui/Button (apply filters)
│   ├── ui/Table (commit display)
│   └── ui/Checkbox (multi-select)
└── CommitDetail
    ├── ui/Sheet (drawer)
    ├── ui/Card (metadata display)
    └── react-diff-viewer-continued (diffs)
```

## Build Output

Production build creates:
- Static pages for SSG
- Dynamic routes for API endpoints
- Optimized JavaScript bundles
- CSS with Tailwind purging

## Data Flow

```
Database (SQLite)
    ↓
Prisma Client
    ↓
API Routes (/api/svn/*)
    ↓
SWR (Client-side data fetching)
    ↓
React Components
    ↓
User Interface
```

## State Management

- **Server State**: SWR handles API data fetching and caching
- **Local State**: React useState for UI state (selections, filters, etc.)
- **Form State**: Controlled components with React hooks

## Testing Structure

```
__tests__/
├── commit-list.test.tsx
│   ├── Rendering tests
│   ├── State tests (loading, empty)
│   ├── Interaction tests (selection, filtering)
│   └── Edge case tests
└── repository-selector.test.tsx
    ├── Rendering tests
    ├── Selection tests
    └── State tests
```

## Development Workflow

1. Start dev server: `npm run dev`
2. Make changes to components
3. Hot reload reflects changes instantly
4. Write/update tests
5. Run tests: `npm test`
6. Lint code: `npm run lint`
7. Build for production: `npm run build`

## Production Deployment

1. Build: `npm run build`
2. Start: `npm start`
3. Server listens on port 3000
4. All API routes available at `/api/*`
5. Static pages served from `.next/`
