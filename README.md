# SVN Commit Viewer

A modern web application for browsing and managing SVN repository commits with multi-select support and diff viewing capabilities.

## Features

- **Repository Management**: Select and manage multiple SVN repositories stored in a database
- **Commit History**: Browse commit history with detailed information (revision, author, date, message)
- **Advanced Filtering**: Filter commits by keyword and author
- **Multi-Select**: Select multiple commits simultaneously with persistent selection state
- **Diff Viewer**: View file changes and diffs with syntax highlighting
- **Responsive Design**: Mobile-friendly interface built with shadcn/ui components
- **Accessible**: Keyboard navigation and proper ARIA labels throughout

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite
- **Data Fetching**: SWR
- **Diff Viewing**: react-diff-viewer-continued
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
# Create .env file
cp .env.example .env

# Initialize Prisma
npx prisma generate
npx prisma db push

# Seed the database with sample repositories
npx tsx prisma/seed.ts
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

```
├── app/
│   ├── api/svn/          # API routes for SVN operations
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── commit-list.tsx   # Commit list with filtering
│   ├── commit-detail.tsx # Commit detail drawer with diffs
│   └── repository-selector.tsx
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── __tests__/            # Component tests
```

## API Endpoints

### GET /api/svn/repositories
Get all repositories from the database.

### POST /api/svn/repositories
Create a new repository.

### GET /api/svn/commits?repositoryId={id}&keyword={keyword}&author={author}
Get commits for a repository with optional filtering.

### GET /api/svn/diff?repositoryId={id}&revision={revision}
Get file diffs for a specific commit.

## Features in Detail

### Repository Selection
- Dropdown selector showing all available repositories from the database
- Each repository displays name and description
- Automatically selects the first repository on load

### Commit List
- Table view with revision, author, date, message, and file count
- Search by keyword (searches in message and file paths)
- Filter by author name
- Multi-select checkboxes for each commit
- Selection summary showing count of selected commits
- Click any row to view commit details

### Commit Details
- Side drawer showing full commit information
- Commit message display
- List of changed files
- Syntax-highlighted diffs for each file
- Color-coded change types (added, modified, deleted)

### Multi-Select Functionality
- Individual commit selection via checkboxes
- Select all/deselect all functionality
- Selection persists across filter changes
- Visual feedback for selected commits
- Selection summary displayed above the table

## Accessibility

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus states for all interactive elements
- Screen reader friendly

## Notes

This implementation uses mock data for commits and diffs. In a production environment, these would be replaced with actual SVN command executions or API calls to an SVN server.

## License

MIT
