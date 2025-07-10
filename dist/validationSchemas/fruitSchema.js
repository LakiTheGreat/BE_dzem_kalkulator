export const fruitSchema = {
    value: {
        notEmpty: { errorMessage: 'Field "value" is required' },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: 'Field "value" must be between 1 and 50 characters',
        },
    },
    menuItemLabel: {
        notEmpty: { errorMessage: 'Field "menuItemLabel" is required' },
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Field "menuItemLabel" must be between 3 and 50 characters',
        },
    },
};
export const patchFruitSchema = {
    label: {
        notEmpty: { errorMessage: 'Field "label" is required' },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: 'Field "label" must be between 1 and 50 characters',
        },
    },
};
//# sourceMappingURL=fruitSchema.js.map