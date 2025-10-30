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
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npx prisma studio` - Open Prisma Studio to view and edit your database
- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply database migrations

## Project Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── config/             # Configuration pages
│   │   │   ├── repositories/   # Repository configuration
│   │   │   ├── rules/          # Review rules configuration
│   │   │   ├── prompts/        # System prompts configuration
│   │   │   └── history/        # Review history
│   │   ├── repositories/       # Repository management pages
│   │   ├── reviews/            # Code review pages
│   │   ├── settings/           # Settings pages
│   │   ├── layout.tsx          # Root layout with navigation
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── actions/                # Server actions
│   │   ├── repositories.ts     # Repository CRUD operations
│   │   ├── rules.ts            # Review rules operations
│   │   ├── prompts.ts          # System prompts operations
│   │   └── reviews.ts          # Review history operations
│   ├── components/             # React components
│   │   ├── repositories/       # Repository components
│   │   ├── rules/              # Review rules components
│   │   ├── prompts/            # System prompts components
│   │   ├── reviews/            # Review history components
│   │   ├── ui/                 # shadcn UI components
│   │   └── header.tsx          # Navigation header
│   └── lib/                    # Utility functions and configurations
│       ├── utils.ts            # Helper utilities
│       └── prisma.ts           # Prisma client instance
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── __tests__/                  # Test files
│   └── actions/                # Server action tests
├── public/                     # Static assets
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment variables
└── package.json                # Project dependencies
```

## Features

### Current

- ✅ Next.js 16 with App Router and TypeScript
- ✅ shadcn UI components with Tailwind CSS
- ✅ Prisma ORM with SQLite database
- ✅ Global navigation with header
- ✅ **Configuration UI**
  - ✅ SVN Repository Management (CRUD with secure password storage)
  - ✅ Review Rules Configuration (create, edit, enable/disable)
  - ✅ System Prompts Management (versioning, active prompt selection)
  - ✅ Review History Viewer (view past reviews and findings)
- ✅ Form validation with Zod and React Hook Form
- ✅ Toast notifications for user feedback
- ✅ Optimistic UI updates
- ✅ Server actions for data operations
- ✅ Unit tests for server actions
- ✅ Environment variable configuration

### Planned

- 🔄 SVN repository integration
- 🔄 Commit browsing and selection
- 🔄 AI-powered code review generation
- 🔄 User authentication
- 🔄 Role-based access control

## Database Schema

The database schema includes:

- **SvnRepository**: SVN repository configurations with authentication (passwords hashed with bcrypt)
- **ReviewRule**: Code review rules with type, severity, and configuration
- **SystemPrompt**: AI prompts for code review (versioned, with active flag)
- **ReviewSession**: Historical review sessions with metadata
- **ReviewFinding**: Individual findings from review sessions

To view the current schema:

```bash
cat prisma/schema.prisma
```

To open Prisma Studio to view/edit data:

```bash
npx prisma studio
```

## Using the Configuration UI

### Managing SVN Repositories

1. Navigate to **Configuration → SVN Repositories**
2. Click **Add Repository** to create a new repository configuration
3. Fill in the required fields:
   - **Name**: A unique identifier for the repository
   - **URL**: The SVN repository URL
   - **Username**: (Optional) SVN username
   - **Password**: (Optional) SVN password - will be hashed and stored securely
   - **Description**: (Optional) Description of the repository
   - **Active**: Toggle to enable/disable the repository
4. Click **Create** to save

**Note**: Passwords are hashed using bcrypt before storage and never displayed in plain text.

### Configuring Review Rules

1. Navigate to **Configuration → Review Rules**
2. Click **Add Rule** to create a new review rule
3. Configure the rule:
   - **Name**: Unique name for the rule
   - **Description**: What the rule checks for
   - **Rule Type**: Category (e.g., security, performance, style)
   - **Severity**: Low, Medium, High, or Critical
   - **Configuration**: (Optional) JSON configuration for rule-specific settings
   - **Enabled**: Toggle to enable/disable the rule
4. Click **Create** to save

Rules can be enabled/disabled using the toggle switches in the list view.

### Managing System Prompts

1. Navigate to **Configuration → System Prompts**
2. Click **Add Prompt** to create a new system prompt
3. Configure the prompt:
   - **Name**: Unique identifier for the prompt
   - **Description**: Purpose of the prompt
   - **Category**: Classification (e.g., general, security, performance)
   - **Prompt Text**: The actual prompt text to send to the AI
   - **Set as Active**: Only one prompt can be active at a time
4. Click **Create** to save

**Note**: The version number auto-increments when prompt text changes. Only one prompt can be active at a time.

### Viewing Review History

1. Navigate to **Configuration → Review History**
2. View all past review sessions with:
   - Date and time
   - Repository name
   - SVN revision
   - Status (pending, in-progress, completed, failed)
   - Number of files reviewed
   - Number of findings
   - Duration
3. Click the expand button (chevron) to see detailed session information including:
   - Session ID
   - AI model used
   - Associated rule and prompt
   - Additional metadata

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
