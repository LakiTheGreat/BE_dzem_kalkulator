import { Schema } from 'express-validator';

// Label is trimmed before validation, so "  ab " is rejected and "   " counts as empty.
export const fruitSchema: Schema = {
  label: {
    trim: true,
    isString: { errorMessage: 'Field "label" must be a string' },
    notEmpty: { errorMessage: 'Field "label" is required' },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Field "label" must be between 3 and 50 characters',
    },
  },
};
