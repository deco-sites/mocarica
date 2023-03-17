import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_ADD_LINES_MUTATION = gql`
mutation CartAddItem($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      ...ShopifyCartFragment
    }
  }
}
`;

export default SHOPIFY_ADD_LINES_MUTATION;
