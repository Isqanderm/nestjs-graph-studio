/**
 * GraphQL resolver inspection endpoint.
 *
 * Deliberately a separate controller from `GraphStudioController` (REST routes/graph/health)
 * — GraphQL operations are served on their own path and never mixed into
 * `/graph-studio/routes`.
 */

import { Controller, Get, Inject } from '@nestjs/common';
import { GraphQLOperationCollector } from '../snapshot/graphql-collector';

@Controller('graph-studio/graphql')
export class GraphQlStudioController {
  constructor(
    @Inject(GraphQLOperationCollector) private readonly collector: GraphQLOperationCollector,
  ) {}

  @Get()
  getOperations() {
    return this.collector.collect();
  }
}
