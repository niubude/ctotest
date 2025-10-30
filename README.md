# SVN Code Review System - Database Schema

This project uses Prisma with SQLite to manage data persistence for an SVN repository code review system powered by AI.

## Overview

The database schema models SVN repositories, review rules, system prompts for AI, review sessions, and findings from code reviews. This enables comprehensive tracking of automated code reviews and their results.

## Database Schema

### Entity Relationship Diagram

```
SvnRepository (1) ──────< (N) ReviewSession
ReviewRule (1) ──────< (N) ReviewSession  
SystemPrompt (1) ──────< (N) ReviewSession
ReviewSession (1) ──────< (N) ReviewFinding
```

## Models

### SvnRepository

Represents an SVN repository configuration including connection details and authentication.

**Fields:**
- `id` (String, Primary Key): Unique identifier (CUID)
- `name` (String, Unique): Repository name for identification
- `url` (String): SVN repository URL
- `username` (String?, Optional): SVN authentication username
- `password` (String?, Optional): SVN authentication password (should be encrypted in production)
- `description` (String?, Optional): Repository description
- `isActive` (Boolean): Whether the repository is active for reviews (default: true)
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- One-to-many with `ReviewSession` (cascade delete)

**Indexes:**
- `name` (unique constraint + index for fast lookups)
- `isActive` (for filtering active repositories)

---

### ReviewRule

Defines review rules and criteria for code analysis. Rules can be customized per repository or applied globally.

**Fields:**
- `id` (String, Primary Key): Unique identifier (CUID)
- `name` (String, Unique): Rule name
- `description` (String?, Optional): Detailed rule description
- `ruleType` (String): Type of rule (e.g., "security", "performance", "style", "best-practice")
- `severity` (String): Default severity level - "low", "medium" (default), "high", "critical"
- `isEnabled` (Boolean): Whether the rule is active (default: true)
- `configuration` (String?, Optional): JSON string for rule-specific configuration
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- One-to-many with `ReviewSession` (set null on delete)

**Indexes:**
- `name` (unique constraint + index)
- `ruleType` (for filtering by rule category)
- `isEnabled` (for filtering active rules)

---

### SystemPrompt

Contains system prompts and templates for AI-powered code reviews. Different prompts can be used for different review focuses.

**Fields:**
- `id` (String, Primary Key): Unique identifier (CUID)
- `name` (String, Unique): Prompt name
- `promptText` (String): The actual prompt template/text sent to the AI
- `description` (String?, Optional): Description of the prompt's purpose
- `category` (String): Prompt category - "general" (default), "security", "performance", etc.
- `isActive` (Boolean): Whether the prompt is available for use (default: true)
- `version` (Int): Prompt version number (default: 1)
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- One-to-many with `ReviewSession` (set null on delete)

**Indexes:**
- `name` (unique constraint + index)
- `category` (for filtering by prompt type)
- `isActive` (for filtering active prompts)

---

### ReviewSession

Represents a single code review session for a repository. Captures the review execution and metadata.

**Fields:**
- `id` (String, Primary Key): Unique identifier (CUID)
- `repositoryId` (String, Foreign Key): Reference to SvnRepository
- `ruleId` (String?, Optional, Foreign Key): Reference to ReviewRule used
- `promptId` (String?, Optional, Foreign Key): Reference to SystemPrompt used
- `svnRevision` (String?, Optional): SVN revision number reviewed
- `status` (String): Session status - "pending" (default), "in-progress", "completed", "failed"
- `startedAt` (DateTime): When the review started (default: now)
- `completedAt` (DateTime?, Optional): When the review completed
- `aiModel` (String?, Optional): AI model used (e.g., "gpt-4", "claude-3")
- `totalFiles` (Int): Total number of files reviewed (default: 0)
- `totalFindings` (Int): Total number of findings generated (default: 0)
- `metadata` (String?, Optional): JSON string for additional session data
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- Many-to-one with `SvnRepository` (cascade delete - deletes all sessions if repo is deleted)
- Many-to-one with `ReviewRule` (set null on delete)
- Many-to-one with `SystemPrompt` (set null on delete)
- One-to-many with `ReviewFinding` (cascade delete)

**Indexes:**
- `repositoryId` (for efficient repository-based queries)
- `status` (for filtering by session status)
- `startedAt` (for chronological ordering)

---

