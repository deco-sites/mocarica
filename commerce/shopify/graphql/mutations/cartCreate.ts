import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_CART_CREATE_MUTATION = gql`
  mutation CartCreate {
    cartCreate(input: {}) {
      cart {
        ...ShopifyCartFragment
      }
    }
  }
`;

export default SHOPIFY_CART_CREATE_MUTATION;
