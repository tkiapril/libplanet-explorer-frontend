import React from 'react';
import { useQuery } from '@apollo/client';
import Link from 'components/Link';
import { TransactionList } from 'components/List';
import Timestamp from 'components/Timestamp';
import { listTxColumns } from 'lib/listColumns';
import useIdFromQuery from 'lib/useIdFromQuery';
import useSearchParams from 'lib/useSearchParams';
import {
  Block,
  BlockByHashDocument,
  BlockByHashQuery,
  Transaction,
} from 'src/gql/graphql';
import { ExplorerPageProps } from 'pages/_app';

export default function BlockPage({ endpoint, asPath }: ExplorerPageProps) {
  const [query] = useSearchParams(asPath);
  const hash = useIdFromQuery(query);
  const { loading, error, data } = useQuery<BlockByHashQuery>(
    BlockByHashDocument,
    {
      variables: { hash },
    }
  );
  if (loading) {
    return (
      <>
        <h2>Block Details</h2>
        <p>Loading&hellip;</p>
      </>
    );
  }
  if (error) {
    return (
      <>
        <h2>Block Details</h2>
        <p>
          Failed to load {hash} - {JSON.stringify(error.message)}
        </p>
      </>
    );
  }
  const block = data?.chainQuery.blockQuery?.block as Block;
  if (!block) {
    return (
      <>
        <h2>Block Details</h2>
        <p>
          No such block: <code>{hash}</code>
        </p>
      </>
    );
  }

  const minerLink = `/${endpoint.name}/account/?${block.miner}`;

  return (
    <>
      <h2>Block Details</h2>
      <dl>
        <dt>Index</dt>
        <dd>{block.index}</dd>
        <dt>Hash</dt>
        <dd>
          <code>{block.hash}</code>
        </dd>
        <dt>Nonce</dt>
        <dd>
          <code>{block.nonce}</code>
        </dd>
        <dt>Miner</dt>
        <dd>
          <Link href={minerLink}>
            <code>{block.miner}</code>
          </Link>
        </dd>
        <dt>Timestamp</dt>
        <dd>
          <Timestamp timestamp={block.timestamp} />
        </dd>
        <dt>State Root Hash</dt>
        <dd>
          <code>{block.stateRootHash}</code>
        </dd>
        <dt>Previous hash</dt>
        <dd>
          {block.previousBlock ? (
            <Link href={`/${endpoint.name}/block/?${block.previousBlock.hash}`}>
              <code>{block.previousBlock.hash}</code>
            </Link>
          ) : (
            'N/A'
          )}
        </dd>
        <dt>Difficulty</dt>
        <dd>{block.difficulty}</dd>
        <dt>Total Difficulty</dt>
        <dd>{block.totalDifficulty.toString()}</dd>
        <dt>Transactions</dt>
        {block.transactions.length > 0 ? (
          <TransactionList
            transactions={block.transactions as NonNullable<Transaction[]>}
            endpoint={endpoint}
            loading={loading}
            columns={listTxColumns(endpoint)}
          />
        ) : (
          <dd>
            <i>There is no transactions in this block.</i>
          </dd>
        )}
      </dl>
    </>
  );
}
