export type OrderReq = {
  orderTypeId: number;
  orderName: string;
  numberOfSmallCups: number;
  numberOfLargeCups: number;
  totalExpense: number;
  totalValue: number;
  profit: number;
  profitMargin: number;
  baseFruitIsFree: boolean;
};
