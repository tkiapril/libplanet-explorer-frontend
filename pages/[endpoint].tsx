import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Checkbox, Pivot, PivotItem } from '@fluentui/react';

import { BlockList, TransactionList } from 'components/List';
import OffsetSwitch from 'components/OffsetSwitch';

import getServerSideProps, {
  CommonPageProps,
} from 'lib/getCommonServerSideProps';
import { listTxColumns, mainMineColumns } from 'lib/listColumns';
import useOffset, { limit } from 'lib/useOffset';

import {
  Block,
  BlockListDocument,
  BlockListQuery,
  Transaction,
  TransactionListDocument,
  TransactionListQuery,
} from 'src/gql/graphql';

const POLL_INTERVAL = 2000;
const ROUND_DIGITS = 4;

export default function Summary({ endpoint, resolvedUrl }: CommonPageProps) {
  let blocks = null,
    blockList,
    transactions = null,
    transactionList;
  const [offset, olderHandler, newerHandler] = useOffset(resolvedUrl);
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset, limit, excludeEmptyTxs },
    pollInterval: POLL_INTERVAL,
  });
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionListQuery>(TransactionListDocument, {
    variables: { offset, limit, desc: true },
    pollInterval: POLL_INTERVAL,
  });
  if (blocksError) {
    console.error(blocksError);
    blockList = <p>{blocksError.message}</p>;
  } else {
    if (!blocksLoading) {
      blocks = blocksData?.chainQuery.blockQuery?.blocks as Block[] | null;
    }
    blockList = (
      <BlockList
        blocks={blocks}
        loading={blocksLoading}
        columns={mainMineColumns(endpoint)}
        endpoint={endpoint}
      />
    );
  }
  if (transactionsError) {
    console.error(transactionsError);
    transactionList = <p>{transactionsError.message}</p>;
  } else {
    if (!transactionsLoading) {
      transactions = transactionsData?.chainQuery.transactionQuery
        ?.transactions as Transaction[] | null;
    }
    transactionList = (
      <TransactionList
        columns={listTxColumns(endpoint)}
        endpoint={endpoint}
        loading={transactionsLoading}
        transactions={transactions}
      />
    );
  }
  return (
    <main>
      <Checkbox
        label="Include blocks having any tx"
        checked={excludeEmptyTxs}
        onChange={() => setExcludeEmptyTxs(!excludeEmptyTxs)}
      />
      <SummaryCards blocks={blocks} />
      <OffsetSwitch
        olderHandler={olderHandler}
        newerHandler={newerHandler}
        disable={{
          older: blocksLoading || transactionsLoading,
          newer: blocksLoading || transactionsLoading || offset < 1,
        }}
      />
      <Pivot>
        <PivotItem headerText="Blocks">{blockList}</PivotItem>
        <PivotItem headerText="Transactions">{transactionList}</PivotItem>
      </Pivot>
    </main>
  );
}

function SummaryCards({ blocks }: { blocks: Block[] | null }) {
  if (blocks === null)
    return <Cards interval={0} difficultyAverage={0} totalTxNumber={0} />;

  const timestamps: Date[] = blocks.map(block => new Date(block.timestamp));

  let interval = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    interval += +timestamps[i] - +timestamps[i + 1];
  }
  interval /= (timestamps.length - 1) * 1000;

  const difficulties = blocks.map(block => block.difficulty);
  const difficultyAverage =
    difficulties.reduce((d, sum) => d + sum, 0) / difficulties.length;

  const txNumbers = blocks.map(block => block.transactions.length);
  const totalTxNumber = txNumbers.reduce((a, b) => a + b, 0);
  return (
    <Cards
      interval={interval}
      difficultyAverage={difficultyAverage}
      totalTxNumber={totalTxNumber}
    />
  );
}

function Cards({
  interval,
  difficultyAverage,
  totalTxNumber,
}: {
  interval: number;
  difficultyAverage: number;
  totalTxNumber: number;
}) {
  return (
    <div className="cards">
      <div className="card" key="interval">
        <strong>{interval.toFixed(ROUND_DIGITS)}</strong> sec
        <p>Average interval in this page</p>
      </div>
      <div className="card" key="difficultyAverage">
        <strong>{Math.floor(difficultyAverage).toLocaleString()}</strong>
        <p>Average difficulty in this page</p>
      </div>
      <div className="card" key="total-tx-number">
        <strong>{Math.floor(totalTxNumber).toLocaleString()}</strong>
        <p>Total txs in this page</p>
      </div>
    </div>
  );
}

export { getServerSideProps };