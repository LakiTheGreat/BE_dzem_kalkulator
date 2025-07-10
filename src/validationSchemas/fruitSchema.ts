import { Schema } from 'express-validator';

export const fruitSchema: Schema = {
  label: {
    notEmpty: { errorMessage: 'Field "value" is required' },
    isLength: {
      options: { min: 1, max: 50 },
      errorMessage: 'Field "value" must be between 1 and 50 characters',
    },
  },
};
