import { Schema } from 'express-validator';

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
      options: [[, 'SOLD', 'GIVEN_AWAY', 'PROMOTION', 'OTHER']],
      errorMessage:
        'Field "status" must be one of: SOLD, GIVEN_AWAY, PROMOTION, OTHER',
    },
  },
  userId: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Field "userId" must be a positive integer',
    },
    toInt: true,
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
