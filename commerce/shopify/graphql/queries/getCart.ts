import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_CART_QUERY = gql`
  query CartGet($cartId: ID!) {
    cart(id: $cartId) {
      ...ShopifyCartFragment
    }
  }
`;

export default SHOPIFY_CART_QUERY;
