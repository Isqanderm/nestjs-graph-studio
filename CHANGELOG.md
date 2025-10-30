# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-31

### Added

#### Core Features
- 🔍 **DI Graph Visualization** - Interactive visualization of entire dependency injection graph
- 🔴 **Missing Dependency Detection** - Automatically detects and highlights missing dependencies with suggested fixes
- 🛣️ **Route Explorer** - Browse all registered routes with their execution chains (guards, pipes, interceptors, filters)
- 📦 **Zero External Dependencies** - Runs completely locally, no cloud services required

#### Testing Infrastructure
- ✅ **Comprehensive Test Suite** - 406 tests total (229 backend + 177 UI)
- ✅ **Backend Coverage** - 93.22% code coverage
- ✅ **UI Coverage** - 76.10% code coverage
- ✅ **E2E Testing** - Complete Playwright infrastructure with Page Object Models
- ✅ **Integration Tests** - Full integration test suite

#### UI/UX Improvements
- **Settings Panel** - Integrated into left sidebar dropdown for better space utilization
- **Search Functionality** - Autocomplete for node search with improved UX
- **Visual Improvements** - Fixed Gantt chart text overlapping and visual artifacts
- **Loading States** - Improved loading indicators across all views
- **Responsive Design** - Mobile, tablet, and desktop support

#### CI/CD
- **GitHub Actions Workflows** - Complete CI/CD pipeline with:
  - Multi-version testing (Node 18, 20, 22)
  - CodeQL security scanning
  - Coverage reporting with thresholds
  - Automated npm publishing on version tags
  - Security audit and license compliance checks
- **Shared Dependency Cache** - ~30% faster CI runs
- **Coverage Thresholds** - Enforced 90% backend, 70% UI coverage

#### Documentation
- **Comprehensive README** - Complete documentation with examples
- **API Documentation** - All endpoints documented
- **TypeScript Types** - Full type definitions
- **Testing Guide** - Detailed testing documentation
- **E2E Guide** - E2E testing setup and troubleshooting

### Changed
- **Simplified Configuration** - Reduced to 2 essential options (enabled, healthPath)
- **Base Path** - Changed from `/_graph-studio` to `/graph-studio`
- **Authentication** - Removed BasicAuth (local development only)

### Removed
- **BasicAuth** - Removed HTTP Basic Authentication (breaking change)
- **Tracing Features** - Removed request tracing functionality
- **Unused Dependencies** - Removed commander, unused Radix UI components
- **CLI** - Removed unused CLI implementation

### Fixed
- **UI Assets 404 Errors** - Fixed asset paths with Vite base configuration
- **Routes View Error** - Fixed `TypeError: method.toLowerCase is not a function`
- **Build Errors** - Fixed TypeScript compilation and DI issues
- **Static File Serving** - Fixed TOCTOU security vulnerability
- **Graph Visualization** - Fixed search, export, and settings functionality

### Security
- **CodeQL Analysis** - Automated security scanning
- **TOCTOU Fix** - Fixed time-of-check-time-of-use race condition in static file serving
- **Dependency Audit** - Automated npm security audit
- **License Compliance** - Blocks GPL-3.0, AGPL-3.0 licenses
- **npm Provenance** - Supply chain security for npm packages

### Performance
- **Optimized CI/CD** - ~30% faster CI runs with shared cache
- **Reduced Package Size** - Removed unused dependencies
- **Build Optimization** - Improved build process

## [Unreleased]

### Planned
- Enhanced request tracing with method-level details
- Performance monitoring and metrics
- Additional graph layout algorithms
- Export functionality improvements

---

## Release Notes

### v0.1.0 - Initial Release

This is the first public release of NestJS Graph Studio, a local DevTools solution for NestJS applications.

**Highlights:**
- 🎉 **Production Ready** - 93.22% test coverage, comprehensive testing
- 🔒 **Secure** - CodeQL scanning, security audits, no external dependencies
- 📊 **Well Documented** - Complete documentation and examples
- 🚀 **CI/CD Ready** - Automated testing, building, and publishing

**Installation:**
```bash
npm install nestjs-graph-studio
```

**Quick Start:**
```typescript
import { GraphStudioModule } from 'nestjs-graph-studio';

@Module({
  imports: [
    GraphStudioModule.forRoot({
      enabled: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class AppModule {}
```

**Access UI:**
```
http://localhost:3000/graph-studio
```

For detailed documentation, see [README.md](README.md).

---

[0.1.0]: https://github.com/Isqanderm/nestjs-graph-studio/releases/tag/v0.1.0
[Unreleased]: https://github.com/Isqanderm/nestjs-graph-studio/compare/v0.1.0...HEAD

