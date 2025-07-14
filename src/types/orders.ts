export type OrderReq = {
  fruits: FruitInput[];
  cups: CupInput[];
  orderTypeId: number;
  orderName: string;
  baseFruitIsFree: boolean;
  otherExpensesMargin: number;
};

export type CupInput = {
  label: string;
  numberOf: string | number;
  cost: number;
  sellingPrice: number;
  total: number;
};

export type FruitInput = {
  grams: string;
  price: string;
  total: string;
  fruitName: number;
  fruitId: number;
};
