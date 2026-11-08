export const inventorySchema = {
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
        // isInt: {
        //   options: { min: 0 },
        //   errorMessage: '"quantity" must be an integer >= 0',
        // },
        toInt: true,
    },
};
//# sourceMappingURL=inventorySchema.js.map