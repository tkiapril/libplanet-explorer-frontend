import React from 'react';
import { Link } from '@fluentui/react';
import { navigate } from 'gatsby';
import useQueryString from '../misc/useQueryString';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { BlockByHashComponent, Transaction } from '../generated/graphql';
import Timestamp from '../components/Timestamp';
import { listTxColumns } from '../misc/columns';

interface BlockPageProps {
  location: Location;
}

const BlockPage: React.FC<BlockPageProps> = ({ location }) => {
  const [queryString] = useQueryString(location);
  const hash = queryString;
  return (
    <BlockByHashComponent variables={{ hash }}>
      {({ data, loading, error }) => {
        if (loading)
          return (
            <>
              <h2>Block Details</h2>
              <p>Loading&hellip;</p>
            </>
          );
        if (error)
          return (
            <>
              <h2>Block Details</h2>
              <p>
                Failed to load {hash} - {JSON.stringify(error.message)}
              </p>
            </>
          );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { block } = data!.chainQuery.blockQuery!;
        if (!block)
          return (
            <>
              <h2>Block Details</h2>
              <p>
                No such block: <code>{hash}</code>
              </p>
            </>
          );

        // FIXME: We'd better to use absolute paths and make Gatsby to
        // automatically rebase these absolute paths on the PATH_PREFIX
        // configuration.
        const minerLink = `../account/?${block.miner}`;
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
                  // FIXME: We'd better to use absolute paths and make Gatsby
                  // to automatically rebase these absolute paths on
                  // the PATH_PREFIX configuration.
                  <Link href={`./?${block.previousBlock.hash}`}>
                    <code>{block.previousBlock.hash}</code>
                  </Link>
                ) : (
                  'N/A'
                )}
              </dd>
              <dt>Difficulty</dt>
              <dd>{block.difficulty}</dd>
              <dt>Total Difficulty</dt>
              <dd>{block.totalDifficulty}</dd>
              <dt>Transactions</dt>
              {block.transactions.length > 0 ? (
                <TxList
                  txs={block.transactions as NonNullable<Transaction[]>}
                />
              ) : (
                <dd>
                  <i>There is no transactions in this block.</i>
                </dd>
              )}
            </dl>
          </>
        );
      }}
    </BlockByHashComponent>
  );
};

interface TxListProps {
  txs: Pick<Transaction, 'id' | 'signer' | 'timestamp'>[];
}

const TxList: React.FC<TxListProps> = ({ txs }) => {
  return (
    <DetailsList
      items={txs}
      columns={listTxColumns}
      selectionMode={SelectionMode.none}
      getKey={tx => tx.id}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      // FIXME: We'd better to use absolute paths and make Gatsby automatically
      // to rebase these absolute paths on the PATH_PREFIX configuration.
      onItemInvoked={tx => navigate(`../transaction/?${tx.id}`)}
    />
  );
};

export default BlockPage;
