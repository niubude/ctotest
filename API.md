# API Documentation

## Base URL

```
http://localhost:3000
```

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200 OK`: Service is healthy

---

### Create Review

Submit commits for AI-powered code review.

**Endpoint:** `POST /api/review`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "commitIds": ["abc123", "def456", "ghi789"]
}
```

**Parameters:**
- `commitIds` (required): Array of commit IDs to review
  - Minimum: 1 commit
  - Maximum: 50 commits
  - Each ID must be a non-empty string

**Success Response (200 OK):**
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "commitIds": ["abc123", "def456", "ghi789"],
    "aiProvider": "openai",
    "aiModel": "gpt-4",
    "status": "completed",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": "2024-01-15T10:30:45.000Z",
    "error": null,
    "reviewFindings": [
      {
        "id": "finding-uuid-1",
        "commitId": "abc123",
        "severity": "high",
        "category": "Security",
        "title": "Potential SQL Injection Vulnerability",
        "description": "The query construction in this commit uses string concatenation which could lead to SQL injection attacks.",
        "filePath": "src/database/queries.ts",
        "lineNumber": 42,
        "suggestion": "Use parameterized queries or an ORM with proper escaping to prevent SQL injection.",
        "createdAt": "2024-01-15T10:30:45.000Z"
      },
      {
        "id": "finding-uuid-2",
        "commitId": "def456",
        "severity": "medium",
        "category": "Code Quality",
        "title": "High Cyclomatic Complexity",
        "description": "This function has multiple nested conditionals making it difficult to test and maintain.",
        "filePath": "src/services/processor.ts",
        "lineNumber": 123,
        "suggestion": "Consider breaking this function into smaller, single-purpose functions.",
        "createdAt": "2024-01-15T10:30:45.000Z"
      },
      {
        "id": "finding-uuid-3",
        "commitId": "ghi789",
        "severity": "low",
        "category": "Documentation",
        "title": "Missing JSDoc Comments",
        "description": "This exported function lacks documentation.",
        "filePath": "src/utils/helpers.ts",
        "lineNumber": 15,
        "suggestion": "Add JSDoc comments explaining parameters, return value, and purpose.",
        "createdAt": "2024-01-15T10:30:45.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid input:
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "array",
      "inclusive": true,
      "message": "Array must contain at least 1 element(s)",
      "path": ["commitIds"]
    }
  ]
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again after 2024-01-15T10:31:00.000Z",
  "resetTime": "2024-01-15T10:31:00.000Z"
}
```

**500 Internal Server Error** - Server or AI provider error:
```json
{
  "error": "Internal server error",
  "message": "AI request timed out"
}
```

**Status Codes:**
- `200 OK`: Review completed successfully
- `400 Bad Request`: Invalid request parameters
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server or AI provider error

---

### Get Review Session

Retrieve details of a completed or in-progress review session.

**Endpoint:** `GET /api/review/:sessionId`

**URL Parameters:**
- `sessionId` (required): UUID of the review session

**Example:**
```
GET /api/review/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "commitIds": ["abc123"],
    "aiProvider": "openai",
    "aiModel": "gpt-4",
    "status": "completed",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": "2024-01-15T10:30:45.000Z",
    "error": null,
    "reviewFindings": [
      {
        "id": "finding-uuid-1",
        "reviewSessionId": "550e8400-e29b-41d4-a716-446655440000",
        "commitId": "abc123",
        "severity": "info",
        "category": "General",
        "title": "Clean Code",
        "description": "No issues found in this commit.",
        "filePath": null,
        "lineNumber": null,
        "suggestion": "Keep up the good work!",
        "createdAt": "2024-01-15T10:30:45.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**404 Not Found** - Session doesn't exist:
```json
{
  "error": "Not found",
  "message": "Review session not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

**Status Codes:**
- `200 OK`: Session found and returned
- `404 Not Found`: Session ID doesn't exist
- `500 Internal Server Error`: Server error

---

## Data Models

### Review Session

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique session identifier |
| `commitIds` | string[] | Array of commit IDs reviewed |
| `aiProvider` | string | Name of AI provider used |
| `aiModel` | string | Model/version identifier |
| `status` | string | Session status: `pending`, `in_progress`, `completed`, `failed` |
| `startedAt` | string (ISO 8601) | When the review started |
| `completedAt` | string (ISO 8601) \| null | When the review completed |
| `error` | string \| null | Error message if failed |
| `reviewFindings` | ReviewFinding[] | Array of findings |

### Review Finding

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique finding identifier |
| `reviewSessionId` | string (UUID) | Parent session ID |
| `commitId` | string | Commit this finding relates to |
| `severity` | string | Severity level: `critical`, `high`, `medium`, `low`, `info` |
| `category` | string | Finding category (e.g., "Security", "Performance") |
| `title` | string | Brief title/summary |
| `description` | string | Detailed description |
| `filePath` | string \| null | File path if applicable |
| `lineNumber` | number \| null | Line number if applicable |
| `suggestion` | string \| null | Suggested fix/improvement |
| `createdAt` | string (ISO 8601) | When the finding was created |

### Severity Levels

- `critical`: Security vulnerabilities, data loss risks
- `high`: Bugs, potential crashes, major issues
- `medium`: Code quality issues, tech debt
- `low`: Minor improvements, style issues
- `info`: Suggestions, best practices

---

## Rate Limiting

The API implements rate limiting per client IP address:

- **Default Limit**: 10 requests per 60 seconds
- **Headers**: Currently not exposed (future enhancement)
- **Retry**: Wait until `resetTime` in error response

**Example Rate Limit Error:**
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again after 2024-01-15T10:31:00.000Z",
  "resetTime": "2024-01-15T10:31:00.000Z"
}
```

---

## Examples

### cURL Examples

**Create a review:**
```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{"commitIds": ["abc123", "def456"]}'
```

**Get a review session:**
```bash
curl http://localhost:3000/api/review/550e8400-e29b-41d4-a716-446655440000
```

**Health check:**
```bash
curl http://localhost:3000/health
```

### JavaScript/TypeScript Examples

**Using fetch:**
```typescript
// Create review
const response = await fetch('http://localhost:3000/api/review', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    commitIds: ['abc123', 'def456'],
  }),
});

const data = await response.json();
console.log('Session ID:', data.sessionId);

// Get review session
const session = await fetch(
  `http://localhost:3000/api/review/${data.sessionId}`
);
const sessionData = await session.json();
console.log('Findings:', sessionData.session.reviewFindings);
```

**Using axios:**
```typescript
import axios from 'axios';

// Create review
const { data } = await axios.post('http://localhost:3000/api/review', {
  commitIds: ['abc123', 'def456'],
});

console.log('Session ID:', data.sessionId);

// Get review session
const session = await axios.get(
  `http://localhost:3000/api/review/${data.sessionId}`
);
console.log('Findings:', session.data.session.reviewFindings);
```

### Python Example

```python
import requests

# Create review
response = requests.post(
    'http://localhost:3000/api/review',
    json={'commitIds': ['abc123', 'def456']}
)

data = response.json()
session_id = data['sessionId']
print(f'Session ID: {session_id}')

# Get review session
session = requests.get(f'http://localhost:3000/api/review/{session_id}')
findings = session.json()['session']['reviewFindings']
print(f'Found {len(findings)} issues')
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {} // Optional, additional context
}
```

### Common Error Types

- `Validation error`: Input validation failed
- `Too many requests`: Rate limit exceeded
- `Not found`: Resource doesn't exist
- `Internal server error`: Server-side error
- `AI request timed out`: AI provider timeout
- `OpenAI API error`: AI provider returned error

---

## Best Practices

1. **Batch Commits**: Review multiple related commits together for context
2. **Handle Rate Limits**: Implement exponential backoff for retries
3. **Check Status**: Poll the session endpoint for long-running reviews
4. **Error Handling**: Always handle potential timeouts and errors
5. **Commit Limits**: Keep batch sizes reasonable (< 20 commits for best results)
