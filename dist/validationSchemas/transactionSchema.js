export const transactionSchema = {
    orderTypeId: {
        notEmpty: {
            errorMessage: 'Field "orderTypeId" is required',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Field "orderTypeId" must be a positive integer',
        },
        toInt: true,
    },
    status: {
        notEmpty: {
            errorMessage: 'Field "status" is required',
        },
        isIn: {
            options: [['CONSUMED', 'SOLD', 'GIVEN_AWAY', 'OTHER']],
            errorMessage: 'Field "status" must be one of: CONSUMED, SOLD, GIVEN_AWAY, OTHER',
        },
    },
    cupData: {
        notEmpty: {
            errorMessage: 'Field "cupData" is required',
        },
        isArray: {
            errorMessage: 'Field "cupData" must be an array',
        },
    },
    'cupData.*.cupId': {
        notEmpty: {
            errorMessage: 'Each cupData item must have a "cupId"',
        },
        isInt: {
            options: { min: 1 },
            errorMessage: '"cupId" must be a positive integer',
        },
        toInt: true,
    },
    'cupData.*.quantity': {
        notEmpty: {
            errorMessage: 'Each cupData item must have a "quantity"',
        },
        toInt: true,
    },
};
//# sourceMappingURL=transactionSchema.js.map