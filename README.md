# AI Review Flow

An extensible AI-driven code review system that analyzes commits using OpenAI-compatible APIs and stores structured feedback in a database.

## Features

- 🤖 **Extensible AI Provider Architecture**: Interface-based design allows easy integration of multiple AI providers
- 🔌 **OpenAI Integration**: Built-in support for OpenAI and OpenAI-compatible APIs
- 📊 **Structured Review Storage**: Persist review sessions and findings in PostgreSQL via Prisma
- 🔒 **Rate Limiting**: Built-in request throttling to prevent abuse
- ⏱️ **Timeout Handling**: Configurable timeouts for AI requests
- 🧪 **Mock Provider**: Test without making real API calls
- ✅ **Comprehensive Testing**: Unit and integration tests with mocked dependencies
- 📝 **Customizable Rules**: Define and store review rules and system prompts in the database

## Architecture

### Provider Pattern

The system uses an adapter pattern for AI providers:

```
AIProvider (interface)
├── BaseAIProvider (abstract class)
│   ├── OpenAIProvider
│   ├── MockAIProvider
│   └── [Future providers...]
```

### Components

- **Providers** (`src/providers/`): AI provider implementations
- **Services** (`src/services/`): Business logic for reviews and SVN integration
- **Routes** (`src/routes/`): Express API endpoints
- **Utils** (`src/utils/`): Rate limiting, validation, etc.
- **Types** (`src/types/`): TypeScript type definitions

## Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- OpenAI API key (or compatible API endpoint)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-review-flow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

#### Database
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://user:password@localhost:5432/dbname?schema=public`

#### AI Provider Configuration
- `AI_PROVIDER`: Provider name (default: `openai`)
- `OPENAI_API_KEY`: Your OpenAI API key (required unless using mock)
- `OPENAI_API_BASE_URL`: API base URL (default: `https://api.openai.com/v1`)
- `OPENAI_MODEL`: Model to use (default: `gpt-4`)
- `USE_MOCK_AI`: Set to `true` to use mock provider (default: `false`)

#### Server Configuration
- `PORT`: Server port (default: `3000`)
- `NODE_ENV`: Environment (default: `development`)

#### Rate Limiting
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: `10`)
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: `60000`)

#### Timeouts
- `AI_REQUEST_TIMEOUT`: AI request timeout in milliseconds (default: `30000`)

## Usage

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

### API Endpoints

#### POST `/api/review`

Submit commits for AI review.

**Request Body:**
```json
{
  "commitIds": ["commit-1", "commit-2"]
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "session": {
    "id": "uuid",
    "commitIds": ["commit-1", "commit-2"],
    "aiProvider": "openai",
    "aiModel": "gpt-4",
    "status": "completed",
    "startedAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:00:30.000Z",
    "reviewFindings": [
      {
        "id": "uuid",
        "commitId": "commit-1",
        "severity": "medium",
        "category": "Code Quality",
        "title": "Potential issue found",
        "description": "Detailed description of the issue",
        "filePath": "src/file.ts",
        "lineNumber": 42,
        "suggestion": "How to fix the issue"
      }
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid input
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server or AI provider error

#### GET `/api/review/:sessionId`

Retrieve a review session by ID.

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "commitIds": ["commit-1"],
    "aiProvider": "openai",
    "aiModel": "gpt-4",
    "status": "completed",
    "reviewFindings": [...]
  }
}
```

#### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### Using the Mock Provider

For testing without making real API calls, set `USE_MOCK_AI=true` in your `.env` file:

```bash
USE_MOCK_AI=true
npm run dev
```

The mock provider simulates AI review logic by detecting common patterns:
- Large commits (>100 lines)
- Short commit messages (<10 characters)
- Console.log statements
- TODO/FIXME comments

## Database Schema

### ReviewRule
Stores review rules that guide the AI analysis.

```prisma
model ReviewRule {
  id          String   @id @default(uuid())
  name        String
  description String?
  rule        String
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### SystemPrompt
Stores system prompts for AI review context.

```prisma
model SystemPrompt {
  id        String   @id @default(uuid())
  name      String
  prompt    String
  isActive  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### ReviewSession
Tracks review sessions and metadata.

```prisma
model ReviewSession {
  id              String          @id @default(uuid())
  commitIds       String[]
  aiProvider      String
  aiModel         String
  status          String          @default("pending")
  startedAt       DateTime        @default(now())
  completedAt     DateTime?
  error           String?
  reviewFindings  ReviewFinding[]
}
```

### ReviewFinding
Stores individual findings from reviews.

```prisma
model ReviewFinding {
  id              String        @id @default(uuid())
  reviewSessionId String
  reviewSession   ReviewSession @relation(...)
  commitId        String
  severity        String
  category        String
  title           String
  description     String
  filePath        String?
  lineNumber      Int?
  suggestion      String?
  createdAt       DateTime      @default(now())
}
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Tests are automatically configured to use the mock AI provider and don't require real API keys or database connections.

### Test Coverage

The test suite includes:

- **Provider Tests**: Verify AI provider implementations
- **Service Tests**: Test review service logic with mocked dependencies
- **Rate Limiter Tests**: Validate rate limiting behavior
- **Validation Tests**: Ensure input validation works correctly

## Adding a New AI Provider

To add support for a new AI provider:

1. Create a new provider class extending `BaseAIProvider`:

```typescript
import { BaseAIProvider } from './AIProvider';
import { ReviewRequest, ReviewResponse } from '../types';

export class CustomAIProvider extends BaseAIProvider {
  constructor(config: AIProviderConfig) {
    super();
    // Initialize your provider
  }

  getName(): string {
    return 'custom';
  }

  async generateReview(request: ReviewRequest): Promise<ReviewResponse> {
    // Implement your provider logic
    const prompt = this.buildPrompt(request);
    
    // Make API call to your provider
    const response = await yourApiCall(prompt);
    
    // Parse and return response
    return this.parseResponse(response);
  }
}
```

2. Register the provider in `src/providers/index.ts`:

```typescript
case 'custom':
  return new CustomAIProvider(config);
```

3. Add configuration in `.env`:

```bash
AI_PROVIDER=custom
CUSTOM_API_KEY=your_key_here
```

## Development

### Project Structure

```
ai-review-flow/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── __tests__/          # Test files
│   ├── config/             # Configuration
│   ├── providers/          # AI provider implementations
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── types/              # Type definitions
│   ├── utils/              # Utilities
│   └── index.ts            # Application entry point
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run lint`: Lint code
- `npm run format`: Format code with Prettier
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:studio`: Open Prisma Studio

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Invalid input returns 400 with details
- **Rate Limiting**: Exceeded limits return 429 with retry time
- **AI Provider Errors**: API failures return 500 with error message
- **Timeout Errors**: Long-running requests are aborted with timeout error
- **Database Errors**: Session status is updated to 'failed' with error details

## Rate Limiting

Rate limiting is applied per client IP address:

- Default: 10 requests per 60 seconds
- Configurable via environment variables
- Automatic cleanup of expired entries
- Returns retry time in error response

## Security Considerations

- API keys stored in environment variables (never committed)
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Timeout protection against hanging requests
- SQL injection protection via Prisma ORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
