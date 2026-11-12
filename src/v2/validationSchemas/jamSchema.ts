import { Schema } from 'express-validator';

const uniqueBy = (items: unknown, key: string) => {
  const ids = (items as Record<string, unknown>[]).map((item) => item[key]);

  return new Set(ids).size === ids.length;
};

export const TRANSACTION_STATUSES = [
  'CONSUMED',
  'SOLD',
  'GIVEN_AWAY',
  'PROMOTION',
  'OTHER',
];

const positiveInt = (field: string) => ({
  notEmpty: { errorMessage: `Field "${field}" is required` },
  isInt: {
    options: { min: 1 },
    errorMessage: `Field "${field}" must be an integer >= 1`,
  },
  toInt: true,
});

const nonZeroInt = (field: string) => ({
  custom: {
    options: (value: unknown) =>
      Number.isInteger(Number(value)) && Number(value) !== 0 && value !== '',
    errorMessage: `Field "${field}" must be a non-zero integer`,
  },
  toInt: true,
});

const nonNegativeNumber = (field: string) => ({
  custom: {
    options: (value: unknown) =>
      value !== '' &&
      value !== null &&
      value !== undefined &&
      !Number.isNaN(Number(value)) &&
      Number(value) >= 0,
    errorMessage: `Field "${field}" must be a number >= 0`,
  },
});

const cupDataSchema = (field: string, idKey: string): Schema => ({
  [field]: {
    isArray: {
      options: { min: 1 },
      errorMessage: `Field "${field}" must be a non-empty array`,
    },
    custom: {
      options: (value: unknown) => uniqueBy(value, idKey),
      errorMessage: `Field "${field}" must not contain the same cup twice`,
    },
  },
});

export const orderSchema: Schema = {
  orderName: {
    optional: true,
    isString: { errorMessage: 'Field "orderName" must be a string' },
    trim: true,
  },
  orderTypeId: positiveInt('orderTypeId'),
  baseFruitIsFree: {
    isBoolean: {
      options: { strict: true },
      errorMessage: 'Field "baseFruitIsFree" must be boolean',
    },
  },
  otherExpensesMargin: {
    notEmpty: { errorMessage: 'Field "otherExpensesMargin" is required' },
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Field "otherExpensesMargin" must be an integer 1-100',
    },
    toInt: true,
  },
  ...cupDataSchema('cups', 'id'),
  'cups.*.id': positiveInt('cups.id'),
  'cups.*.label': {
    isString: { errorMessage: 'Field "cups.label" must be a string' },
  },
  'cups.*.numberOf': positiveInt('cups.numberOf'),
  'cups.*.cost': nonNegativeNumber('cups.cost'),
  'cups.*.sellingPrice': nonNegativeNumber('cups.sellingPrice'),
  'cups.*.total': nonNegativeNumber('cups.total'),
  fruits: {
    isArray: {
      options: { min: 1 },
      errorMessage: 'Field "fruits" must be a non-empty array',
    },
  },
  'fruits.*.fruitId': positiveInt('fruits.fruitId'),
  'fruits.*.grams': nonNegativeNumber('fruits.grams'),
  'fruits.*.price': nonNegativeNumber('fruits.price'),
  'fruits.*.total': nonNegativeNumber('fruits.total'),
};

export const orderQuerySchema: Schema = {
  orderTypeId: { in: ['query'], optional: true, isInt: { options: { min: 1 } }, toInt: true },
  priceStatus: {
    in: ['query'],
    optional: true,
    isIn: { options: [['1', '2']], errorMessage: 'Query "priceStatus" must be 1 or 2' },
    toInt: true,
  },
  year: { in: ['query'], optional: true, isInt: { options: { min: 2000, max: 2100 } }, toInt: true },
  month: { in: ['query'], optional: true, isInt: { options: { min: 1, max: 12 } }, toInt: true },
};

export const transactionSchema: Schema = {
  orderTypeId: positiveInt('orderTypeId'),
  status: {
    notEmpty: { errorMessage: 'Field "status" is required' },
    isIn: {
      options: [TRANSACTION_STATUSES],
      errorMessage: `Field "status" must be one of: ${TRANSACTION_STATUSES.join(', ')}`,
    },
  },
  note: {
    optional: true,
    isString: { errorMessage: 'Field "note" must be a string' },
    trim: true,
  },
  ...cupDataSchema('cupData', 'cupId'),
  'cupData.*.cupId': positiveInt('cupData.cupId'),
  'cupData.*.quantity': nonZeroInt('cupData.quantity'),
};

export const transactionQuerySchema: Schema = {
  orderTypeId: { in: ['query'], optional: true, isInt: { options: { min: 1 } }, toInt: true },
  transactionStatus: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [TRANSACTION_STATUSES],
      errorMessage: `Query "transactionStatus" must be one of: ${TRANSACTION_STATUSES.join(', ')}`,
    },
  },
  year: { in: ['query'], optional: true, isInt: { options: { min: 2000, max: 2100 } }, toInt: true },
  month: { in: ['query'], optional: true, isInt: { options: { min: 1, max: 12 } }, toInt: true },
};

export const inventoryInputSchema: Schema = {
  orderTypeId: positiveInt('orderTypeId'),
  ...cupDataSchema('cupData', 'cupId'),
  'cupData.*.cupId': positiveInt('cupData.cupId'),
  'cupData.*.quantity': nonZeroInt('cupData.quantity'),
};
