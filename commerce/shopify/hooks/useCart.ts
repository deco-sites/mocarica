import { signal } from "@preact/signals";
import { OrderForm } from "$store/commerce/vtex/types.ts";
import { toOrderForm } from "$store/commerce/shopify/transform.ts";
import { fetchGraphQL } from "$store/commerce/shopify/utils/fetchApi.ts";

import SHOPIFY_CART_FRAGMENT from "$store/commerce/shopify/graphql/fragments/cartFragment.ts";
import SHOPIFY_ADD_DISCOUNT_CODE_MUTATION from "$store/commerce/shopify/graphql/mutations/addDiscountCode.ts";
import SHOPIFY_CART_CREATE_MUTATION from "$store/commerce/shopify/graphql/mutations/cartCreate.ts";
import SHOPIFY_CART_QUERY from "$store/commerce/shopify/graphql/queries/getCart.ts";
import SHOPIFY_CART_UPDATE_MUTATION from "$store/commerce/shopify/graphql/mutations/cartUpdate.ts";
import SHOPIFY_ADD_LINES_MUTATION from "$store/commerce/shopify/graphql/mutations/cartAddLines.ts";
import {
  AddCouponsToCartOptions,
  AddItemsOptions,
  ICartDiscountCodesUpdate,
  ICartLinesAdd,
  ICartLinesCreate,
  INewCartCreate,
  INewCartGet,
} from "$store/commerce/shopify/hooks/types.ts";

const cart = signal<OrderForm | null>(null);
const loading = signal<boolean>(true);

const addCouponsToCart = async ({ text }: AddCouponsToCartOptions) => {
  const data = (await fetchGraphQL<ICartDiscountCodesUpdate>(
    SHOPIFY_ADD_DISCOUNT_CODE_MUTATION,
    [SHOPIFY_CART_FRAGMENT],
    {
      cartId: cart.value!.orderFormId,
      discountCodes: [text],
    },
  )) ?? null;

  const orderForm = data?.cartDiscountCodesUpdate
    ? toOrderForm(data.cartDiscountCodesUpdate.cart)
    : null;

  cart.value = orderForm;
};

const createCart = async (): Promise<INewCartCreate | null> => {
  const data =
    (await fetchGraphQL<INewCartCreate>(SHOPIFY_CART_CREATE_MUTATION, [
      SHOPIFY_CART_FRAGMENT,
    ])) ?? null;

  return data;
};

const getCartId = async (cartId: string): Promise<INewCartGet | null> => {
  const data = (await fetchGraphQL<INewCartGet>(
    SHOPIFY_CART_QUERY,
    [SHOPIFY_CART_FRAGMENT],
    {
      cartId,
    },
  )) ?? null;

  return data;
};

const getCart = async () => {
  const CART_ID_KEY = "@shopify/cart-id";
  const currentCartId = window.localStorage.getItem(CART_ID_KEY);

  const data = currentCartId
    ? await getCartId(currentCartId)
    : await createCart().then((newCart) => newCart?.cartCreate);

  const orderForm = data ? toOrderForm(data.cart) : null;

  if (orderForm) {
    window.localStorage.setItem(CART_ID_KEY, orderForm.orderFormId);
  }

  cart.value = orderForm;
};

interface UpdateItemsOptions {
  orderItems: Array<{
    quantity: number;
    index: number;
  }>;
  allowedOutdatedData?: Array<"paymentData">;
}

const updateItems = async ({
  orderItems,
  allowedOutdatedData: _ = ["paymentData"],
}: UpdateItemsOptions) => {
  const data = (await fetchGraphQL<ICartLinesCreate>(
    SHOPIFY_CART_UPDATE_MUTATION,
    [SHOPIFY_CART_FRAGMENT],
    {
      cartId: cart.value!.orderFormId,
      lines: orderItems.map((item) => ({
        id: cart.value!.items[item.index].id,
        quantity: item.quantity,
      })),
    },
  )) ?? null;

  const orderForm = data?.cartLinesUpdate
    ? toOrderForm(data.cartLinesUpdate.cart)
    : null;

  cart.value = orderForm;
};

const addItems = async ({
  orderItems,
  allowedOutdatedData: _ = ["paymentData"],
}: AddItemsOptions) => {
  const data = (await fetchGraphQL<ICartLinesAdd>(
    SHOPIFY_ADD_LINES_MUTATION,
    [SHOPIFY_CART_FRAGMENT],
    {
      cartId: cart.value!.orderFormId,
      lines: orderItems.map((item) => ({
        merchandiseId: item.id,
        quantity: item.quantity,
      })),
    },
  )) ?? null;

  const orderForm = data?.cartLinesAdd
    ? toOrderForm(data.cartLinesAdd.cart)
    : null;

  cart.value = orderForm;
};

type Middleware = (fn: () => Promise<void>) => Promise<void>;

const withCart: Middleware = async (cb) => {
  if (cart.value === null) {
    throw new Error("Missing cart");
  }

  return await cb();
};

const withLoading: Middleware = async (cb) => {
  try {
    loading.value = true;
    return await cb();
  } finally {
    loading.value = false;
  }
};

let queue = Promise.resolve();
const withPQueue: Middleware = (cb) => {
  queue = queue.then(cb);

  return queue;
};

// Start fetching the cart on client-side only
if (typeof document !== "undefined") {
  const _getCart = () => withPQueue(() => withLoading(getCart));

  _getCart();

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && _getCart(),
  );
}

const state = {
  loading,
  cart,

  // TODO: Find the correct @docs for the graphql api.
  // /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update */
  updateItems: (opts: UpdateItemsOptions) =>
    withPQueue(() => withCart(() => withLoading(() => updateItems(opts)))),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items */
  addItems: (opts: AddItemsOptions) =>
    withPQueue(() => withCart(() => withLoading(() => addItems(opts)))),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/coupons */
  addCouponsToCart: (opts: AddCouponsToCartOptions) =>
    withPQueue(() => withCart(() => withLoading(() => addCouponsToCart(opts)))),
};

export const useCart = () => state;
