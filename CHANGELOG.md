# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-20

### Added
- **Static analysis (Issues)** - New `/graph-studio/issues` endpoint and Issues UI view
  - Detects circular dependencies (module- and provider-level, via Tarjan's strongly-connected-components algorithm), unused providers, scope conflicts, and duplicate DI tokens
  - Each finding includes a plain-language explanation and a suggested fix, with a one-click jump to the offending node(s) in the graph
- **GraphQL resolver support** - New `/graph-studio/graphql` endpoint exposing detected GraphQL operations as JSON
  - Detects `@Query()`, `@Mutation()`, `@Subscription()`, and `@ResolveField()` resolvers via reflect-metadata, with no `@nestjs/graphql` dependency required
  - Adds a new "GraphQL" tab in the UI showing operations with their full execution chains (guards, pipes, interceptors, filters)
  - Kept deliberately isolated from the existing REST route collection/display pipeline — GraphQL operations never appear in `/graph-studio/routes` or `/graph-studio/graph`
- **Focus Mode** - Filter the graph down to a single node's dependency neighborhood (both directions — depends on and used by — at a chosen depth: 1/2/3/All), with a synced, expandable dependency tree alongside it. Circular dependencies are shown as a terminated tree branch instead of recursing forever.
- **Group by module** - Optional labeled swimlane boxes around each module's nodes, computed with dagre's compound-graph clustering so a module's members actually end up positioned next to each other

### Changed
- Redesigned the UI's visual theme (Issues, Routes, and the Graph node-details panel) to match NestJS Devtools' dark palette and structural patterns (severity icons, inline code for identifiers, eyebrow labels)
- The Routes view's execution-chain detail now renders as a horizontal Guards → Interceptors → Pipes → Controller → Filters diagram instead of stacked lists
- The Graph node-details panel now explains why a node like `HealthCheckModule` can appear twice (once as a MODULE, once as a same-named PROVIDER) — NestJS registers every module class as a provider of itself in its own DI container

### Fixed
- Settings toggles (highlight request-scoped, detect circular deps, lock nodes) no longer trigger a full graph re-layout. Previously every toggle re-ran the full dagre layout pass — measured at ~1.3s of main-thread blocking on a real ~400-node graph
- Several static-analysis false positives: global `APP_GUARD`/`APP_INTERCEPTOR`/etc. tokens are now matched by prefix and keyed by DI token instead of exact-matching the display name; GraphQL resolver chains now also count toward "unused provider" detection; providers used only via a route's guard/pipe/interceptor/filter chain are no longer flagged as unused
- Circular dependency detection now uses Tarjan's SCC algorithm, fixing incorrect results on diamond-shaped dependency graphs
- Dependency matching now uses the DI token instead of display name, fixing false positives/negatives on renamed or aliased providers
- A search-suggestion click populated the node-details panel with a `name` field instead of `label`, leaving the Name field blank when opened that way
- A focus-highlight race condition that could cancel its own timers, or lose to the initial-mount fit-view

## [0.1.2] - 2025-10-31

### Documentation
- **Enhanced README.md** - Significantly improved repository presentation
  - Added centered header with compelling tagline and visual appeal
  - Added comprehensive "About" section explaining the tool's value proposition
  - Expanded features section with detailed subsections for each capability
  - Improved quick start guide with better code examples and emojis
  - Clearer configuration options with better formatting
  - Added detailed use cases for different environments
  - Added API endpoints section with example responses
  - Enhanced TypeScript support section with collapsible type definitions
  - Improved requirements and compatibility sections with tables
  - Added comprehensive troubleshooting guide with solutions
  - Enhanced security considerations with practical examples
  - Better organized contributing section
  - Improved support and community resources
  - Added acknowledgments and project stats

- **Added CONTRIBUTING.md** - Comprehensive contributing guidelines
  - Code of conduct and contribution standards
  - Detailed development setup instructions
  - Project structure overview
  - Development workflow guidelines
  - Testing requirements and examples (unit, UI, E2E)
  - Coding standards and style guide
  - Commit message guidelines (Conventional Commits)
  - Pull request process and templates
  - Bug reporting template
  - Feature suggestion guidelines

### Repository
- **Updated GitHub repository settings**
  - Added clear, concise repository description
  - Added 10 relevant topics/tags for better discoverability
  - Set repository homepage URL to npm package

### Impact
- **First Impressions** - Professional, welcoming appearance with clear value proposition
- **Discoverability** - Better SEO with relevant topics and comprehensive description
- **User Experience** - Easier to understand what the tool does and how to use it
- **Developer Experience** - Clear contributing guidelines encourage community participation
- **Professional Polish** - Consistent formatting, emojis for visual appeal, and comprehensive documentation

## [0.1.1] - 2025-10-31

### Security
- **Fixed 5 High-Severity CodeQL Alerts** in example application:
  - Remote property injection vulnerability (prototype pollution)
  - Incomplete multi-character sanitization (script tags)
  - Incomplete multi-character sanitization (iframe tags)
  - Bad HTML filtering regexp
  - Reflected XSS vulnerability
- **Improved Input Sanitization** - Implemented whitelist-based property filtering in example application
- **Enhanced Security Workflow** - Fixed dependency-review to be non-blocking when Dependency Graph is not enabled

### Changed
- **Example Application** - Updated `SanitizeInputPipe` with secure implementation
- **CI/CD** - Improved security workflow configuration

### Documentation
- **Added Screenshots** - Added visual examples to README.md

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

[0.1.2]: https://github.com/Isqanderm/nestjs-graph-studio/releases/tag/v0.1.2
[0.1.1]: https://github.com/Isqanderm/nestjs-graph-studio/releases/tag/v0.1.1
[0.1.0]: https://github.com/Isqanderm/nestjs-graph-studio/releases/tag/v0.1.0
[Unreleased]: https://github.com/Isqanderm/nestjs-graph-studio/compare/v0.1.2...HEAD

