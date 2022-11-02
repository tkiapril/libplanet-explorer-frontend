export interface GraphQLEndPoint {
  name: string;
  uri: string;
}

if (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINTS === undefined) {
  throw Error('NEXT_PUBLIC_GRAPHQL_ENDPOINTS environment variable is required');
}

export const GRAPHQL_ENDPOINTS = JSON.parse(
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINTS
) as GraphQLEndPoint[];

export function getEndpointByName(name: string) {
  for (const endpoint of GRAPHQL_ENDPOINTS) {
    if (endpoint.name === name) {
      return endpoint;
    }
  }
  return null;
}
