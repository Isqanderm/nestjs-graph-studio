# Contributing to NestJS Graph Studio

Thank you for your interest in contributing to NestJS Graph Studio! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

### Our Standards

- **Be respectful** - Treat everyone with respect and kindness
- **Be constructive** - Provide helpful feedback and suggestions
- **Be collaborative** - Work together to improve the project
- **Be inclusive** - Welcome contributors of all backgrounds and experience levels

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** >= 2.0.0

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/nestjs-graph-studio.git
cd nestjs-graph-studio
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/Isqanderm/nestjs-graph-studio.git
```

## Development Setup

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install example app dependencies
npm run example:install
```

### Build the Project

```bash
# Build UI and library
npm run build

# Build UI only
npm run build:ui

# Build library only
npm run build:lib
```

### Run in Development Mode

```bash
# Watch mode for library
npm run dev

# Watch mode for UI
npm run dev:ui

# Run example application
npm run example
```

The example application will be available at:
- Application: http://localhost:3000
- Graph Studio: http://localhost:3000/graph-studio

## Project Structure

```
nestjs-graph-studio/
├── src/                    # Backend library source code
│   ├── adapters/          # HTTP adapter implementations
│   ├── http/              # HTTP controllers and middleware
│   ├── security/          # Security utilities
│   ├── snapshot/          # DI graph collection logic
│   ├── __tests__/         # Backend unit tests
│   ├── index.ts           # Public API exports
│   ├── module.ts          # Main NestJS module
│   └── options.ts         # Configuration options
├── ui/                     # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand state management
│   │   └── lib/           # Utility functions
│   └── dist/              # Built UI assets
├── example/                # Example NestJS application
│   ├── orders/            # Example orders module
│   ├── products/          # Example products module
│   └── users/             # Example users module
├── e2e/                    # End-to-end tests (Playwright)
│   ├── fixtures/          # Test fixtures
│   └── pages/             # Page Object Models
├── dist/                   # Built library output
└── docs/                   # Documentation and screenshots
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test              # Backend unit tests
npm run test:ui           # UI unit tests
npm run test:e2e          # E2E tests

# Run tests in watch mode
npm run test:watch
npm run test:ui:watch

# Generate coverage reports
npm run test:coverage
npm run test:ui:coverage
```

### 4. Lint and Format

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### 5. Commit Your Changes

Follow the [commit guidelines](#commit-guidelines) below.

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Testing

### Test Coverage Requirements

We maintain high test coverage standards:

- **Backend:** Minimum 90% coverage
- **UI:** Minimum 70% coverage

### Writing Tests

#### Backend Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';

describe('MyService', () => {
  it('should do something', () => {
    // Arrange
    const service = new MyService();
    
    // Act
    const result = service.doSomething();
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

#### UI Tests (Vitest + Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('should display graph view', async ({ page }) => {
  await page.goto('http://localhost:3000/graph-studio');
  await expect(page.getByRole('heading', { name: 'Graph View' })).toBeVisible();
});
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide proper type annotations
- Avoid `any` types when possible

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Keep functions small and focused

### Documentation

- Add JSDoc comments for public APIs
- Document complex logic with inline comments
- Update README.md for user-facing changes
- Add examples for new features

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

### Examples

```bash
feat(graph): add export to SVG functionality

Add ability to export the DI graph as SVG in addition to PNG.
Includes new export button in the UI toolbar.

Closes #123
```

```bash
fix(routes): handle undefined method in route metadata

Fix TypeError when route method is undefined by adding proper
null checks and default values.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. ✅ Ensure all tests pass (`npm run test:all`)
2. ✅ Run linter and fix any issues (`npm run lint`)
3. ✅ Format code (`npm run format`)
4. ✅ Update documentation if needed
5. ✅ Add tests for new functionality
6. ✅ Ensure coverage thresholds are met

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

## Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported in [Issues](https://github.com/Isqanderm/nestjs-graph-studio/issues)
2. Ensure you're using the latest version
3. Try to reproduce the bug in the example application

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Node.js: [e.g., 20.10.0]
- NestJS: [e.g., 10.3.0]
- nestjs-graph-studio: [e.g., 0.1.0]

**Additional context**
Any other relevant information.
```

## Suggesting Features

We welcome feature suggestions! Please open an issue with:

1. **Clear description** of the feature
2. **Use case** - Why is this feature needed?
3. **Proposed solution** - How should it work?
4. **Alternatives** - What other solutions have you considered?
5. **Additional context** - Screenshots, mockups, examples

## Questions?

If you have questions about contributing, feel free to:

- Open a [Discussion](https://github.com/Isqanderm/nestjs-graph-studio/discussions)
- Ask in an existing issue
- Reach out to the maintainers

---

Thank you for contributing to NestJS Graph Studio! 🎉

