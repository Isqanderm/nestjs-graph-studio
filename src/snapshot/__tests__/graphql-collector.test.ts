import { describe, it, expect, beforeEach } from 'vitest';
import 'reflect-metadata';
import { GraphQLOperationCollector } from '../graphql-collector';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';

// Copied from @nestjs/graphql/dist/graphql.constants.js — see graphql-collector.ts for details.
const GQL_RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
const GQL_RESOLVER_NAME_METADATA = 'graphql:resolver_name';
const GQL_RESOLVER_PROPERTY_METADATA = 'graphql:resolve_property';

// Minimal stand-ins for @nestjs/graphql's decorators, so tests don't need that package installed.
function FakeResolver(typeName?: string) {
  return (target: Function) => {
    Reflect.defineMetadata(GQL_RESOLVER_TYPE_METADATA, typeName, target);
    Reflect.defineMetadata(GQL_RESOLVER_NAME_METADATA, typeName, target);
  };
}

function FakeQuery(name?: string) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(GQL_RESOLVER_TYPE_METADATA, 'Query', descriptor.value);
    Reflect.defineMetadata(GQL_RESOLVER_NAME_METADATA, name, descriptor.value);
    return descriptor;
  };
}

function FakeMutation(name?: string) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(GQL_RESOLVER_TYPE_METADATA, 'Mutation', descriptor.value);
    Reflect.defineMetadata(GQL_RESOLVER_NAME_METADATA, name, descriptor.value);
    return descriptor;
  };
}

function FakeResolveField(name?: string) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(GQL_RESOLVER_NAME_METADATA, name, descriptor.value);
    Reflect.defineMetadata(GQL_RESOLVER_PROPERTY_METADATA, true, descriptor.value);
    return descriptor;
  };
}

function makeWrapper(metatype: Function): any {
  return { metatype, name: metatype.name };
}

function makeModulesContainer(providers: Function[]): ModulesContainer {
  const providersMap = new Map();
  providers.forEach((p, idx) => providersMap.set(`token-${idx}`, makeWrapper(p)));
  const moduleRef = {
    providers: providersMap,
    controllers: new Map(),
    imports: new Set(),
    metatype: class TestModule {},
  };
  const container = new Map();
  container.set('module-1', moduleRef);
  return container as unknown as ModulesContainer;
}

describe('GraphQLOperationCollector', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('returns an empty snapshot when there are no resolvers', () => {
    const collector = new GraphQLOperationCollector(makeModulesContainer([]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations).toEqual([]);
    expect(snapshot.stats).toEqual({
      resolverClasses: 0,
      queries: 0,
      mutations: 0,
      subscriptions: 0,
      fields: 0,
    });
  });

  it('collects a @Query() method as a QUERY operation', () => {
    @FakeResolver()
    class ProductResolver {
      products() {}
    }
    FakeQuery('products')(
      ProductResolver.prototype,
      'products',
      Object.getOwnPropertyDescriptor(ProductResolver.prototype, 'products')!,
    );

    const collector = new GraphQLOperationCollector(makeModulesContainer([ProductResolver]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations).toHaveLength(1);
    expect(snapshot.operations[0]).toMatchObject({
      kind: 'QUERY',
      typeName: 'Query',
      fieldName: 'products',
      resolverClass: 'ProductResolver',
      methodName: 'products',
    });
    expect(snapshot.stats.queries).toBe(1);
    expect(snapshot.stats.resolverClasses).toBe(1);
  });

  it('collects a @Mutation() method as a MUTATION operation', () => {
    @FakeResolver()
    class OrderResolver {
      createOrder() {}
    }
    FakeMutation('createOrder')(
      OrderResolver.prototype,
      'createOrder',
      Object.getOwnPropertyDescriptor(OrderResolver.prototype, 'createOrder')!,
    );

    const collector = new GraphQLOperationCollector(makeModulesContainer([OrderResolver]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations[0]).toMatchObject({
      kind: 'MUTATION',
      typeName: 'Mutation',
      fieldName: 'createOrder',
    });
    expect(snapshot.stats.mutations).toBe(1);
  });

  it('collects a @ResolveField() method as a FIELD operation grouped under its parent type', () => {
    @FakeResolver('Product')
    class ProductFieldResolver {
      variants() {}
    }
    FakeResolveField('variants')(
      ProductFieldResolver.prototype,
      'variants',
      Object.getOwnPropertyDescriptor(ProductFieldResolver.prototype, 'variants')!,
    );

    const collector = new GraphQLOperationCollector(makeModulesContainer([ProductFieldResolver]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations[0]).toMatchObject({
      kind: 'FIELD',
      typeName: 'Product',
      fieldName: 'variants',
      resolverClass: 'ProductFieldResolver',
    });
    expect(snapshot.stats.fields).toBe(1);
  });

  it('falls back to the method name when no explicit field name is given', () => {
    @FakeResolver()
    class PlainResolver {
      health() {}
    }
    FakeQuery()(
      PlainResolver.prototype,
      'health',
      Object.getOwnPropertyDescriptor(PlainResolver.prototype, 'health')!,
    );

    const collector = new GraphQLOperationCollector(makeModulesContainer([PlainResolver]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations[0].fieldName).toBe('health');
  });

  it('skips providers that are not decorated with @Resolver()', () => {
    class PlainService {
      doWork() {}
    }

    const collector = new GraphQLOperationCollector(makeModulesContainer([PlainService]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations).toEqual([]);
    expect(snapshot.stats.resolverClasses).toBe(0);
  });

  it('skips methods on a resolver that carry no GraphQL decorator', () => {
    @FakeResolver()
    class MixedResolver {
      products() {}
      helper() {}
    }
    FakeQuery('products')(
      MixedResolver.prototype,
      'products',
      Object.getOwnPropertyDescriptor(MixedResolver.prototype, 'products')!,
    );

    const collector = new GraphQLOperationCollector(makeModulesContainer([MixedResolver]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations).toHaveLength(1);
    expect(snapshot.operations[0].methodName).toBe('products');
  });

  it('collects guards declared with @UseGuards on the resolver method', () => {
    class AuthGuard {}

    @FakeResolver()
    class GuardedResolver {
      secretData() {}
    }
    const descriptor = Object.getOwnPropertyDescriptor(GuardedResolver.prototype, 'secretData')!;
    FakeQuery('secretData')(GuardedResolver.prototype, 'secretData', descriptor);
    Reflect.defineMetadata(GUARDS_METADATA, [AuthGuard], descriptor.value);

    const collector = new GraphQLOperationCollector(makeModulesContainer([GuardedResolver]), reflector);
    const snapshot = collector.collect();

    expect(snapshot.operations[0].chain.guards).toEqual(['AuthGuard']);
  });
});
