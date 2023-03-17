import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_CREATE_ACCOUNT_MUTATION = gql`
  mutation ShopifyLoginCreateAccount($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        createdAt
        displayName
        email
        firstName
        lastName
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
export default SHOPIFY_CREATE_ACCOUNT_MUTATION;
