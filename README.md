# NestJS Graph Studio

[![npm version](https://img.shields.io/npm/v/nestjs-graph-studio.svg)](https://www.npmjs.com/package/nestjs-graph-studio)
[![Build Status](https://github.com/Isqanderm/nestjs-graph-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/Isqanderm/nestjs-graph-studio/actions)
[![Coverage](https://img.shields.io/badge/coverage-93%25-brightgreen.svg)](https://github.com/Isqanderm/nestjs-graph-studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

**Local DevTools for NestJS applications** with dependency injection graph visualization. Run entirely locally without any external dependencies or SaaS services.

## Features

- 🔍 **DI Graph Visualization** - Interactive visualization of your entire dependency injection graph
- 🔴 **Missing Dependency Detection** - Automatically detects and highlights missing dependencies with suggested fixes
- 🛣️ **Route Explorer** - Browse all registered routes with their execution chains (guards, pipes, interceptors, filters)
- 📦 **Zero External Dependencies** - Runs completely locally, no cloud services required

## Quick Start

### Installation

```bash
# npm
npm install nestjs-graph-studio

# yarn
yarn add nestjs-graph-studio

# pnpm
pnpm add nestjs-graph-studio
```

### Basic Setup

Import and configure the `GraphStudioModule` in your root application module:

```typescript
import { Module } from '@nestjs/common';
import { GraphStudioModule } from 'nestjs-graph-studio';

@Module({
  imports: [
    GraphStudioModule.forRoot({
      enabled: process.env.NODE_ENV !== 'production',
    }),
    // ... your other modules
  ],
})
export class AppModule {}
```

### Start Your Application

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  console.log('Application: http://localhost:3000');
  console.log('Graph Studio: http://localhost:3000/graph-studio');
}

bootstrap();
```

### Access the UI

Open your browser and navigate to:

```
http://localhost:3000/graph-studio
```

You'll see:
- **Graph View** - Interactive visualization of your DI graph
- **Routes View** - List of all registered routes with execution chains

## Configuration Options

### Basic Configuration

```typescript
GraphStudioModule.forRoot({
  enabled: true,
  basePath: '/graph-studio',
  localOnly: true,
  serveUi: true,
})
```

### All Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` in production, `true` otherwise | Enable or disable the module |
| `healthPath` | `string` | `'/health'` | Health check endpoint path |



## Advanced Configuration

### Async Configuration

Use `forRootAsync()` for dynamic configuration with dependency injection:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphStudioModule } from 'nestjs-graph-studio';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphStudioModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        enabled: config.get('GRAPH_STUDIO_ENABLED', true),
        healthPath: config.get('GRAPH_STUDIO_HEALTH_PATH', '/health'),
      }),
    }),
  ],
})
export class AppModule {}
```

## Use Cases

### Development

Perfect for understanding your application's dependency structure during development:

```typescript
GraphStudioModule.forRoot({
  enabled: process.env.NODE_ENV === 'development',
  sample: 1, // Trace all requests
})
```

### Staging/Testing

Enable for staging environments:

```typescript
GraphStudioModule.forRoot({
  enabled: process.env.NODE_ENV !== 'production',
})
```

### Production Debugging

Temporarily enable for production debugging (use with caution):

```typescript
GraphStudioModule.forRoot({
  enabled: process.env.ENABLE_GRAPH_STUDIO === 'true',
})
```

## API Endpoints

When Graph Studio is enabled, the following endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `{basePath}` | GET | Graph Studio UI (if `serveUi: true`) |
| `{basePath}{graphPath}` | GET | DI graph snapshot (JSON) |
| `{basePath}{routesPath}` | GET | Routes metadata (JSON) |
| `{basePath}{healthPath}` | GET | Health check endpoint |

Default URLs (with `basePath: '/graph-studio'`):
- UI: `http://localhost:3000/graph-studio`
- Graph API: `http://localhost:3000/graph-studio/graph`
- Routes API: `http://localhost:3000/graph-studio/routes`
- Health: `http://localhost:3000/graph-studio/health`



