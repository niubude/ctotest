# SVN Service API

Backend integration with SVN to retrieve commits, filter, and expose API endpoints for frontend consumption.

## Features

- **SVN Integration**: Connect to SVN repositories and fetch commit history
- **Filtering**: Filter commits by keyword, author, and revision range
- **Pagination**: Support for paginated results
- **Commit Details**: Retrieve detailed information about specific commits including file changes
- **Diff Support**: Get diff content for commits
- **Error Handling**: Robust error handling with structured API responses
- **Type Safety**: Full TypeScript support
- **Testing**: Comprehensive unit and integration tests

## Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- Access to an SVN repository
- SVN command-line tools installed on the system

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development

SVN_REPO_URL=https://svn.example.com/repo
SVN_USERNAME=your-username
SVN_PASSWORD=your-password

DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

LOG_LEVEL=info
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment (development, production, test) |
| `SVN_REPO_URL` | Yes | - | SVN repository URL |
| `SVN_USERNAME` | No | - | SVN username for authentication |
| `SVN_PASSWORD` | No | - | SVN password for authentication |
| `SVN_TIMEOUT` | No | 30000 | Timeout for SVN operations (ms) |
| `DEFAULT_PAGE_SIZE` | No | 20 | Default number of items per page |
| `MAX_PAGE_SIZE` | No | 100 | Maximum number of items per page |
| `LOG_LEVEL` | No | info | Logging level (error, warn, info, debug) |

## Usage

### Development

Start the development server with hot reload:
```bash
npm run dev
```

### Production

Build and start the production server:
```bash
npm run build
npm start
```

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Repository Info

```
GET /api/svn/info
```

Returns information about the connected SVN repository.

**Response:**
```json
{
  "url": "https://svn.example.com/repo",
  "uuid": "12345678-1234-1234-1234-123456789abc",
  "revision": 500
}
```

### List Commits

```
GET /api/svn/commits
```

Returns a paginated list of commits with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 20, max: 100)
- `keyword` (string, optional): Filter by keyword in message or author
- `author` (string, optional): Filter by exact author name
- `startRevision` (number, optional): Start revision for range filter
- `endRevision` (number, optional): End revision for range filter

**Response:**
```json
{
  "data": [
    {
      "revision": 123,
      "author": "john.doe",
      "date": "2024-01-15T10:30:00.000Z",
      "message": "Fix authentication bug"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/svn/commits?keyword=bug&author=john.doe&page=1&pageSize=10"
```

### Get Commit Detail

```
GET /api/svn/commits/:revision
```

Returns detailed information about a specific commit, including changed files.

**Path Parameters:**
- `revision` (number): Commit revision number

**Response:**
```json
{
  "revision": 123,
  "author": "john.doe",
  "date": "2024-01-15T10:30:00.000Z",
  "message": "Fix authentication bug",
  "changedFiles": [
    {
      "path": "/trunk/src/auth.ts",
      "action": "M"
    },
    {
      "path": "/trunk/src/newfile.ts",
      "action": "A",
      "copyFromPath": "/trunk/src/oldfile.ts",
      "copyFromRevision": 120
    }
  ]
}
```

**File Actions:**
- `A`: Added
- `M`: Modified
- `D`: Deleted
- `R`: Replaced

**Example:**
```bash
curl "http://localhost:3000/api/svn/commits/123"
```

### Get Commit Diff

```
GET /api/svn/commits/:revision/diff
```

Returns the diff content for a specific commit.

**Path Parameters:**
- `revision` (number): Commit revision number

**Response:**
```json
{
  "revision": 123,
  "diffs": [
    {
      "path": "/trunk/src/auth.ts",
      "diff": "Index: /trunk/src/auth.ts\n===================================================================\n--- /trunk/src/auth.ts\t(revision 122)\n+++ /trunk/src/auth.ts\t(revision 123)\n@@ -10,7 +10,7 @@\n function authenticate() {\n-  return false;\n+  return true;\n }"
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/svn/commits/123/diff"
```

