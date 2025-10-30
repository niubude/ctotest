# API Documentation

This document provides detailed information about the SVN Service API endpoints.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication at the API level. SVN repository authentication is handled via environment variables.

## Content Type

All requests and responses use `application/json` content type.

## Endpoints

### 1. Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Get Repository Info

Retrieve information about the connected SVN repository.

**Endpoint:** `GET /api/svn/info`

**Response:** `200 OK`
```json
{
  "url": "https://svn.example.com/repo",
  "uuid": "12345678-1234-1234-1234-123456789abc",
  "revision": 500
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication failed
- `503 Service Unavailable` - SVN connection failed
- `504 Gateway Timeout` - SVN operation timed out

---

### 3. List Commits

Retrieve a paginated list of commits with optional filtering.

**Endpoint:** `GET /api/svn/commits`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number (starts at 1) |
| pageSize | integer | No | 20 | Number of items per page (max: 100) |
| keyword | string | No | - | Filter by keyword in commit message or author |
| author | string | No | - | Filter by exact author name |
| startRevision | integer | No | - | Start revision for range filter |
| endRevision | integer | No | - | End revision for range filter |

**Example Request:**
```bash
GET /api/svn/commits?page=1&pageSize=10&keyword=bug&author=john.doe
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "revision": 123,
      "author": "john.doe",
      "date": "2024-01-15T10:30:00.000Z",
      "message": "Fix authentication bug"
    },
    {
      "revision": 120,
      "author": "john.doe",
      "date": "2024-01-14T09:20:00.000Z",
      "message": "Fix bug in user service"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Authentication failed
- `503 Service Unavailable` - SVN connection failed
- `504 Gateway Timeout` - SVN operation timed out

---

### 4. Get Commit Detail

Retrieve detailed information about a specific commit, including all changed files.

**Endpoint:** `GET /api/svn/commits/:revision`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| revision | integer | Yes | Commit revision number |

**Example Request:**
```bash
GET /api/svn/commits/123
```

**Response:** `200 OK`
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
    },
    {
      "path": "/trunk/src/deleted.ts",
      "action": "D"
    }
  ]
}
```

**File Actions:**
- `A` - Added
- `M` - Modified
- `D` - Deleted
- `R` - Replaced

**Error Responses:**
- `400 Bad Request` - Invalid revision parameter
- `404 Not Found` - Commit not found
- `401 Unauthorized` - Authentication failed
- `503 Service Unavailable` - SVN connection failed
- `504 Gateway Timeout` - SVN operation timed out

---

### 5. Get Commit Diff

Retrieve the diff content for a specific commit.

**Endpoint:** `GET /api/svn/commits/:revision/diff`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| revision | integer | Yes | Commit revision number |

**Example Request:**
```bash
GET /api/svn/commits/123/diff
```

**Response:** `200 OK`
```json
{
  "revision": 123,
  "diffs": [
    {
      "path": "/trunk/src/auth.ts",
      "diff": "Index: /trunk/src/auth.ts\n===================================================================\n--- /trunk/src/auth.ts\t(revision 122)\n+++ /trunk/src/auth.ts\t(revision 123)\n@@ -10,7 +10,7 @@\n function authenticate() {\n-  return false;\n+  return true;\n }\n"
    },
    {
      "path": "/trunk/src/newfile.ts",
      "diff": "Index: /trunk/src/newfile.ts\n===================================================================\n--- /trunk/src/newfile.ts\t(revision 0)\n+++ /trunk/src/newfile.ts\t(revision 123)\n@@ -0,0 +1,5 @@\n+export function newFunction() {\n+  console.log('New function');\n+  return true;\n+}\n"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid revision parameter
- `404 Not Found` - Commit not found
- `401 Unauthorized` - Authentication failed
- `503 Service Unavailable` - SVN connection failed
- `504 Gateway Timeout` - SVN operation timed out

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SVN_AUTHENTICATION_ERROR` | 401 | SVN repository authentication failed |
| `SVN_NOT_FOUND` | 404 | Requested resource not found in SVN |
| `COMMIT_NOT_FOUND` | 500 | Specific commit not found |
| `VALIDATION_ERROR` | 400 | Request validation failed (invalid parameters) |
| `SVN_CONNECTION_ERROR` | 503 | Failed to connect to SVN repository |
| `SVN_TIMEOUT_ERROR` | 504 | SVN operation exceeded timeout |
| `SVN_ERROR` | 500 | General SVN error |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `NOT_FOUND` | 404 | API endpoint not found |

### Example Error Response

```json
{
  "error": {
    "message": "SVN authentication failed",
    "code": "SVN_AUTHENTICATION_ERROR",
    "details": {
      "originalError": "Authorization failed"
    }
  }
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

---

## Pagination

For endpoints that support pagination:

- `page`: Page number (starts at 1)
- `pageSize`: Items per page (default: 20, max: 100)

The response includes a `pagination` object:

```json
{
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

---

## Filtering

### Keyword Filter

The `keyword` parameter performs a case-insensitive search in:
- Commit message
- Author name

### Author Filter

The `author` parameter performs an exact match (case-insensitive) on the author name.

### Revision Range Filter

Use `startRevision` and `endRevision` together to filter commits within a specific revision range.

---

## Examples

### Using curl

**Get repository info:**
```bash
curl http://localhost:3000/api/svn/info
```

**List commits with filters:**
```bash
curl "http://localhost:3000/api/svn/commits?keyword=bug&page=1&pageSize=10"
```

**Get commit detail:**
```bash
curl http://localhost:3000/api/svn/commits/123
```

**Get commit diff:**
```bash
curl http://localhost:3000/api/svn/commits/123/diff
```

### Using JavaScript/Fetch

```javascript
// Get commits
const response = await fetch('http://localhost:3000/api/svn/commits?page=1&pageSize=20');
const data = await response.json();

// Get commit detail
const detailResponse = await fetch('http://localhost:3000/api/svn/commits/123');
const commit = await detailResponse.json();

// Get commit diff
const diffResponse = await fetch('http://localhost:3000/api/svn/commits/123/diff');
const diff = await diffResponse.json();
```

### Using Python/Requests

```python
import requests

# Get commits
response = requests.get('http://localhost:3000/api/svn/commits', params={
    'page': 1,
    'pageSize': 20,
    'keyword': 'bug'
})
data = response.json()

# Get commit detail
response = requests.get('http://localhost:3000/api/svn/commits/123')
commit = response.json()

# Get commit diff
response = requests.get('http://localhost:3000/api/svn/commits/123/diff')
diff = response.json()
```

---

## Best Practices

1. **Pagination**: Always use reasonable page sizes to avoid performance issues
2. **Error Handling**: Check HTTP status codes and handle errors appropriately
3. **Timeouts**: Set appropriate timeouts for long-running operations
4. **Caching**: Consider caching responses for frequently accessed data
5. **Filtering**: Use specific filters to reduce data transfer and improve performance
