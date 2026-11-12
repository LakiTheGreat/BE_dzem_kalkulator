import { Schema } from 'express-validator';

export const BOUQUET_STATUSES = ['SOLD', 'GIVEN_AWAY', 'PROMOTION', 'OTHER'];

const statusError = `Field "status" must be one of: ${BOUQUET_STATUSES.join(', ')}`;

export const bouquetTransactionSchema: Schema = {
  note: {
    optional: true,
    isString: {
      errorMessage: 'Field "note" must be a string',
    },
    trim: true,
  },
  status: {
    notEmpty: {
      errorMessage: 'Field "status" is required',
    },
    isIn: {
      options: [BOUQUET_STATUSES],
      errorMessage: statusError,
    },
  },
  totalExpense: {
    notEmpty: {
      errorMessage: 'Field "totalExpense" is required',
    },
    isInt: {
      options: { min: 0 },
      errorMessage: 'Field "totalExpense" must be a non-negative integer',
    },
    toInt: true,
  },
  income: {
    notEmpty: {
      errorMessage: 'Field "income" is required',
    },
    isInt: {
      options: { min: 0 },
      errorMessage: 'Field "income" must be a non-negative integer',
    },
    toInt: true,
  },
  profit: {
    notEmpty: {
      errorMessage: 'Field "profit" is required',
    },
    isInt: {
      errorMessage: 'Field "profit" must be an integer',
    },
    toInt: true,
  },
  profitMargin: {
    notEmpty: {
      errorMessage: 'Field "profitMargin" is required',
    },
    isInt: {
      errorMessage: 'Field "profitMargin" must be an integer',
    },
    toInt: true,
  },
  isDeleted: {
    optional: true,
    isBoolean: {
      errorMessage: 'Field "isDeleted" must be boolean',
    },
    toBoolean: true,
  },
};

export const bouquetQuerySchema: Schema = {
  transactionStatus: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [BOUQUET_STATUSES],
      errorMessage: `Query "transactionStatus" must be one of: ${BOUQUET_STATUSES.join(', ')}`,
    },
  },
};
