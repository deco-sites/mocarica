import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_CART_UPDATE_MUTATION = gql`
  mutation CartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...ShopifyCartFragment
      }
    }
  }
`;

export default SHOPIFY_CART_UPDATE_MUTATION;
