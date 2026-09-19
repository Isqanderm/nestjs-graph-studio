// src/__tests__/integration/graphql.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Injectable, UseGuards, CanActivate, Module } from '@nestjs/common';
import request from 'supertest';
import { GraphStudioModule } from '../../module';

const GQL_RESOLVER_TYPE_METADATA = 'graphql:resolver_type';
const GQL_RESOLVER_NAME_METADATA = 'graphql:resolver_name';
const GQL_RESOLVER_PROPERTY_METADATA = 'graphql:resolve_property';

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

function FakeResolveField(name?: string) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(GQL_RESOLVER_NAME_METADATA, name, descriptor.value);
    Reflect.defineMetadata(GQL_RESOLVER_PROPERTY_METADATA, true, descriptor.value);
    return descriptor;
  };
}

class TestAuthGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

@FakeResolver()
@Injectable()
class ProductResolver {
  @UseGuards(TestAuthGuard)
  products() {
    return [];
  }
}
FakeQuery('products')(
  ProductResolver.prototype,
  'products',
  Object.getOwnPropertyDescriptor(ProductResolver.prototype, 'products')!,
);

@FakeResolver('Product')
@Injectable()
class ProductFieldResolver {
  variants() {
    return [];
  }
}
FakeResolveField('variants')(
  ProductFieldResolver.prototype,
  'variants',
  Object.getOwnPropertyDescriptor(ProductFieldResolver.prototype, 'variants')!,
);

@Module({
  imports: [GraphStudioModule.forRoot({ enabled: true })],
  providers: [ProductResolver, ProductFieldResolver],
})
class TestGraphQLAppModule {}

describe('GraphStudioModule GraphQL integration', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestGraphQLAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes GraphQL operations on their own endpoint', async () => {
    const response = await request(server).get('/graph-studio/graphql').expect(200);

    expect(response.body.operations).toHaveLength(2);

    const query = response.body.operations.find((op: any) => op.kind === 'QUERY');
    expect(query).toMatchObject({
      kind: 'QUERY',
      typeName: 'Query',
      fieldName: 'products',
      resolverClass: 'ProductResolver',
    });
    expect(query.chain.guards).toEqual(['TestAuthGuard']);

    const field = response.body.operations.find((op: any) => op.kind === 'FIELD');
    expect(field).toMatchObject({
      kind: 'FIELD',
      typeName: 'Product',
      fieldName: 'variants',
      resolverClass: 'ProductFieldResolver',
    });
  });

  it('does not leak GraphQL resolvers into the REST routes endpoint', async () => {
    const response = await request(server).get('/graph-studio/routes').expect(200);

    const leaked = response.body.routes.find(
      (route: any) => route.controller === 'ProductResolver' || route.controller === 'ProductFieldResolver',
    );
    expect(leaked).toBeUndefined();
  });

  it('does not leak REST route data into the GraphQL endpoint', async () => {
    const response = await request(server).get('/graph-studio/graphql').expect(200);

    const leaked = response.body.operations.find((op: any) => op.resolverClass === 'HealthController');
    expect(leaked).toBeUndefined();
  });
});
