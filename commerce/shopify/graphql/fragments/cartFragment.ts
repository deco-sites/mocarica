import { gql } from "$store/commerce/shopify/utils/fetchApi.ts";

const SHOPIFY_CART_FRAGMENT = gql`
  fragment ShopifyCartFragment on Cart {
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

    lines(first: 50) {
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

export default SHOPIFY_CART_FRAGMENT;
