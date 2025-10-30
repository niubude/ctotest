import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Prisma Schema Usage Examples ===\n');

  // Example 1: Create a new repository
  console.log('1. Creating a new repository...');
  const newRepo = await prisma.svnRepository.create({
    data: {
      name: 'example-repo',
      url: 'https://svn.example.com/repos/example',
      username: 'user',
      description: 'Example repository for demonstration',
      isActive: true,
    },
  });
  console.log('Created repository:', newRepo.name);

  // Example 2: Create a review rule
  console.log('\n2. Creating a review rule...');
  const newRule = await prisma.reviewRule.create({
    data: {
      name: 'example-rule',
      description: 'Example rule for demonstration',
      ruleType: 'security',
      severity: 'high',
      isEnabled: true,
      configuration: JSON.stringify({ threshold: 5 }),
    },
  });
  console.log('Created rule:', newRule.name);

  // Example 3: Create a system prompt
  console.log('\n3. Creating a system prompt...');
  const newPrompt = await prisma.systemPrompt.create({
    data: {
      name: 'example-prompt',
      promptText: 'Review this code for security issues.',
      description: 'Example prompt for demonstration',
      category: 'security',
      isActive: true,
    },
  });
  console.log('Created prompt:', newPrompt.name);

  // Example 4: Start a review session
  console.log('\n4. Creating a review session...');
  const session = await prisma.reviewSession.create({
    data: {
      repositoryId: newRepo.id,
      ruleId: newRule.id,
      promptId: newPrompt.id,
      svnRevision: 'r54321',
      status: 'in-progress',
      aiModel: 'gpt-4',
    },
  });
  console.log('Created session:', session.id);

  // Example 5: Add a finding
  console.log('\n5. Creating a finding...');
  const finding = await prisma.reviewFinding.create({
    data: {
      sessionId: session.id,
      filePath: 'src/example.js',
      lineNumber: 25,
      severity: 'high',
      category: 'security',
      title: 'Example Security Issue',
      description: 'This is an example security issue for demonstration.',
      suggestion: 'Fix the security issue by doing X',
      status: 'open',
    },
  });
  console.log('Created finding:', finding.title);

  // Example 6: Query with relationships
  console.log('\n6. Querying session with all relationships...');
  const fullSession = await prisma.reviewSession.findUnique({
    where: { id: session.id },
    include: {
      repository: true,
      rule: true,
      prompt: true,
      findings: true,
    },
  });
  console.log('Session details:');
  console.log('  Repository:', fullSession?.repository.name);
  console.log('  Rule:', fullSession?.rule?.name);
  console.log('  Prompt:', fullSession?.prompt?.name);
  console.log('  Findings:', fullSession?.findings.length);

  // Example 7: Update session to completed
  console.log('\n7. Completing the review session...');
  await prisma.reviewSession.update({
    where: { id: session.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      totalFiles: 10,
      totalFindings: 1,
    },
  });
  console.log('Session marked as completed');

  // Example 8: Query findings with filters
  console.log('\n8. Querying high-severity findings...');
  const highSeverityFindings = await prisma.reviewFinding.findMany({
    where: {
      severity: 'high',
      status: 'open',
    },
    include: {
      session: {
        include: {
          repository: true,
        },
      },
    },
  });
  console.log(`Found ${highSeverityFindings.length} high-severity open findings`);

  // Example 9: Aggregate statistics
  console.log('\n9. Getting statistics...');
  const stats = await prisma.reviewFinding.groupBy({
    by: ['severity', 'status'],
    _count: true,
  });
  console.log('Finding statistics by severity and status:');
  stats.forEach((stat) => {
    console.log(`  ${stat.severity} / ${stat.status}: ${stat._count} findings`);
  });

  // Example 10: Delete the example data
  console.log('\n10. Cleaning up example data...');
  await prisma.reviewSession.delete({ where: { id: session.id } });
  await prisma.svnRepository.delete({ where: { id: newRepo.id } });
  await prisma.reviewRule.delete({ where: { id: newRule.id } });
  await prisma.systemPrompt.delete({ where: { id: newPrompt.id } });
  console.log('Example data cleaned up');

  console.log('\n=== Examples completed successfully! ===');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
