export const lookupSchema = {
    value: {
        notEmpty: { errorMessage: 'Field "value" is required' },
        isLength: {
            options: { min: 1, max: 15 },
            errorMessage: 'Field "value" must be between 1 and 15 characters',
        },
    },
    menuItemLabel: {
        notEmpty: { errorMessage: 'Field "menuItemLabel" is required' },
        isLength: {
            options: { min: 3, max: 15 },
            errorMessage: 'Field "menuItemLabel" must be between 3 and 15 characters',
        },
    },
};
//# sourceMappingURL=lookupsSchema.js.map