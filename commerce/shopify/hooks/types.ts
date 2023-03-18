import { Cart } from "$store/commerce/shopify/types.ts";

export interface INewCartCreate {
  cartCreate: INewCartGet;
}

export interface ICartLinesCreate {
  cartLinesUpdate: INewCartGet;
}

export interface ICartLinesAdd {
  cartLinesAdd: INewCartGet;
}

export interface ICartDiscountCodesUpdate {
  cartDiscountCodesUpdate: INewCartGet;
}

export interface INewCartGet {
  cart: Cart;
}

export interface AddCouponsToCartOptions {
  text: string;
}

export interface AddItemsOptions {
  orderItems: Array<{
    quantity: number;
    seller: string;
    id: string;
    index?: number;
    price?: number;
  }>;
  allowedOutdatedData?: Array<"paymentData">;
}

export interface IRequestError {
  code: string;
  message: string;
}
