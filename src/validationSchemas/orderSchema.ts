import { Schema } from 'express-validator';

export const createOrderSchema: Schema = {
  orderTypeId: {
    notEmpty: {
      errorMessage: 'Field "orderTypeId" is required',
    },
    isInt: {
      options: { gt: 0 },
      errorMessage: 'Field "orderTypeId" must be a positive integer',
    },
  },
  orderName: {
    notEmpty: {
      errorMessage: 'Field "orderName" is required',
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Field "orderName" must be between 1 and 100 characters',
    },
  },
  numberOfSmallCups: {
    notEmpty: {
      errorMessage: 'Field "numberOfSmallCups" is required',
    },
    isInt: {
      errorMessage: 'Field "numberOfSmallCups" must be an integer',
    },
  },
  numberOfLargeCups: {
    notEmpty: {
      errorMessage: 'Field "numberOfLargeCups" is required',
    },
    isInt: {
      errorMessage: 'Field "numberOfLargeCups" must be an integer',
    },
  },
  totalExpense: {
    notEmpty: {
      errorMessage: 'Field "totalExpense" is required',
    },
    isInt: {
      errorMessage: 'Field "totalExpense" must be an integer',
    },
  },
  totalValue: {
    notEmpty: {
      errorMessage: 'Field "totalValue" is required',
    },
    isInt: {
      errorMessage: 'Field "totalValue" must be an integer',
    },
  },
  profit: {
    notEmpty: {
      errorMessage: 'Field "profit" is required',
    },
    isInt: {
      errorMessage: 'Field "profit" must be an integer',
    },
  },
  profitMargin: {
    notEmpty: {
      errorMessage: 'Field "profitMargin" is required',
    },
    isInt: {
      errorMessage: 'Field "profitMargin" must be an integer',
    },
  },
};
