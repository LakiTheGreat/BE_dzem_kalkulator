import { Schema } from 'express-validator';

export const constantSchema: Schema = {
  value: {
    notEmpty: {
      errorMessage: 'Field "value" is required',
    },
    isFloat: {
      options: { gt: 0 },
      errorMessage: 'Field "value" must be a number greater than 0',
    },
  },
  label: {
    notEmpty: {
      errorMessage: 'Field "label" is required',
    },
    isLength: {
      options: { min: 1 },
      errorMessage: 'Field "label" must be at least 1 character long',
    },
  },
};
