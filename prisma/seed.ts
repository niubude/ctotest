import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const systemPrompt = await prisma.systemPrompt.upsert({
    where: { id: 'default-prompt' },
    update: {},
    create: {
      id: 'default-prompt',
      name: 'Default Code Review Prompt',
      prompt: `You are an expert code reviewer with deep knowledge of software engineering best practices, security vulnerabilities, and code quality standards.

Your task is to review code commits and provide constructive, actionable feedback. Focus on:

1. **Security**: Identify potential security vulnerabilities, unsafe operations, or data exposure risks
2. **Code Quality**: Look for code smells, anti-patterns, and violations of SOLID principles
3. **Performance**: Identify potential performance bottlenecks or inefficient algorithms
4. **Maintainability**: Assess code readability, documentation, and adherence to conventions
5. **Best Practices**: Check for language-specific best practices and modern patterns
6. **Testing**: Evaluate test coverage and quality (if tests are included)

Provide specific, actionable suggestions for improvement. Be constructive and educational in your feedback.`,
      isActive: true,
    },
  });

  const rules = [
    {
      id: 'rule-security-hardcoded-secrets',
      name: 'No Hardcoded Secrets',
      description: 'Detect hardcoded API keys, passwords, or tokens',
      rule: 'Flag any hardcoded credentials, API keys, passwords, or sensitive tokens. Suggest using environment variables or secret management systems.',
    },
    {
      id: 'rule-code-quality-complexity',
      name: 'Cyclomatic Complexity',
      description: 'Flag overly complex functions',
      rule: 'Identify functions with high cyclomatic complexity (deeply nested conditions, long functions). Suggest refactoring into smaller, focused functions.',
    },
    {
      id: 'rule-code-quality-duplication',
      name: 'Code Duplication',
      description: 'Detect duplicated code blocks',
      rule: 'Identify duplicated code that could be extracted into reusable functions or modules.',
    },
    {
      id: 'rule-best-practices-error-handling',
      name: 'Error Handling',
      description: 'Ensure proper error handling',
      rule: 'Check that errors are properly caught, handled, and logged. Flag empty catch blocks or ignored errors.',
    },
    {
      id: 'rule-best-practices-naming',
      name: 'Naming Conventions',
      description: 'Verify consistent naming conventions',
      rule: 'Ensure variables, functions, and classes follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes).',
    },
    {
      id: 'rule-performance-inefficient-loops',
      name: 'Inefficient Loops',
      description: 'Detect performance issues in loops',
      rule: 'Identify nested loops, unnecessary iterations, or operations that could be optimized.',
    },
    {
      id: 'rule-documentation-comments',
      name: 'Documentation',
      description: 'Check for adequate documentation',
      rule: 'Flag complex functions or classes lacking documentation. Public APIs should be well-documented.',
    },
  ];

  for (const rule of rules) {
    await prisma.reviewRule.upsert({
      where: { id: rule.id },
      update: {},
      create: {
        ...rule,
        enabled: true,
      },
    });
  }

  console.log('Seeding completed!');
  console.log(`Created system prompt: ${systemPrompt.name}`);
  console.log(`Created ${rules.length} review rules`);
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
