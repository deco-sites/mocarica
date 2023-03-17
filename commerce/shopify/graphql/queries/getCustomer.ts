import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const GET_CUSTOMER_QUERY = gql`
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      displayName
      email
      phone
      tags
      acceptsMarketing
      createdAt
    }
  }
`;

export default GET_CUSTOMER_QUERY;
