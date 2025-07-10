export const fruitSchema = {
    label: {
        notEmpty: { errorMessage: 'Field "value" is required' },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: 'Field "value" must be between 1 and 50 characters',
        },
    },
};
//# sourceMappingURL=fruitSchema.js.map