import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_LOGIN_MUTATION = gql`
  mutation ShopifyLogin($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export default SHOPIFY_LOGIN_MUTATION;