### ReviewFinding

Individual findings, issues, or observations from a review session. Each finding represents a specific code issue or suggestion.

**Fields:**
- `id` (String, Primary Key): Unique identifier (CUID)
- `sessionId` (String, Foreign Key): Reference to ReviewSession
- `filePath` (String): Path to the file containing the finding
- `lineNumber` (Int?, Optional): Line number where the issue was found
- `severity` (String): Finding severity - "low", "medium" (default), "high", "critical"
- `category` (String): Issue category (e.g., "security", "performance", "bug", "style")
- `title` (String): Short title/summary of the finding
- `description` (String): Detailed description of the issue
- `suggestion` (String?, Optional): Recommended fix or improvement
- `codeSnippet` (String?, Optional): The problematic code excerpt
- `aiResponse` (String?, Optional): Full AI response for this finding
- `status` (String): Finding status - "open" (default), "acknowledged", "resolved", "ignored"
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relationships:**
- Many-to-one with `ReviewSession` (cascade delete - deletes all findings if session is deleted)

**Indexes:**
- `sessionId` (for efficient session-based queries)
- `severity` (for filtering by severity)
- `category` (for filtering by issue type)
- `status` (for filtering by resolution status)
- `filePath` (for finding all issues in a specific file)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# The .env file should already contain:
DATABASE_URL="file:./dev.db"
```

3. Run migrations to create the database:
```bash
npm run prisma:migrate
# or directly:
npx prisma migrate dev
```

4. Seed the database with sample data:
```bash
npm run prisma:seed
```

### Available Scripts

- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database with sample data
- `npm run prisma:studio` - Open Prisma Studio to view/edit data
- `npm run example` - Run usage examples demonstrating the schema

### Quick Start Example

See `examples/usage.ts` for a comprehensive example of how to use the Prisma schema. Run it with:

```bash
npm run example
```

This demonstrates:
- Creating repositories, rules, and prompts
- Starting a review session
- Recording findings
- Querying data with relationships
- Aggregating statistics

## Seed Data

The seed script (`prisma/seed.ts`) populates the database with:

### Sample Repositories
- **main-project**: Active repository with credentials
- **legacy-app**: Inactive repository for security audits

### Sample Review Rules
- **sql-injection-check**: Critical security rule for SQL injection detection
- **inefficient-loop-check**: Medium severity performance rule
- **naming-convention**: Low severity style rule

### Sample System Prompts
- **general-code-review**: Comprehensive code review prompt
- **security-focused-review**: Security audit focused prompt
- **performance-optimization**: Performance analysis prompt

### Sample Review Session
A completed review session with:
- 3 findings (1 critical SQL injection, 1 high severity hardcoded credentials, 1 medium N+1 query issue)
- Associated with main-project repository
- Uses security-focused review prompt

## Database Relationships and Cascade Behavior

### Cascade Delete
- When a `SvnRepository` is deleted → all associated `ReviewSession` records are deleted
- When a `ReviewSession` is deleted → all associated `ReviewFinding` records are deleted

### Set Null
- When a `ReviewRule` is deleted → associated `ReviewSession.ruleId` is set to null
- When a `SystemPrompt` is deleted → associated `ReviewSession.promptId` is set to null

This design ensures data integrity while allowing independent management of rules and prompts.

## Development

### Regenerate Prisma Client

After modifying the schema, regenerate the client:

```bash
npx prisma generate
```

### Create a New Migration

```bash
npx prisma migrate dev --name migration_name
```

### View Database with Prisma Studio

```bash
npm run prisma:studio
```

Opens a web interface at `http://localhost:5555` to browse and edit data.

## Production Considerations

1. **Security**:
   - Encrypt SVN credentials before storing in `SvnRepository.password`
   - Use environment variables for sensitive configuration
   - Implement proper authentication/authorization

2. **Performance**:
   - The schema includes indexes on commonly queried fields
   - Consider adding composite indexes for complex queries
   - Monitor query performance and add indexes as needed

3. **Database**:
   - For production, consider migrating from SQLite to PostgreSQL or MySQL
   - Update `schema.prisma` datasource provider accordingly
   - Adjust the `DATABASE_URL` environment variable

4. **Migrations**:
   - Test migrations thoroughly in staging before production
   - Backup database before running migrations
   - Use `prisma migrate deploy` for production deployments

## License

ISC
