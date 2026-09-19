import { GraphQLSnapshot } from './types';

const BASE_URL = window.location.origin + '/graph-studio';

export async function fetchGraphQLOperations(): Promise<GraphQLSnapshot> {
  const response = await fetch(`${BASE_URL}/graphql`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GraphQL operations: ${response.statusText}`);
  }
  return response.json();
}
