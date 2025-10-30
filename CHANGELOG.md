# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-15

### Added
- Initial release of SVN Service API
- SVN client integration using node-svn-ultimate
- Service layer for SVN operations:
  - Fetch commits with pagination
  - Filter commits by keyword and author
  - Get commit details with file changes
  - Get commit diffs
  - Get repository information
- RESTful API endpoints under `/api/svn`:
  - `GET /api/svn/info` - Repository information
  - `GET /api/svn/commits` - List commits with filtering and pagination
  - `GET /api/svn/commits/:revision` - Commit details
  - `GET /api/svn/commits/:revision/diff` - Commit diff
- Comprehensive error handling:
  - Custom error classes for different SVN error types
  - Structured API error responses
  - HTTP status code mapping
- Security features:
  - SVN authentication support (username/password)
  - Environment-based configuration
  - Input validation using Zod
- Logging with Winston
- Full TypeScript support with strict mode
- Comprehensive test suite:
  - Unit tests for service layer
  - Integration tests for API routes
  - Error handling tests
  - Configuration tests
- Documentation:
  - Complete README with API documentation
  - Environment variable documentation
  - Architecture overview
  - Troubleshooting guide

### Technical Details
- Node.js 18+ with ES modules
- Express.js for API server
- TypeScript 5.3+
- Vitest for testing
- ESLint for code quality
- Winston for logging
- Zod for validation
