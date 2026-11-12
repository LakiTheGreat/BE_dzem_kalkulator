import { Schema } from 'express-validator';

// Used for both POST and PUT (v1 also required all three fields on PUT).
// Label is trimmed before validation, so "   " counts as empty.
export const cupSchema: Schema = {
  label: {
    trim: true,
    isString: { errorMessage: 'Field "label" must be a string' },
    notEmpty: { errorMessage: 'Field "label" is required' },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Field "label" must be between 3 and 50 characters',
    },
  },
  costId: {
    notEmpty: { errorMessage: 'Field "costId" is required' },
    isInt: {
      options: { min: 1 },
      errorMessage: 'Field "costId" must be a valid integer ID',
    },
    toInt: true,
  },
  valueId: {
    notEmpty: { errorMessage: 'Field "valueId" is required' },
    isInt: {
      options: { min: 1 },
      errorMessage: 'Field "valueId" must be a valid integer ID',
    },
    toInt: true,
  },
};
