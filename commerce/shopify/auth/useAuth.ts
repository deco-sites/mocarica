import { fetchGraphQL } from "$store/commerce/shopify/utils/fetchApi.ts";
import SHOPIFY_CREATE_ACCOUNT_MUTATION from "$store/commerce/shopify/graphql/mutations/createAccount.ts";
import SHOPIFY_LOGIN_MUTATION from "$store/commerce/shopify/graphql/mutations/login.ts";
import SHOPIFY_CUSTOMER_QUERY from "$store/commerce/shopify/graphql/queries/getCustomer.ts";

const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  await fetchGraphQL(SHOPIFY_LOGIN_MUTATION, [], {
    email,
    password,
  });
};

interface ICustomerCreateInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

const createAccount = async ({
  email,
  password,
  acceptsMarketing,
  firstName,
  lastName,
  phone,
}: ICustomerCreateInput) => {
  await fetchGraphQL(SHOPIFY_CREATE_ACCOUNT_MUTATION, [], {
    email,
    password,
    acceptsMarketing,
    firstName,
    lastName,
    phone,
  });
};

const getCustomer = async ({
  customerAccessToken,
}: {
  customerAccessToken: string;
}) => {
  await fetchGraphQL(SHOPIFY_CUSTOMER_QUERY, [], {
    customerAccessToken,
  });
};

const state = {
  login,
  createAccount,
  getCustomer,
};

export const useAuth = () => state;
