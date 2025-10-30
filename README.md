# SVN Code Review Tool

An AI-powered code review tool for SVN repositories built with Next.js, shadcn UI, Prisma, and SQLite.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: SQLite with Prisma ORM
- **Package Manager**: npm

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Edit `.env` and configure:

- `DATABASE_URL`: SQLite database file location (default: `file:./dev.db`)
- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered code reviews

### 4. Set up the database

Generate the Prisma client:

```bash
npx prisma generate
```

Create the database and run migrations:

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npx prisma studio` - Open Prisma Studio to view and edit your database
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to the database

## Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── repositories/       # Repository management pages
│   │   ├── reviews/            # Code review pages
│   │   ├── settings/           # Settings pages
│   │   ├── layout.tsx          # Root layout with navigation
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn UI components
│   │   └── header.tsx          # Navigation header
│   └── lib/                    # Utility functions and configurations
│       ├── utils.ts            # Helper utilities
│       └── prisma.ts           # Prisma client instance
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment variables
└── package.json                # Project dependencies
```

## Features

### Current (Bootstrap Phase)

- ✅ Next.js 16 with App Router and TypeScript
- ✅ shadcn UI components with Tailwind CSS
- ✅ Prisma ORM with SQLite database
- ✅ Global navigation with header
- ✅ Placeholder pages for repositories, reviews, and settings
- ✅ Environment variable configuration

### Planned

- 🔄 SVN repository integration
- 🔄 Commit browsing and selection
- 🔄 AI-powered code review generation
- 🔄 Review history and management
- 🔄 User authentication
- 🔄 Multi-repository support

## Database Schema

The initial database schema includes a placeholder `Example` model. This will be expanded as features are developed to include:

- Repositories
- Commits
- Reviews
- Users
- Settings

To view the current schema:

```bash
cat prisma/schema.prisma
```

## Development

### Adding shadcn UI Components

To add more shadcn UI components:

```bash
npx shadcn@latest add <component-name>
```

For example:
```bash
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add form
```

### Database Migrations

When you modify the Prisma schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Run `npx prisma generate` to update the Prisma Client

For production environments, use proper migrations:

```bash
npx prisma migrate dev --name describe_your_changes
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | SQLite database file path | Yes | `file:./dev.db` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes (for AI features) | - |
| `NODE_ENV` | Environment (development/production) | No | `development` |

## Contributing

This is a bootstrapped project ready for feature development. Key areas for contribution:

1. SVN integration and repository management
2. Code review generation with OpenAI
3. User authentication and authorization
4. Advanced UI components and features
5. Testing and documentation

## License

[Add your license here]

## Support

For questions and support, please [open an issue](link-to-issues) or contact the development team.
