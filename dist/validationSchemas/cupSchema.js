export const cupSchema = {
    value: {
        notEmpty: { errorMessage: 'Field "value" is required' },
        isInt: {
            options: { min: 1, max: 1000 },
            errorMessage: 'Field "value" must be an integer between 1 and 1000',
        },
        toInt: true,
    },
    menuItemLabel: {
        notEmpty: { errorMessage: 'Field "menuItemLabel" is required' },
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Field "menuItemLabel" must be between 3 and 50 characters',
        },
    },
};
//# sourceMappingURL=cupSchema.js.map