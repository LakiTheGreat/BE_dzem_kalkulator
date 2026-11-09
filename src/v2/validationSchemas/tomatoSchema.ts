import { Schema } from 'express-validator';

const TRANSACTION_STATUSES = [
  'CONSUMED',
  'SOLD',
  'GIVEN_AWAY',
  'PROMOTION',
  'OTHER',
];

const positiveInt = (field: string): Schema[string] => ({
  notEmpty: { errorMessage: `Field "${field}" is required` },
  isInt: {
    options: { min: 1 },
    errorMessage: `Field "${field}" must be a positive integer`,
  },
  toInt: true,
});

const nonNegativeInt = (field: string): Schema[string] => ({
  notEmpty: { errorMessage: `Field "${field}" is required` },
  isInt: {
    options: { min: 0 },
    errorMessage: `Field "${field}" must be a non-negative integer`,
  },
  toInt: true,
});

export const tomatoOrderSchema: Schema = {
  cupTypeId: positiveInt('cupTypeId'),
  totalExpenses: nonNegativeInt('totalExpenses'),
  numOfCups: positiveInt('numOfCups'),
};

export const tomatoTransactionSchema: Schema = {
  note: {
    isString: { errorMessage: 'Field "note" must be a string' },
    trim: true,
  },
  status: {
    notEmpty: { errorMessage: 'Field "status" is required' },
    isIn: {
      options: [TRANSACTION_STATUSES],
      errorMessage: `Field "status" must be one of: ${TRANSACTION_STATUSES.join(
        ', '
      )}`,
    },
  },
  cupTypeId: positiveInt('cupTypeId'),
  numOfCups: positiveInt('numOfCups'),
  pricePerCup: nonNegativeInt('pricePerCup'),
};

// Empty or 0 means "no filter" (the UI sends no param, older clients may send 0).
const periodQuery: Schema = {
  year: {
    in: ['query'],
    optional: { options: { values: 'falsy' } },
    isInt: {
      options: { min: 0 },
      errorMessage: 'Query "year" must be a non-negative integer',
    },
    toInt: true,
  },
  month: {
    in: ['query'],
    optional: { options: { values: 'falsy' } },
    isInt: {
      options: { min: 0, max: 12 },
      errorMessage: 'Query "month" must be an integer between 0 and 12',
    },
    toInt: true,
  },
};

export const tomatoOrderQuerySchema: Schema = periodQuery;

export const tomatoTransactionQuerySchema: Schema = {
  ...periodQuery,
  transactionStatus: {
    in: ['query'],
    optional: { options: { values: 'falsy' } },
    isIn: {
      options: [TRANSACTION_STATUSES],
      errorMessage: `Query "transactionStatus" must be one of: ${TRANSACTION_STATUSES.join(
        ', '
      )}`,
    },
  },
};
