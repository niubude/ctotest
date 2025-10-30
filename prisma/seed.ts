import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample SVN repositories
  const repo1 = await prisma.svnRepository.upsert({
    where: { name: 'main-project' },
    update: {},
    create: {
      name: 'main-project',
      url: 'https://svn.example.com/repos/main-project/trunk',
      username: 'reviewer',
      description: 'Main project repository for code reviews',
      isActive: true,
    },
  });

  const repo2 = await prisma.svnRepository.upsert({
    where: { name: 'legacy-app' },
    update: {},
    create: {
      name: 'legacy-app',
      url: 'https://svn.example.com/repos/legacy-app/trunk',
      description: 'Legacy application requiring security audits',
      isActive: false,
    },
  });

  console.log('Created repositories:', { repo1, repo2 });

  // Create sample review rules
  const securityRule = await prisma.reviewRule.upsert({
    where: { name: 'sql-injection-check' },
    update: {},
    create: {
      name: 'sql-injection-check',
      description: 'Detect potential SQL injection vulnerabilities',
      ruleType: 'security',
      severity: 'critical',
      isEnabled: true,
      configuration: JSON.stringify({
        patterns: ['SELECT.*WHERE', 'INSERT.*VALUES'],
        excludePatterns: ['PreparedStatement'],
      }),
    },
  });

  const performanceRule = await prisma.reviewRule.upsert({
    where: { name: 'inefficient-loop-check' },
    update: {},
    create: {
      name: 'inefficient-loop-check',
      description: 'Identify inefficient loop patterns and N+1 queries',
      ruleType: 'performance',
      severity: 'medium',
      isEnabled: true,
      configuration: JSON.stringify({
        checkNestedLoops: true,
        maxComplexity: 10,
      }),
    },
  });

  const styleRule = await prisma.reviewRule.upsert({
    where: { name: 'naming-convention' },
    update: {},
    create: {
      name: 'naming-convention',
      description: 'Enforce consistent naming conventions',
      ruleType: 'style',
      severity: 'low',
      isEnabled: true,
      configuration: JSON.stringify({
        camelCase: true,
        noAbbreviations: false,
      }),
    },
  });

  console.log('Created review rules:', { securityRule, performanceRule, styleRule });

  // Create sample system prompts
  const generalPrompt = await prisma.systemPrompt.upsert({
    where: { name: 'general-code-review' },
    update: {},
    create: {
      name: 'general-code-review',
      promptText: `You are an expert code reviewer. Analyze the provided code for:
- Security vulnerabilities
- Performance issues
- Code quality and maintainability
- Best practices adherence
- Potential bugs

For each issue found, provide:
1. Severity level (low/medium/high/critical)
2. Clear description of the problem
3. Location in the code
4. Suggested fix or improvement`,
      description: 'General-purpose code review prompt for comprehensive analysis',
      category: 'general',
      isActive: true,
      version: 1,
    },
  });

  const securityPrompt = await prisma.systemPrompt.upsert({
    where: { name: 'security-focused-review' },
    update: {},
    create: {
      name: 'security-focused-review',
      promptText: `You are a security expert conducting a security audit. Focus on:
- SQL injection vulnerabilities
- Cross-site scripting (XSS) risks
- Authentication and authorization flaws
- Sensitive data exposure
- Insecure cryptographic practices
- Input validation issues

Rate each finding by OWASP severity and provide detailed remediation steps.`,
      description: 'Security-focused review prompt for vulnerability detection',
      category: 'security',
      isActive: true,
      version: 1,
    },
  });

  const performancePrompt = await prisma.systemPrompt.upsert({
    where: { name: 'performance-optimization' },
    update: {},
    create: {
      name: 'performance-optimization',
      promptText: `You are a performance optimization specialist. Analyze code for:
- Algorithmic complexity issues (time and space)
- Database query optimization opportunities
- Memory leaks and resource management
- Caching opportunities
- Unnecessary computations

Provide specific metrics where possible and concrete optimization suggestions.`,
      description: 'Performance-focused review for optimization opportunities',
      category: 'performance',
      isActive: true,
      version: 1,
    },
  });

  console.log('Created system prompts:', { generalPrompt, securityPrompt, performancePrompt });

  // Create a sample review session with findings
  const sampleSession = await prisma.reviewSession.create({
    data: {
      repositoryId: repo1.id,
      ruleId: securityRule.id,
      promptId: securityPrompt.id,
      svnRevision: 'r12345',
      status: 'completed',
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:05:30Z'),
      aiModel: 'gpt-4',
      totalFiles: 5,
      totalFindings: 3,
      metadata: JSON.stringify({
        scanDuration: '5m30s',
        filesScanned: ['auth.js', 'database.js', 'api.js'],
      }),
    },
  });

  // Create sample findings for the session
  const finding1 = await prisma.reviewFinding.create({
    data: {
      sessionId: sampleSession.id,
      filePath: 'src/auth/login.js',
      lineNumber: 42,
      severity: 'critical',
      category: 'security',
      title: 'Potential SQL Injection Vulnerability',
      description: 'User input is directly concatenated into SQL query without sanitization',
      suggestion: 'Use parameterized queries or an ORM to prevent SQL injection',
      codeSnippet: 'const query = "SELECT * FROM users WHERE username = \'" + userInput + "\'";',
      aiResponse: 'This code is vulnerable to SQL injection attacks. An attacker could input malicious SQL code...',
      status: 'open',
    },
  });

  const finding2 = await prisma.reviewFinding.create({
    data: {
      sessionId: sampleSession.id,
      filePath: 'src/database/queries.js',
      lineNumber: 78,
      severity: 'high',
      category: 'security',
      title: 'Hardcoded Database Credentials',
      description: 'Database credentials are hardcoded in the source file',
      suggestion: 'Move credentials to environment variables or a secure configuration service',
      codeSnippet: 'const DB_PASSWORD = "admin123";',
      aiResponse: 'Hardcoded credentials pose a significant security risk...',
      status: 'open',
    },
  });

  const finding3 = await prisma.reviewFinding.create({
    data: {
      sessionId: sampleSession.id,
      filePath: 'src/api/user-controller.js',
      lineNumber: 156,
      severity: 'medium',
      category: 'performance',
      title: 'N+1 Query Problem',
      description: 'Loop executes database query on each iteration',
      suggestion: 'Use a single query with JOIN or batch loading to reduce database calls',
      codeSnippet: 'users.forEach(user => { const posts = db.query("SELECT * FROM posts WHERE userId = ?", user.id); });',
      aiResponse: 'This pattern causes N+1 queries which can severely impact performance...',
      status: 'acknowledged',
    },
  });

  console.log('Created sample review session and findings:', { sampleSession, finding1, finding2, finding3 });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
