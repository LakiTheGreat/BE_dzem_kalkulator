export const lookupSchema = {
    value: {
        notEmpty: { errorMessage: 'Field "value" is required' },
        isLength: {
            options: { min: 3, max: 7 },
            errorMessage: 'Field "value" must be between 3 and 7 characters',
        },
    },
    menuItemLabel: {
        notEmpty: { errorMessage: 'Field "menuItemLabel" is required' },
        isLength: {
            options: { min: 3, max: 7 },
            errorMessage: 'Field "menuItemLabel" must be between 3 and 7 characters',
        },
    },
};
//# sourceMappingURL=testSchema.js.map