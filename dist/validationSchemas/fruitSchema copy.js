export const fruitSchema = {
    label: {
        notEmpty: { errorMessage: 'Field "value" is required' },
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Field "value" must be between 3 and 50 characters',
        },
    },
};
//# sourceMappingURL=fruitSchema%20copy.js.map