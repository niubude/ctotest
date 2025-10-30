import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface ReviewFinding {
  id: string;
  commitId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  suggestion?: string;
}

interface ReviewSession {
  id: string;
  commitIds: string[];
  aiProvider: string;
  aiModel: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  reviewFindings: ReviewFinding[];
}

async function reviewCommits(commitIds: string[]): Promise<ReviewSession> {
  try {
    console.log(`Submitting ${commitIds.length} commit(s) for review...`);
    
    const response = await axios.post(`${API_BASE_URL}/review`, {
      commitIds,
    });

    if (response.data.success) {
      console.log(`✓ Review completed successfully`);
      console.log(`  Session ID: ${response.data.sessionId}`);
      return response.data.session;
    } else {
      throw new Error('Review failed');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Review failed:', error.response.data);
      throw new Error(error.response.data.message || 'Review failed');
    }
    throw error;
  }
}

async function getReviewSession(sessionId: string): Promise<ReviewSession> {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/${sessionId}`);
    return response.data.session;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Failed to get session:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to get session');
    }
    throw error;
  }
}

function printFindings(findings: ReviewFinding[]) {
  if (findings.length === 0) {
    console.log('\n✓ No issues found!');
    return;
  }

  console.log(`\n📋 Found ${findings.length} finding(s):\n`);

  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
    info: '⚪',
  };

  findings.forEach((finding, index) => {
    const emoji = severityEmoji[finding.severity];
    console.log(`${index + 1}. ${emoji} [${finding.severity.toUpperCase()}] ${finding.title}`);
    console.log(`   Category: ${finding.category}`);
    console.log(`   Commit: ${finding.commitId}`);
    
    if (finding.filePath) {
      console.log(`   File: ${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ''}`);
    }
    
    console.log(`   Description: ${finding.description}`);
    
    if (finding.suggestion) {
      console.log(`   💡 Suggestion: ${finding.suggestion}`);
    }
    
    console.log('');
  });
}

function analyzeFindingsBySeverity(findings: ReviewFinding[]) {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  findings.forEach(finding => {
    counts[finding.severity]++;
  });

  console.log('\n📊 Summary by Severity:');
  console.log(`   Critical: ${counts.critical}`);
  console.log(`   High: ${counts.high}`);
  console.log(`   Medium: ${counts.medium}`);
  console.log(`   Low: ${counts.low}`);
  console.log(`   Info: ${counts.info}`);
}

function analyzeFindingsByCategory(findings: ReviewFinding[]) {
  const categories = new Map<string, number>();

  findings.forEach(finding => {
    const count = categories.get(finding.category) || 0;
    categories.set(finding.category, count + 1);
  });

  console.log('\n📊 Summary by Category:');
  categories.forEach((count, category) => {
    console.log(`   ${category}: ${count}`);
  });
}

async function main() {
  try {
    const commitIds = ['commit-1', 'commit-2', 'commit-3'];

    const session = await reviewCommits(commitIds);

    console.log('\n📝 Review Session Details:');
    console.log(`   ID: ${session.id}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   AI Provider: ${session.aiProvider}`);
    console.log(`   AI Model: ${session.aiModel}`);
    console.log(`   Started: ${new Date(session.startedAt).toLocaleString()}`);
    
    if (session.completedAt) {
      const duration = new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime();
      console.log(`   Completed: ${new Date(session.completedAt).toLocaleString()}`);
      console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
    }

    printFindings(session.reviewFindings);

    if (session.reviewFindings.length > 0) {
      analyzeFindingsBySeverity(session.reviewFindings);
      analyzeFindingsByCategory(session.reviewFindings);
    }

    const criticalOrHigh = session.reviewFindings.filter(
      f => f.severity === 'critical' || f.severity === 'high'
    );

    if (criticalOrHigh.length > 0) {
      console.log(`\n⚠️  Warning: Found ${criticalOrHigh.length} critical or high severity issue(s)`);
      process.exit(1);
    } else {
      console.log('\n✅ No critical issues found!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { reviewCommits, getReviewSession, printFindings };
