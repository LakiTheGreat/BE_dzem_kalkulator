import { Schema } from 'express-validator';

// Shared by cupCosts and cupValues (POST and PUT). Label is trimmed before validation.
export const cupPriceSchema: Schema = {
  label: {
    trim: true,
    isString: { errorMessage: 'Field "label" must be a string' },
    notEmpty: { errorMessage: 'Field "label" is required' },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Field "label" must be between 3 and 50 characters',
    },
  },
  value: {
    notEmpty: { errorMessage: 'Field "value" is required' },
    isInt: {
      options: { min: 1 },
      errorMessage: 'Field "value" must be a positive integer',
    },
    toInt: true,
  },
};
