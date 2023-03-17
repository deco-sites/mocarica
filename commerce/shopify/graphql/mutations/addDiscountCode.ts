import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_ADD_DISCOUNT_CODE_MUTATION = gql`
  mutation CartAddDiscountCode($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...ShopifyCartFragment
      }
    }
  }
`;

export default SHOPIFY_ADD_DISCOUNT_CODE_MUTATION;
