import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { Checkbox } from '@fluentui/react';

import { BlockList, TransactionList } from 'components/List';
import OffsetSwitch from 'components/OffsetSwitch';
import Wrapper from 'components/Wrapper';

import getServerSideProps, {
  CommonPageProps,
} from 'lib/getCommonServerSideProps';
import { GraphQLEndPoint } from 'lib/graphQLEndPoint';
import { accountMineColumns, accountTxColumns } from 'lib/listColumns';
import useOffset, { limit } from 'lib/useOffset';
import useIdFromQuery from 'lib/useIdFromQuery';
import useSearchParams from 'lib/useSearchParams';

import {
  Block,
  BlockListDocument,
  BlockListQuery,
  Transaction,
  TransactionsByAccountDocument,
  TransactionsByAccountQuery,
  TransactionCommonFragment,
} from 'src/gql/graphql';

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`;

export default function AccountPage({
  endpoint,
  resolvedUrl,
}: CommonPageProps) {
  let transactionsInfo, blocksInfo;

  const [query] = useSearchParams(resolvedUrl);
  const hash = useIdFromQuery(query);

  const [txOffset, txOlderHandler, txNewerHandler] = useOffset(
    resolvedUrl,
    'tx'
  );
  const [mineOffset, mineOlderHandler, mineNewerHandler] = useOffset(
    resolvedUrl,
    'mine'
  );
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  const {
    loading: transactionsLoading,
    error: transactionsError,
    data: transactionsData,
  } = useQuery<TransactionsByAccountQuery>(TransactionsByAccountDocument, {
    variables: { offset: txOffset, limit, involvedAddress: hash },
  });
  const {
    loading: blocksLoading,
    error: blocksError,
    data: blocksData,
  } = useQuery<BlockListQuery>(BlockListDocument, {
    variables: { offset: mineOffset, limit, excludeEmptyTxs, miner: hash },
  });
  if (transactionsError) {
    console.log(transactionsError);
    transactionsInfo = <p>{transactionsError.message}</p>;
  } else if (transactionsLoading) {
    transactionsInfo = (
      <>
        <Ul>
          <li>Signed Transaction: Loading…</li>
          <li>Involved Transaction: Loading…</li>
        </Ul>
        <OffsetSwitch disable={{ older: true, newer: true }} />
        <TransactionListWrap loading={true} endpoint={endpoint} />
      </>
    );
  } else {
    const transactionQueryResult =
      transactionsData?.chainQuery.transactionQuery;
    const involvedTransactions =
      transactionQueryResult?.involvedTransactions as Transaction[];
    const signedTransactions =
      transactionQueryResult?.signedTransactions as Transaction[];

    if (involvedTransactions === null || signedTransactions === null) {
      console.log('transactions query failed');
      transactionsInfo = <p>Failed to retrieve transactions.</p>;
    }

    transactionsInfo = (
      <>
        <Ul>
          <li>
            Signed Transaction:{' '}
            {signedTransactions.length === limit
              ? (limit - 1).toString() + '+'
              : signedTransactions.length}
          </li>
          <li>
            Involved Transaction:{' '}
            {involvedTransactions.length === limit
              ? (limit - 1).toString() + '+'
              : involvedTransactions.length}
          </li>
        </Ul>
        <OffsetSwitch
          olderHandler={txOlderHandler}
          newerHandler={txNewerHandler}
          disable={{
            older:
              transactionsLoading ||
              new Set(
                signedTransactions
                  .map(tx => tx.id)
                  .concat(involvedTransactions.map(tx => tx.id))
              ).size < limit,
            newer: transactionsLoading || txOffset === 0,
          }}
        />
        <TransactionListWrap
          loading={false}
          signed={signedTransactions}
          involved={involvedTransactions}
          endpoint={endpoint}
        />
      </>
    );
  }
  if (blocksError) {
    console.error(blocksError);
    blocksInfo = <p>{blocksError.message}</p>;
  } else {
    const blocks = blocksLoading
      ? null
      : (blocksData?.chainQuery.blockQuery?.blocks as Block[] | null);
    blocksInfo = (
      <>
        <Checkbox
          label="Include blocks having any tx"
          checked={excludeEmptyTxs}
          disabled={blocksLoading}
          onChange={() => {
            setExcludeEmptyTxs(!excludeEmptyTxs);
          }}
        />
        <OffsetSwitch
          olderHandler={mineOlderHandler}
          newerHandler={mineNewerHandler}
          disable={{
            older: blocksLoading || (!!blocks && blocks.length < limit),
            newer: blocksLoading || mineOffset === 0,
          }}
        />
        <BlockList
          blocks={blocks}
          loading={blocksLoading}
          columns={accountMineColumns(endpoint)}
          endpoint={endpoint}
        />
      </>
    );
  }
  return (
    <Wrapper>
      <h1>Account Details</h1>
      <p>
        Address: <b>{hash}</b>
      </p>

      <h2>Transactions count</h2>

      {transactionsInfo}
      <h2>Mined Blocks</h2>
      {blocksInfo}
    </Wrapper>
  );
}

function TransactionListWrap({
  signed,
  involved,
  loading,
  endpoint,
}: {
  signed?: TransactionCommonFragment[];
  involved?: TransactionCommonFragment[];
  loading: boolean;
  endpoint: GraphQLEndPoint;
}) {
  return (
    <>
      <h2>Signed Transactions{counter(signed)}</h2>
      <TransactionList
        loading={loading}
        transactions={signed ? signed : null}
        notFoundMessage={'No Signed Transactions'}
        endpoint={endpoint}
        columns={accountTxColumns(endpoint)}
      />
      <h2>Involved Transactions{counter(involved)}</h2>
      <TransactionList
        loading={loading}
        transactions={involved ? involved : null}
        notFoundMessage={'No Involved Transactions'}
        endpoint={endpoint}
        columns={accountTxColumns(endpoint)}
      />
    </>
  );
}

function counter(items?: unknown[]) {
  return items !== undefined && items.length > 0 && `: ${items.length}`;
}

export { getServerSideProps };