## TypeScript Types

The package exports TypeScript types for all configuration options and data models:

```typescript
import {
  GraphStudioModule,
  GraphStudioOptions,
  GraphStudioAsyncOptions,
  GraphSnapshot,
  GraphNode,
  GraphEdge,
  RouteMeta,
  RouteChain,
  GraphStats,
  Scope,
  NodeType,
} from 'nestjs-graph-studio';
```

### Configuration Types

```typescript
interface GraphStudioOptions {
  enabled?: boolean;
  healthPath?: string;
}

interface GraphStudioAsyncOptions {
  useFactory: (...args: any[]) => Promise<GraphStudioOptions> | GraphStudioOptions;
  inject?: any[];
}
```

### Data Model Types

```typescript
type Scope = 'SINGLETON' | 'REQUEST' | 'TRANSIENT';
type NodeType = 'MODULE' | 'PROVIDER' | 'CONTROLLER' | 'ROUTE' | 'MISSING';

interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  scope?: Scope;
  module?: string;
  route?: { method: string; path: string };
  missing?: { requiredBy: string[]; suggestedFix?: string };
}

interface GraphEdge {
  from: string;
  to: string;
  kind: 'import' | 'export' | 'injects' | 'handles' | 'missing';
}

interface RouteMeta {
  method: string;
  path: string;
  controller: string;
  handler: string;
  chain: RouteChain;
}

interface RouteChain {
  guards: string[];
  pipes: string[];
  interceptors: string[];
  filters: string[];
}
```

## Requirements

- **Node.js**: >= 18.0.0
- **NestJS**: >= 9.0.0 or >= 10.0.0
- **TypeScript**: >= 5.0.0
- **reflect-metadata**: >= 0.1.13 or >= 0.2.0

## Compatibility

### Supported Adapters

- ✅ **Express** (default NestJS adapter)
- ✅ **Fastify**

### Supported NestJS Versions

- ✅ NestJS 9.x
- ✅ NestJS 10.x

## Troubleshooting

### Graph Studio UI not loading

1. Ensure `serveUi: true` in your configuration
2. Check that `enabled: true` is set
3. Verify the basePath is correct (default: `/graph-studio`)
4. Check browser console for errors

### Missing dependencies not detected

The module automatically detects missing dependencies by analyzing:
- Constructor injection parameters
- Property injection decorators
- Module imports/exports

If a dependency is not detected:
1. Ensure you're using standard NestJS dependency injection
2. Check that the dependency is properly decorated with `@Injectable()`
3. Verify the module configuration

## Security Considerations

### Development Only

**Recommendation:** Only enable Graph Studio in development and staging environments:

```typescript
GraphStudioModule.forRoot({
  enabled: process.env.NODE_ENV !== 'production',
})
```

### Network Security

**Important:** Graph Studio is designed for local development only and does not include authentication.

- Only enable in development/staging environments
- Never enable in production
- If you need to expose Graph Studio, use a reverse proxy with authentication (e.g., nginx with basic auth)

## License

MIT © [Aleksandr Melnik](https://github.com/Isqanderm)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📖 [Documentation](https://github.com/Isqanderm/nestjs-graph-studio#readme)
- 🐛 [Issue Tracker](https://github.com/Isqanderm/nestjs-graph-studio/issues)
- 💬 [Discussions](https://github.com/Isqanderm/nestjs-graph-studio/discussions)

## Links

- [GitHub Repository](https://github.com/Isqanderm/nestjs-graph-studio)
- [npm Package](https://www.npmjs.com/package/nestjs-graph-studio)
- [Changelog](https://github.com/Isqanderm/nestjs-graph-studio/blob/main/CHANGELOG.md)
- [Example Application](https://github.com/Isqanderm/nestjs-graph-studio/tree/main/example)

---

**Made with ❤️ for the NestJS community**
