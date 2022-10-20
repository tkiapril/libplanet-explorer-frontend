import React, { useState } from 'react';
import { navigate } from 'gatsby-link';
import { Checkbox } from '@fluentui/react';

import Wrapper from '../components/Wrapper';
import List, { OmitListProps, BlockListProps } from '../components/List';
import OffsetSwitch from '../components/OffsetSwitch';

import {
  TransactionsByAccountComponent,
  Block,
  BlockListComponent,
  TransactionCommonFragment,
} from '../generated/graphql';

import { IndexPageProps } from '../pages';

import useQueryString from '../misc/useQueryString';
import useOffset, { limit } from '../misc/useOffset';
import { accountMineColumns, txColumns } from '../misc/columns';

import styled from '@emotion/styled';

type AccountPageProps = IndexPageProps;

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`;

const AccountPage: React.FC<AccountPageProps> = ({ location }) => {
  const hash = useQueryString(location)[0].slice(0, 42);

  const [txOffset, txOlderHandler, txNewerHandler] = useOffset(location, 'tx');
  const [mineOffset, mineOlderHandler, mineNewerHandler] = useOffset(
    location,
    'mine'
  );
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  return (
    <Wrapper>
      <h1>Account Details</h1>
      <p>
        Address: <b>{hash}</b>
      </p>

      <h2>Transactions count</h2>

      <TransactionsByAccountComponent
        variables={{ offset: txOffset, limit, involvedAddress: hash }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }

          if (loading) {
            return (
              <>
                <Ul>
                  <li>Signed Transaction: Loading…</li>
                  <li>Involved Transaction: Loading…</li>
                </Ul>
                <OffsetSwitch disable={{ older: true, newer: true }} />
                <TransactionListWrap loading={true} />
              </>
            );
          } else {
            const involvedTransactions =
              data &&
              data.chainQuery.transactionQuery &&
              data.chainQuery.transactionQuery.involvedTransactions
                ? data.chainQuery.transactionQuery.involvedTransactions
                : null;
            const signedTransactions =
              data &&
              data.chainQuery.transactionQuery &&
              data.chainQuery.transactionQuery.signedTransactions
                ? data.chainQuery.transactionQuery.signedTransactions
                : null;

            if (involvedTransactions === null || signedTransactions === null) {
              throw Error('transactions query failed');
            }

            return (
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
                    older: loading || new Set(signedTransactions.map(tx => tx.id).concat(involvedTransactions.map(tx => tx.id))).size < limit,
                    newer: loading || txOffset === 0,
                  }}
                />
                <TransactionListWrap
                  loading={false}
                  signed={signedTransactions}
                  involved={involvedTransactions}
                />
              </>
            );
          }
        }}
      </TransactionsByAccountComponent>
      <h2>Mined Blocks</h2>
      <BlockListComponent
        variables={{ offset: mineOffset, limit, excludeEmptyTxs, miner: hash }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }

          let blocks = null;
          if (!loading) {
            blocks =
              data &&
              data.chainQuery.blockQuery &&
              data.chainQuery.blockQuery.blocks
                ? (data.chainQuery.blockQuery.blocks as Block[])
                : null;
          }

          return (
            <>
              <Checkbox
                label="Include blocks having any tx"
                checked={excludeEmptyTxs}
                disabled={loading}
                onChange={() => {
                  setExcludeEmptyTxs(!excludeEmptyTxs);
                }}
              />
              <OffsetSwitch
                olderHandler={mineOlderHandler}
                newerHandler={mineNewerHandler}
                disable={{
                  older: loading || (!!blocks && blocks.length < limit),
                  newer: loading || mineOffset === 0,
                }}
              />
              <BlockList
                blocks={blocks}
                loading={loading}
                columns={accountMineColumns}
              />
            </>
          );
        }}
      </BlockListComponent>
    </Wrapper>
  );
};

export default AccountPage;

interface TransactionListWrapProps {
  signed?: TransactionCommonFragment[];
  involved?: TransactionCommonFragment[];
  loading: boolean;
}

const TransactionListWrap: React.FC<TransactionListWrapProps> = ({
  signed,
  involved,
  loading,
}) => (
  <>
    <h2>Signed Transactions{counter(signed)}</h2>
    <TransactionList
      loading={loading}
      transactions={signed ? signed : null}
      notFoundMessage={'No Signed Transactions'}
    />
    <h2>Involved Transactions{counter(involved)}</h2>
    <TransactionList
      loading={loading}
      transactions={involved ? involved : null}
      notFoundMessage={'No Involved Transactions'}
    />
  </>
);

const counter = (items?: unknown[]) =>
  items !== undefined && items.length > 0 && `: ${items.length}`;

interface TransactionListProps
  extends Omit<OmitListProps, 'columns' | 'items'> {
  transactions: TransactionCommonFragment[] | null;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  ...props
}) => (
  <List
    items={transactions}
    {...props}
    columns={txColumns}
    onItemInvoked={block => navigate(`/search/?${block.hash}`)}
  />
);

const BlockList: React.FC<BlockListProps> = ({ blocks, ...props }) => (
  <List
    items={blocks}
    {...props}
    onItemInvoked={(block: Block) => navigate(`/search/?${block.hash}`)}
  />
);