## Error Responses

All errors follow a consistent structure:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SVN_AUTHENTICATION_ERROR` | 401 | SVN authentication failed |
| `SVN_NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `SVN_CONNECTION_ERROR` | 503 | SVN connection failed |
| `SVN_TIMEOUT_ERROR` | 504 | SVN operation timed out |
| `SVN_ERROR` | 500 | General SVN error |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `NOT_FOUND` | 404 | API route not found |

## Project Structure

```
.
├── src/
│   ├── api/
│   │   ├── middleware/
│   │   │   └── errorHandler.ts      # Error handling middleware
│   │   ├── routes/
│   │   │   ├── __tests__/
│   │   │   │   └── svn.test.ts     # API route tests
│   │   │   └── svn.ts              # SVN API routes
│   │   └── validation.ts            # Request validation schemas
│   ├── config/
│   │   └── index.ts                 # Configuration management
│   ├── lib/
│   │   ├── svn/
│   │   │   ├── __tests__/
│   │   │   │   └── service.test.ts # Service layer tests
│   │   │   ├── client.ts           # SVN client wrapper
│   │   │   ├── service.ts          # SVN service layer
│   │   │   └── index.ts
│   │   ├── errors.ts                # Custom error classes
│   │   └── logger.ts                # Winston logger configuration
│   ├── types/
│   │   └── svn.ts                   # TypeScript type definitions
│   ├── app.ts                       # Express app setup
│   └── index.ts                     # Application entry point
├── .env.example                     # Example environment variables
├── .eslintrc.json                   # ESLint configuration
├── .gitignore
├── package.json
├── tsconfig.json                    # TypeScript configuration
├── vitest.config.ts                 # Vitest configuration
└── README.md
```

## Architecture

### Layers

1. **API Layer** (`src/api/`): Express routes and middleware
2. **Service Layer** (`src/lib/svn/service.ts`): Business logic for SVN operations
3. **Client Layer** (`src/lib/svn/client.ts`): Low-level SVN client wrapper
4. **Configuration** (`src/config/`): Environment and application configuration
5. **Types** (`src/types/`): TypeScript type definitions

### Key Components

- **SvnClient**: Wraps `node-svn-ultimate` library, handles authentication, timeouts, and error transformation
- **SvnService**: Implements business logic for fetching commits, filtering, pagination, and parsing SVN responses
- **API Routes**: RESTful endpoints that validate requests and call service layer
- **Error Handler**: Centralized error handling that transforms exceptions into structured API responses
- **Logger**: Winston-based logging for debugging and monitoring

## Security Considerations

1. **Credentials**: Store SVN credentials securely in environment variables, never commit to version control
2. **Authentication**: Support for username/password authentication
3. **Input Validation**: All API inputs are validated using Zod schemas
4. **Error Messages**: Error responses don't expose sensitive information

## Performance

- **Timeouts**: Configurable timeout for SVN operations (default: 30s)
- **Pagination**: Prevents fetching large datasets at once
- **Logging**: Structured logging for monitoring and debugging

## Troubleshooting

### SVN Connection Issues

If you encounter connection issues:

1. Verify SVN command-line tools are installed:
   ```bash
   svn --version
   ```

2. Test SVN access manually:
   ```bash
   svn info https://svn.example.com/repo --username your-user --password your-pass
   ```

3. Check firewall and network settings

### Authentication Errors

- Verify credentials are correct in `.env` file
- Ensure the user has appropriate permissions on the repository

### Timeout Errors

- Increase `SVN_TIMEOUT` in environment variables
- Check network latency to SVN server

## Testing Strategy

The project includes comprehensive tests:

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test API endpoints with mocked SVN client
3. **Error Handling Tests**: Verify all error paths and edge cases
4. **Validation Tests**: Ensure request validation works correctly

## Contributing

1. Follow existing code style and patterns
2. Write tests for new features
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## License

MIT
