export const cupCreateSchema = {
    label: {
        notEmpty: {
            errorMessage: 'Field "label" is required',
        },
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Field "label" must be between 3 and 50 characters',
        },
        trim: true,
    },
    costId: {
        notEmpty: {
            errorMessage: 'Field "costId" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "costId" must be a valid integer ID',
        },
        toInt: true,
    },
    valueId: {
        notEmpty: {
            errorMessage: 'Field "valueId" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "valueId" must be a valid integer ID',
        },
        toInt: true,
    },
};
export const cupCostSchema = {
    label: {
        notEmpty: {
            errorMessage: 'Field "label" is required',
        },
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Field "label" must be between 3 and 50 characters',
        },
        trim: true,
    },
    value: {
        notEmpty: {
            errorMessage: 'Field "value" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "value" must be a positive integer',
        },
        toInt: true,
    },
};
export const cupValueSchema = {
    label: {
        notEmpty: {
            errorMessage: 'Field "label" is required',
        },
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Field "label" must be between 3 and 50 characters',
        },
        trim: true,
    },
    value: {
        notEmpty: {
            errorMessage: 'Field "value" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "value" must be a positive integer',
        },
        toInt: true,
    },
};
//# sourceMappingURL=cupSchema.js.map