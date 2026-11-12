import { Schema } from 'express-validator';

// PATCH /constants/:id. The column is an Int, so value must be an integer.
export const constantSchema: Schema = {
  value: {
    notEmpty: { errorMessage: 'Field "value" is required' },
    isInt: {
      options: { min: 1 },
      errorMessage: 'Field "value" must be a positive integer',
    },
    toInt: true,
  },
  label: {
    trim: true,
    isString: { errorMessage: 'Field "label" must be a string' },
    notEmpty: { errorMessage: 'Field "label" is required' },
  },
};
