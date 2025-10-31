import { GraphSnapshot, RouteMeta } from './types';

const BASE_URL = window.location.origin + '/graph-studio';

export async function fetchGraph(): Promise<GraphSnapshot> {
  const response = await fetch(`${BASE_URL}/graph`);
  if (!response.ok) {
    throw new Error(`Failed to fetch graph: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchRoutes(): Promise<{ routes: RouteMeta[]; stats: any }> {
  const response = await fetch(`${BASE_URL}/routes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch routes: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchHealth(): Promise<any> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch health: ${response.statusText}`);
  }
  return response.json();
}

