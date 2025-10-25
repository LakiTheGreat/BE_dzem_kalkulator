export const tomatoOrderSchema = {
    cupTypeId: {
        notEmpty: {
            errorMessage: 'Field "cupTypeId" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "cupTypeId" must be a positive integer',
        },
        toInt: true,
    },
    totalExpenses: {
        notEmpty: {
            errorMessage: 'Field "totalExpenses" is required',
        },
        isInt: {
            options: { min: 0 },
            errorMessage: 'Field "totalExpenses" must be a non-negative integer',
        },
        toInt: true,
    },
    numOfCups: {
        notEmpty: {
            errorMessage: 'Field "numOf" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "numOf" must be a non-negative integer',
        },
        toInt: true,
    },
    userId: {
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "userId" must be a positive integer',
        },
        toInt: true,
    },
    isDeleted: {
        optional: true,
        isBoolean: {
            errorMessage: 'Field "isDeleted" must be boolean',
        },
        toBoolean: true,
    },
};
//# sourceMappingURL=tomatoSchema.js.map