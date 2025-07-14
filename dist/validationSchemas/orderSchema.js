export const createOrderSchema = {
    orderName: {
        optional: true, // since orderName has default ""
        isString: {
            errorMessage: 'Field "orderName" must be a string',
        },
    },
    otherExpensesMargin: {
        isInt: {
            options: { min: 1, max: 100 },
            errorMessage: 'Field "otherExpensesMargin" must be an integer between 1 and 100',
        },
    },
    orderTypeId: {
        notEmpty: {
            errorMessage: 'Field "orderTypeId" is required',
        },
        isInt: {
            options: { gt: 0 },
            errorMessage: 'Field "orderTypeId" must be a positive integer',
        },
    },
    baseFruitIsFree: {
        optional: true,
        isBoolean: {
            errorMessage: 'Field "baseFruitIsFree" must be boolean',
        },
        toBoolean: true,
    },
    cups: {
        notEmpty: {
            errorMessage: 'Field "cups" is required',
        },
        isArray: {
            errorMessage: 'Field "cups" must be an array',
        },
    },
    'cups.*.label': {
        notEmpty: {
            errorMessage: 'Cup label is required',
        },
        isString: {
            errorMessage: 'Cup label must be a string',
        },
    },
    'cups.*.numberOf': {
        notEmpty: {
            errorMessage: 'Cup numberOf is required',
        },
        isInt: {
            errorMessage: 'Cup numberOf must be an integer',
        },
        toInt: true,
    },
    'cups.*.cost': {
        notEmpty: {
            errorMessage: 'Cup cost is required',
        },
        isInt: {
            errorMessage: 'Cup cost must be an integer',
        },
        toInt: true,
    },
    'cups.*.sellingPrice': {
        notEmpty: {
            errorMessage: 'Cup sellingPrice is required',
        },
        isInt: {
            errorMessage: 'Cup sellingPrice must be an integer',
        },
        toInt: true,
    },
    'cups.*.total': {
        notEmpty: {
            errorMessage: 'Cup total is required',
        },
        isInt: {
            errorMessage: 'Cup total must be an integer',
        },
        toInt: true,
    },
    fruits: {
        optional: true,
        isArray: {
            errorMessage: 'Field "fruits" must be an array',
        },
    },
    'fruits.*.grams': {
        notEmpty: {
            errorMessage: 'Fruit grams is required',
        },
        isString: {
            errorMessage: 'Fruit grams must be a string',
        },
    },
    // 'fruits.*.price': {
    //   notEmpty: {
    //     errorMessage: 'Fruit price is required',
    //   },
    //   isString: {
    //     errorMessage: 'Fruit price must be a string',
    //   },
    // },
    // 'fruits.*.total': {
    //   notEmpty: {
    //     errorMessage: 'Fruit total is required',
    //   },
    //   isString: {
    //     errorMessage: 'Fruit total must be a string',
    //   },
    // },
    'fruits.*.fruitId': {
        notEmpty: {
            errorMessage: 'Fruit fruitId is required',
        },
        isInt: {
            errorMessage: 'Fruit fruitId must be an integer',
        },
        toInt: true,
    },
};
//# sourceMappingURL=orderSchema.js.map