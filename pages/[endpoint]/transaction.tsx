/*import React from 'react';
import { decode, BencodexValue } from 'bencodex';
import { JSONTree } from 'react-json-tree';
import { useQuery } from '@apollo/client';
import Link from 'components/Link';
import Timestamp from 'components/Timestamp';
import useSearchParams from 'lib/useSearchParams';
import useIdFromQuery from 'lib/useIdFromQuery';
import {
  Transaction,
  TransactionByIdDocument,
  TransactionByIdQuery,
} from 'src/gql/graphql';

import { ExplorerPageProps } from 'pages/_app';

type ObjectType =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null
  | undefined
  | ObjectType[];

function convertToObject(value: BencodexValue | undefined): ObjectType {
  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value).map(v => [v[0], convertToObject(v[1])])
    );
  } else if (value instanceof Array) {
    return value.map(v => convertToObject(v));
  } else if (value instanceof Uint8Array) {
    return '<binary> ' + value.toString('hex');
  } else if (typeof value === 'bigint') {
    return Number(value);
  } else {
    return value;
  }
}

// Used apathy theme and modified only base00 color.
// https://github.com/reduxjs/redux-devtools/blob/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes/apathy.js
const jsonTreeTheme = {
  scheme: 'apathy',
  author: 'jannik siebert (https://github.com/janniks)',
  base00: '#faf9f8',
  base01: '#0B342D',
  base02: '#184E45',
  base03: '#2B685E',
  base04: '#5F9C92',
  base05: '#81B5AC',
  base06: '#A7CEC8',
  base07: '#D2E7E4',
  base08: '#3E9688',
  base09: '#3E7996',
  base0A: '#3E4C96',
  base0B: '#883E96',
  base0C: '#963E4C',
  base0D: '#96883E',
  base0E: '#4C963E',
  base0F: '#3E965B',
};

export default function TransactionPage({
  endpoint,
  asPath,
}: ExplorerPageProps) {
  const [query] = useSearchParams(asPath);
  const id = useIdFromQuery(query);
  const { data, loading, error } = useQuery<TransactionByIdQuery>(
    TransactionByIdDocument,
    { variables: { id } }
  );
  if (error) {
    return (
      <>
        <h2>Transaction Details</h2>
        <p>
          Failed to load {id} - {JSON.stringify(error.message)}
        </p>
      </>
    );
  }
  if (loading) {
    return (
      <>
        <h2>Transaction Details</h2>
        <p>Loading&hellip;</p>
      </>
    );
  }
  const transaction = data?.chainQuery.transactionQuery
    ?.transaction as Transaction;
  if (!transaction) {
    return (
      <>
        <h2>Transaction Details</h2>
        <p>
          No such transaction: <code>{id}</code>
        </p>
      </>
    );
  }
  const actions = transaction.actions.map(action => (
    <dd key={action.raw}>
      <JSONTree
        data={convertToObject(decode(Buffer.from(action.raw, 'base64')))}
        theme={jsonTreeTheme}
        invertTheme={false}
        hideRoot={true}
      />
    </dd>
  ));
  return (
    <>
      <h2>Transaction Details</h2>
      <dl>
        <dt>Id</dt>
        <dd>
          <code>{transaction.id}</code>
        </dd>
        <dt>Nonce</dt>
        <dd>{transaction.nonce} </dd>
        <dt>Public Key</dt>
        <dd>
          <code>{transaction.publicKey}</code>
        </dd>
        <dt>Signature</dt>
        <dd>
          <code>{transaction.signature}</code>
        </dd>
        <dt>Signer</dt>
        <dd>
          <Link href={`/${endpoint.name}/account/?${transaction.signer}`}>
            <code>{transaction.signer}</code>
          </Link>
        </dd>
        <dt>Timestamp</dt>
        <dd>
          <Timestamp timestamp={transaction.timestamp} />
        </dd>
        <dt>Updated Addresses</dt>
        {transaction.updatedAddresses.map(address => (
          <dd key={address}>
            <Link href={`/${endpoint.name}/account/?${address}`}>
              <code>{address}</code>
            </Link>
          </dd>
        ))}
        <dt>Actions</dt>
        {actions}
      </dl>
    </>
  );
}
*/