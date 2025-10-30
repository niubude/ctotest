# Contributing to AI Review Flow

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ai-review-flow.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m "feat: add new feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations (requires PostgreSQL)
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

## Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Format code
npm run format
```

### Coding Conventions

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused
- Add types for all function parameters and return values
- Avoid `any` types when possible

### Naming Conventions

- **Files**: camelCase for modules, PascalCase for classes
- **Variables/Functions**: camelCase
- **Classes/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: prefix with underscore `_privateMember`

## Testing

All new features must include tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Guidelines

- Write unit tests for utilities and services
- Mock external dependencies (database, AI providers)
- Test both success and error scenarios
- Aim for >80% code coverage
- Use descriptive test names

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Adding a New AI Provider

To add support for a new AI provider:

1. Create a new provider class in `src/providers/`:

```typescript
// src/providers/YourProvider.ts
import { BaseAIProvider } from './AIProvider';
import { AIProviderConfig, ReviewRequest, ReviewResponse } from '../types';

export class YourProvider extends BaseAIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
  }

  getName(): string {
    return 'your-provider';
  }

  async generateReview(request: ReviewRequest): Promise<ReviewResponse> {
    // Build prompt using inherited method
    const prompt = this.buildPrompt(request);
    
    // Make API call to your provider
    // ...
    
    // Parse response using inherited method
    return this.parseResponse(responseText);
  }
}
```

2. Register in `src/providers/index.ts`:

```typescript
case 'your-provider':
  return new YourProvider(config);
```

3. Add configuration support in `src/config/index.ts`

4. Add tests in `src/__tests__/providers.test.ts`

5. Update documentation in README.md

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(providers): add Claude AI provider support

Implement Anthropic Claude API integration with streaming support.
Includes retry logic and error handling.

Closes #123
```

```
fix(rate-limiter): handle edge case in cleanup

Fix race condition when multiple cleanup operations run concurrently.
```

## Pull Request Process

1. **Update Documentation**: Update README.md if you change functionality
2. **Add Tests**: Ensure all new code is tested
3. **Run Tests**: All tests must pass
4. **Code Quality**: Run linter and formatter
5. **Commit Messages**: Follow conventional commit format
6. **PR Description**: Clearly describe what and why
7. **Link Issues**: Reference related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Project Structure

```
ai-review-flow/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── __tests__/          # Test files
│   │   ├── setup.ts
│   │   ├── providers.test.ts
│   │   ├── reviewService.test.ts
│   │   ├── rateLimiter.test.ts
│   │   └── validation.test.ts
│   ├── config/             # Configuration
│   │   └── index.ts
│   ├── providers/          # AI provider implementations
│   │   ├── AIProvider.ts   # Base class and interface
│   │   ├── OpenAIProvider.ts
│   │   ├── MockAIProvider.ts
│   │   └── index.ts
│   ├── routes/             # API routes
│   │   └── reviewRoutes.ts
│   ├── services/           # Business logic
│   │   ├── reviewService.ts
│   │   └── svnService.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utilities
│   │   ├── rateLimiter.ts
│   │   └── validation.ts
│   └── index.ts            # Entry point
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Architecture Decisions

### Why Provider Pattern?

The provider pattern allows easy integration of multiple AI services without changing core logic. Each provider implements a common interface, making the system extensible.

### Why Prisma?

Prisma provides type-safe database access, automatic migrations, and excellent TypeScript support. It simplifies database operations and reduces boilerplate.

### Why Express?

Express is lightweight, widely adopted, and has excellent middleware support. It's perfect for building REST APIs.

### Why Zod?

Zod provides runtime validation with TypeScript inference, ensuring type safety both at compile time and runtime.

## Common Tasks

### Adding a New Route

1. Define route handler in `src/routes/`
2. Add validation schema if needed
3. Register route in main router
4. Add tests
5. Update API.md

### Adding a Database Model

1. Update `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Generate client: `npm run prisma:generate`
4. Update seed data if needed
5. Update TypeScript types

### Adding Configuration

1. Add to `.env.example`
2. Update `src/config/index.ts`
3. Update `validateConfig()` if required
4. Document in README.md

## Debugging

### Enable Debug Logging

Set environment variable:
```bash
DEBUG=* npm run dev
```

### Common Issues

**Database Connection Failed:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Run migrations: `npm run prisma:migrate`

**AI Provider Errors:**
- Verify API key is set
- Check API base URL
- Try mock provider: `USE_MOCK_AI=true`

**Tests Failing:**
- Clear node_modules and reinstall
- Check test database setup
- Run tests individually to isolate issues

## Getting Help

- Check existing issues
- Review documentation
- Ask questions in discussions
- Tag maintainers for urgent issues

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards others

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
