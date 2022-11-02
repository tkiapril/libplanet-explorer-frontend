import 'styles/globals.css';
import App, { AppInitialProps } from 'next/app';
import type { AppContext, AppProps } from 'next/app';
import { initializeIcons } from '@fluentui/react';
import {
  getEndpointByName,
  GraphQLEndPoint,
  GRAPHQL_ENDPOINTS,
} from 'lib/graphQLEndPoint';

// FIXME: is this the right place to place this?
initializeIcons();

export default function ExplorerApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  );
}

ExplorerApp.getInitialProps = async (appContext: AppContext) => {
  const pageProps = await App.getInitialProps(appContext);
  const { asPath, query } = appContext.ctx;
  /// XXX when a query parameter is given as a URL slug, it overrides all
  /// parameters with the same name given in the query string, and appears by
  /// itself as a string.
  const endpoint = query.endpoint
    ? Array.isArray(query.endpoint)
      ? getEndpointByName(query.endpoint[-1])
      : getEndpointByName(query.endpoint)
    : GRAPHQL_ENDPOINTS[0];
  return {
    pageProps: { ...pageProps, endpoint, asPath },
  };
};

export interface ExplorerPageProps extends AppInitialProps {
  endpoint: GraphQLEndPoint;
  asPath: string;
}
