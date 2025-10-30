# Usage Examples

This directory contains practical examples of how to use the AI Review Flow API.

## TypeScript/JavaScript Example

See `usage-example.ts` for a comprehensive example that demonstrates:

- Submitting commits for review
- Retrieving review results
- Formatting and displaying findings
- Analyzing results by severity and category
- Exit codes for CI/CD integration

### Running the Example

```bash
# Install dependencies (if not already done)
npm install axios

# Make sure the server is running
npm run dev

# In another terminal, run the example
npx tsx examples/usage-example.ts
```

### Using in Your Project

```typescript
import { reviewCommits, printFindings } from './examples/usage-example';

async function myReviewWorkflow() {
  const session = await reviewCommits(['abc123', 'def456']);
  printFindings(session.reviewFindings);
}
```

## cURL Examples

### Submit a Review

```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "commitIds": ["commit-1", "commit-2"]
  }'
```

### Get Review Results

```bash
curl http://localhost:3000/api/review/550e8400-e29b-41d4-a716-446655440000
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Python Example

```python
#!/usr/bin/env python3
import requests
import json
from typing import List, Dict

API_BASE_URL = "http://localhost:3000/api"

def review_commits(commit_ids: List[str]) -> Dict:
    """Submit commits for AI review"""
    response = requests.post(
        f"{API_BASE_URL}/review",
        json={"commitIds": commit_ids}
    )
    response.raise_for_status()
    return response.json()

def get_review_session(session_id: str) -> Dict:
    """Get review session details"""
    response = requests.get(f"{API_BASE_URL}/review/{session_id}")
    response.raise_for_status()
    return response.json()

def print_findings(findings: List[Dict]):
    """Print review findings"""
    if not findings:
        print("\n✓ No issues found!")
        return
    
    print(f"\n📋 Found {len(findings)} finding(s):\n")
    
    severity_emoji = {
        "critical": "🔴",
        "high": "🟠",
        "medium": "🟡",
        "low": "🔵",
        "info": "⚪"
    }
    
    for i, finding in enumerate(findings, 1):
        emoji = severity_emoji.get(finding["severity"], "⚪")
        print(f"{i}. {emoji} [{finding['severity'].upper()}] {finding['title']}")
        print(f"   Category: {finding['category']}")
        print(f"   Commit: {finding['commitId']}")
        
        if finding.get("filePath"):
            location = finding["filePath"]
            if finding.get("lineNumber"):
                location += f":{finding['lineNumber']}"
            print(f"   File: {location}")
        
        print(f"   Description: {finding['description']}")
        
        if finding.get("suggestion"):
            print(f"   💡 Suggestion: {finding['suggestion']}")
        
        print()

def main():
    commit_ids = ["commit-1", "commit-2", "commit-3"]
    
    print(f"Submitting {len(commit_ids)} commit(s) for review...")
    
    try:
        result = review_commits(commit_ids)
        session = result["session"]
        
        print(f"✓ Review completed successfully")
        print(f"  Session ID: {result['sessionId']}")
        print(f"  Status: {session['status']}")
        print(f"  AI Provider: {session['aiProvider']}")
        
        print_findings(session["reviewFindings"])
        
        # Count critical/high severity issues
        critical_or_high = [
            f for f in session["reviewFindings"]
            if f["severity"] in ["critical", "high"]
        ]
        
        if critical_or_high:
            print(f"\n⚠️  Warning: Found {len(critical_or_high)} critical or high severity issue(s)")
            exit(1)
        else:
            print("\n✅ No critical issues found!")
            exit(0)
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
```

Save as `examples/usage-example.py` and run:

```bash
python3 examples/usage-example.py
```

## CI/CD Integration Examples

### GitHub Actions

```yaml
name: AI Code Review

