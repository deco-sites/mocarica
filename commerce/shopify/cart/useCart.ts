import { signal } from "@preact/signals";
import { OrderForm } from "$store/commerce/vtex/types.ts";
import { toOrderForm } from "$store/commerce/shopify/transform.ts";
import { Cart } from "$store/commerce/shopify/types.ts";
import { fetchGraphQL, gql } from "$store/commerce/shopify/utils/fetchApi.ts";

interface INewCartCreate {
  cartCreate: INewCartGet;
}
interface ICartLinesCreate {
  cartLinesUpdate: INewCartGet;
}
interface ICartLinesAdd {
  cartLinesAdd: INewCartGet;
}
interface ICartDiscountCodesUpdate {
  cartDiscountCodesUpdate: INewCartGet;
}

interface INewCartGet {
  cart: Cart;
}

const cart = signal<OrderForm | null>(null);
const loading = signal<boolean>(true);

const CartFragment = gql`
  fragment CartFragment on Cart {
    id
    totalQuantity
    createdAt
    checkoutUrl
    updatedAt
    discountCodes {
      applicable
      code
    }
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }

      checkoutChargeAmount {
        amount
        currencyCode
      }
    }

    lines(first: 10) {
      edges {
        node {
          id
          quantity
          cost {
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
              }
              product {
                title
              }
            }
          }
        }
      }
    }
  }
`;

interface AddCouponsToCartOptions {
  text: string;
}

const addCouponsToCart = async ({ text }: AddCouponsToCartOptions) => {
  const data = (await fetchGraphQL<ICartDiscountCodesUpdate>(
    gql`
        mutation CartAddDiscountCode($cartId: ID!, $discountCodes: [String!]) {
          cartDiscountCodesUpdate(
            cartId: $cartId
            discountCodes: $discountCodes
          ) {
            cart {
              ...CartFragment
            }
          }
        }
      `,
    [CartFragment],
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
  const data = (await fetchGraphQL<INewCartCreate>(
    gql`
        mutation CartCreate {
          cartCreate(input: {}) {
            cart {
              ...CartFragment
            }
          }
        }
      `,
    [CartFragment],
  )) ?? null;

  return data;
};

const getCartId = async (cartId: string): Promise<INewCartGet | null> => {
  const data = (await fetchGraphQL<INewCartGet>(
    gql`
        query CartGet($cartId: ID!) {
          cart(id: $cartId) {
            ...CartFragment
          }
        }
      `,
    [CartFragment],
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
    gql`
        mutation CartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
              ...CartFragment
            }
          }
        }
      `,
    [CartFragment],
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

// const removeAllItems = async () => {
//   cart.value = await fetchAPI<OrderForm>(
//     `/api/checkout/pub/orderForm/${cart.value!.orderFormId}/items/removeAll`,
//     { method: "POST" }
//   );
// };

interface AddItemsOptions {
  orderItems: Array<{
    quantity: number;
    seller: string;
    id: string;
    index?: number;
    price?: number;
  }>;
  allowedOutdatedData?: Array<"paymentData">;
}

const addItems = async ({
  orderItems,
  allowedOutdatedData: _ = ["paymentData"],
}: AddItemsOptions) => {
  const data = (await fetchGraphQL<ICartLinesAdd>(
    gql`
        mutation CartAddItem($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              ...CartFragment
            }
          }
        }
      `,
    [CartFragment],
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
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/removeAll */
  //   removeAllItems: () =>
  //     withPQueue(() => withCart(() => withLoading(removeAllItems))),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId- */
  //   removeAllPersonalData: () =>
  //     withPQueue(() => withCart(() => withLoading(removeAllPersonalData))),
  // /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update */
  updateItems: (opts: UpdateItemsOptions) =>
    withPQueue(() => withCart(() => withLoading(() => updateItems(opts)))),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items */
  addItems: (opts: AddItemsOptions) =>
    withPQueue(() => withCart(() => withLoading(() => addItems(opts)))),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#put-/api/checkout/pub/orderForm/-orderFormId-/items/-itemIndex-/price */
  //   changePrice: (opts: ChangePriceOptions) =>
  //     withPQueue(() => withCart(() => withLoading(() => changePrice(opts)))),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#patch-/api/checkout/pub/orderForm/-orderFormId-/profile */
  //   ignoreProfileData: (opts: IgnoreProfileDataOptions) =>
  //     withPQueue(() =>
  //       withCart(() => withLoading(() => ignoreProfileData(opts)))
  //     ),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm/-orderFormId-/installments */
  //   getCartInstallments: (opts: CartInstallmentsOptions) =>
  //     withPQueue(() =>
  //       withCart(() => withLoading(() => getCartInstallments(opts)))
  //     ),
  //   /** @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/coupons */
  addCouponsToCart: (opts: AddCouponsToCartOptions) =>
    withPQueue(() => withCart(() => withLoading(() => addCouponsToCart(opts)))),
};

export const useCart = () => state;
