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
export const tomatoTransactionSchema = {
    note: {
        isString: {
            errorMessage: 'Field "note" must be a string',
        },
        trim: true,
    },
    status: {
        notEmpty: {
            errorMessage: 'Field "status" is required',
        },
        isIn: {
            options: [['CONSUMED', 'SOLD', 'GIVEN_AWAY', 'PROMOTION', 'OTHER']],
            errorMessage: 'Field "status" must be one of: CONSUMED, SOLD, GIVEN_AWAY, OTHER, PROMOTION',
        },
    },
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
    numOfCups: {
        notEmpty: {
            errorMessage: 'Field "numOfCups" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "numOfCups" must be a positive integer',
        },
        toInt: true,
    },
    pricePerCup: {
        notEmpty: {
            errorMessage: 'Field "pricePerCup" is required',
        },
        isInt: {
            options: { min: 0 },
            errorMessage: 'Field "pricePerCup" must be a non-negative integer',
        },
        toInt: true,
    },
};
//# sourceMappingURL=tomatoSchema.js.map