on: [push, pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Get commit IDs
        id: commits
        run: |
          COMMITS=$(git log --format="%H" -n 5 | jq -R -s -c 'split("\n")[:-1]')
          echo "commits=$COMMITS" >> $GITHUB_OUTPUT
      
      - name: Run AI Review
        env:
          REVIEW_API: ${{ secrets.REVIEW_API_URL }}
        run: |
          curl -X POST $REVIEW_API/api/review \
            -H "Content-Type: application/json" \
            -d "{\"commitIds\": ${{ steps.commits.outputs.commits }}}" \
            | jq '.'
```

### GitLab CI

```yaml
ai-review:
  stage: test
  image: curlimages/curl:latest
  script:
    - |
      COMMITS=$(git log --format="%H" -n 5 | jq -R -s -c 'split("\n")[:-1]')
      curl -X POST $REVIEW_API_URL/api/review \
        -H "Content-Type: application/json" \
        -d "{\"commitIds\": $COMMITS}" \
        | jq '.'
  variables:
    REVIEW_API_URL: "https://your-review-api.com"
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        REVIEW_API = credentials('review-api-url')
    }
    
    stages {
        stage('AI Review') {
            steps {
                script {
                    def commits = sh(
                        script: "git log --format='%H' -n 5 | jq -R -s -c 'split(\"\n\")[:-1]'",
                        returnStdout: true
                    ).trim()
                    
                    sh """
                        curl -X POST ${REVIEW_API}/api/review \
                          -H "Content-Type: application/json" \
                          -d '{"commitIds": ${commits}}'
                    """
                }
            }
        }
    }
}
```

## Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Get the commit about to be created
COMMIT_SHA=$(git rev-parse HEAD)

# Call review API
RESPONSE=$(curl -s -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d "{\"commitIds\": [\"$COMMIT_SHA\"]}")

# Check for critical issues
CRITICAL_COUNT=$(echo $RESPONSE | jq '[.session.reviewFindings[] | select(.severity == "critical")] | length')

if [ "$CRITICAL_COUNT" -gt 0 ]; then
  echo "❌ Commit blocked: $CRITICAL_COUNT critical issue(s) found"
  echo $RESPONSE | jq '.session.reviewFindings[] | select(.severity == "critical")'
  exit 1
fi

echo "✅ No critical issues found"
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

## Testing Examples

### Using Mock Provider

Set environment variable before running:

```bash
USE_MOCK_AI=true npm run dev
```

Then test:

```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{"commitIds": ["test-commit"]}'
```

### Load Testing with Apache Bench

```bash
# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 -T application/json \
  -p payload.json \
  http://localhost:3000/api/review

# payload.json content:
# {"commitIds": ["commit-1"]}
```

### Load Testing with wrk

```bash
wrk -t4 -c100 -d30s \
  -s post.lua \
  http://localhost:3000/api/review

# post.lua content:
# wrk.method = "POST"
# wrk.body = '{"commitIds": ["commit-1"]}'
# wrk.headers["Content-Type"] = "application/json"
```

## Error Handling Examples

### Handling Rate Limits

```typescript
async function reviewWithRetry(commitIds: string[], maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await reviewCommits(commitIds);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const resetTime = error.response.data.resetTime;
        const waitMs = new Date(resetTime).getTime() - Date.now();
        
        if (i < maxRetries - 1 && waitMs > 0) {
          console.log(`Rate limited. Waiting ${waitMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }
      }
      throw error;
    }
  }
}
```

### Handling Timeouts

```typescript
async function reviewWithTimeout(commitIds: string[], timeoutMs = 60000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });

  return Promise.race([
    reviewCommits(commitIds),
    timeoutPromise
  ]);
}
```

## Advanced Usage

### Batch Processing

```typescript
async function reviewBatch(allCommitIds: string[], batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < allCommitIds.length; i += batchSize) {
    const batch = allCommitIds.slice(i, i + batchSize);
    const session = await reviewCommits(batch);
    results.push(session);
    
    // Wait between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
```

### Filtering Results

```typescript
function filterCriticalFindings(session: ReviewSession) {
  return session.reviewFindings.filter(
    f => f.severity === 'critical'
  );
}

function filterByCategory(session: ReviewSession, category: string) {
  return session.reviewFindings.filter(
    f => f.category === category
  );
}

function filterByFile(session: ReviewSession, filePath: string) {
  return session.reviewFindings.filter(
    f => f.filePath?.includes(filePath)
  );
}
```

### Exporting Results

```typescript
import fs from 'fs';

function exportToJson(session: ReviewSession, filename: string) {
  fs.writeFileSync(filename, JSON.stringify(session, null, 2));
}

function exportToCsv(session: ReviewSession, filename: string) {
  const headers = 'Severity,Category,Title,File,Line,Description\n';
  const rows = session.reviewFindings.map(f => 
    `${f.severity},${f.category},"${f.title}",${f.filePath || ''},${f.lineNumber || ''},"${f.description}"`
  ).join('\n');
  
  fs.writeFileSync(filename, headers + rows);
}
```
