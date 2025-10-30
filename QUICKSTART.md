# Quick Start Guide

Get up and running with AI Review Flow in minutes!

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for database)
- OpenAI API key (optional, can use mock mode)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ai-review-flow

# Install dependencies
npm install
```

## Step 2: Set Up Database

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Your database is now running at localhost:5432
```

### Option B: Using Existing PostgreSQL

Make sure PostgreSQL is running and you have connection details.

## Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

### Minimal Configuration (Mock Mode)

For testing without a real AI API:

```env
DATABASE_URL="postgresql://aireviewer:aireviewer_password@localhost:5432/ai_review_db?schema=public"
USE_MOCK_AI=true
PORT=3000
```

### Production Configuration (OpenAI)

For real AI reviews:

```env
DATABASE_URL="postgresql://aireviewer:aireviewer_password@localhost:5432/ai_review_db?schema=public"
USE_MOCK_AI=false
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
PORT=3000
```

## Step 4: Set Up Database Schema

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

## Step 5: Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start at `http://localhost:3000`

## Step 6: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status": "ok"}
```

### Create a Review

```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{"commitIds": ["commit-1", "commit-2"]}'
```

Example response:
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "reviewFindings": [
      {
        "severity": "low",
        "category": "Code Quality",
        "title": "Debug statement detected",
        "description": "Found console.log statement...",
        "suggestion": "Use a proper logging library..."
      }
    ]
  }
}
```

### Get Review Results

```bash
curl http://localhost:3000/api/review/{sessionId}
```

Replace `{sessionId}` with the ID from the previous response.

## Common Use Cases

### Running Tests

```bash
# Run all tests (uses mock AI automatically)
npm test

# Run tests in watch mode
npm run test:watch
```

### Viewing Database

```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio
```

Browse to `http://localhost:5555`

### Checking Logs

```bash
# Development logs are shown in console
npm run dev

# For production, redirect output
npm start > app.log 2>&1
```

## Troubleshooting

### "Cannot connect to database"

**Solution**: Make sure PostgreSQL is running and DATABASE_URL is correct.

```bash
# Check if Docker container is running
docker ps | grep ai-review-db

# Restart if needed
docker-compose restart
```

### "OPENAI_API_KEY is required"

**Solution**: Either set the API key or use mock mode:

```env
USE_MOCK_AI=true
```

### "Port 3000 is already in use"

**Solution**: Change the port in .env:

```env
PORT=3001
```

### Tests Failing

**Solution**: Tests are configured to use mock mode automatically. If failing:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm test
```

### Database Migration Errors

**Solution**: Reset the database:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate
npm run prisma:seed
```

## Next Steps

- Read the [API Documentation](API.md) for detailed endpoint information
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review [README.md](README.md) for architecture details
- Add custom review rules in Prisma Studio
- Customize system prompts for your needs

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm test                    # Run tests
npm run lint               # Check code quality

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open database GUI

# Production
npm run build              # Build for production
npm start                  # Start production server

# Docker
docker-compose up -d       # Start database
docker-compose down        # Stop database
docker-compose logs -f     # View logs
```

## Example Integration

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function reviewCommits(commitIds: string[]) {
  try {
    const response = await axios.post(`${API_URL}/review`, {
      commitIds
    });
    
    console.log('Review completed!');
    console.log(`Session ID: ${response.data.sessionId}`);
    console.log(`Findings: ${response.data.session.reviewFindings.length}`);
    
    return response.data;
  } catch (error) {
    console.error('Review failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
reviewCommits(['abc123', 'def456'])
  .then(result => console.log('Success:', result))
  .catch(err => console.error('Error:', err));
```

### Python

```python
import requests

API_URL = 'http://localhost:3000/api'

def review_commits(commit_ids):
    try:
        response = requests.post(
            f'{API_URL}/review',
            json={'commitIds': commit_ids}
        )
        response.raise_for_status()
        
        data = response.json()
        print(f"Review completed!")
        print(f"Session ID: {data['sessionId']}")
        print(f"Findings: {len(data['session']['reviewFindings'])}")
        
        return data
    except requests.exceptions.RequestException as e:
        print(f"Review failed: {e}")
        raise

# Usage
result = review_commits(['abc123', 'def456'])
```

## Support

For issues or questions:
- Check existing [GitHub Issues](../../issues)
- Review documentation
- Open a new issue with details

Happy reviewing! 🚀
