import { Schema } from 'express-validator';

export const testValidationSchema: Schema = {
  name: {
    notEmpty: { errorMessage: 'Field "Name" is required' },
    isLength: {
      options: { min: 3, max: 7 },
      errorMessage: 'Field "Name" must be between 3 and 7 characters',
    },
  },
};
