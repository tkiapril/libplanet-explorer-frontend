import { GetServerSidePropsContext } from 'next';
import {
  getEndpointByName,
  GraphQLEndPoint,
  GRAPHQL_ENDPOINTS,
} from 'lib/graphQLEndPoint';

export default async function getCommonServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<{ props: CommonPageProps }> {
  const { resolvedUrl, query } = ctx;
  /// XXX when a query parameter is given as a URL slug, it overrides all
  /// parameters with the same name given in the query string, and appears by
  /// itself as a string.
  /// FIXME when implementing arbitrary endpoint remove the type assertion and
  /// make it not null.
  const endpoint = (query.endpoint
    ? Array.isArray(query.endpoint)
      ? getEndpointByName(query.endpoint[-1])
      : getEndpointByName(query.endpoint)
    : GRAPHQL_ENDPOINTS[0]) as GraphQLEndPoint;
  return {
    props: { endpoint, resolvedUrl },
  };
}

export interface CommonPageProps {
  endpoint: GraphQLEndPoint;
  resolvedUrl: string;
}
