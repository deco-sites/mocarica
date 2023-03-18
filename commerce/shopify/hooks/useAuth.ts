import { signal } from "@preact/signals";
import { fetchGraphQL } from "$store/commerce/shopify/utils/fetchApi.ts";
import SHOPIFY_CREATE_ACCOUNT_MUTATION from "$store/commerce/shopify/graphql/mutations/createAccount.ts";
import SHOPIFY_LOGIN_MUTATION from "$store/commerce/shopify/graphql/mutations/login.ts";
import SHOPIFY_CUSTOMER_QUERY from "$store/commerce/shopify/graphql/queries/getCustomer.ts";
import { IRequestError } from "./types.ts";
import formatError, { IFormattedRequestError } from "../utils/formatError.ts";

const user = signal<ICustomer | null>(null);
const loading = signal<boolean>(true);

interface IShopifyLogin {
  customerAccessTokenCreate: {
    customerAccessToken?: {
      accessToken: string;
      expiresAt: string;
    };
    customerUserErrors: IRequestError[];
  };
}

export interface ILoginData {
  email: string;
  password: string;
}

const CART_ID_KEY = "@shopify/current-user";

const login = async ({
  email,
  password,
}: ILoginData): Promise<IFormattedRequestError[] | undefined> => {
  let data;
  try {
    data = (await fetchGraphQL<IShopifyLogin>(SHOPIFY_LOGIN_MUTATION, [], {
      input: {
        email,
        password,
      },
    })) ?? null;

    if (data?.customerAccessTokenCreate.customerAccessToken) {
      window.localStorage.setItem(
        CART_ID_KEY,
        data.customerAccessTokenCreate.customerAccessToken.accessToken,
      );
      getCustomer();

      return;
    }

    if (data?.customerAccessTokenCreate.customerUserErrors) {
      return formatError(data?.customerAccessTokenCreate.customerUserErrors);
    }
  } catch (_) {
    return [
      {
        code: "",
        message: "",
        formattedMessage:
          "Tentativas de login excedidas. Tente novamente mais tarde.",
      },
    ];
  }
};

const logout = () => {
  window.localStorage.removeItem(CART_ID_KEY);
  user.value = null;
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

interface ICustomer {
  acceptsMarketing: boolean;
  createdAt: string;
  displayName: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone: string;
  tags: string[];
}

interface IGetCustomer {
  customer: ICustomer;
}

const getCustomer = async () => {
  const customerAccessToken = window.localStorage.getItem(CART_ID_KEY);

  if (!customerAccessToken) {
    return;
  }

  const data = await fetchGraphQL<IGetCustomer>(SHOPIFY_CUSTOMER_QUERY, [], {
    customerAccessToken,
  });

  if (data) {
    user.value = data.customer;
  }
};

type Middleware = (fn: () => Promise<void>) => Promise<void>;

// const withUser: Middleware = async (cb) => {
//   if (user.value === null) {
//     throw new Error("Missing user");
//   }

//   return await cb();
// };

const withLoading: Middleware = async (cb) => {
  try {
    loading.value = true;
    return await cb();
  } finally {
    loading.value = false;
  }
};

let queue = Promise.resolve();
const withPQueue: Middleware = (cb) => {
  queue = queue.then(cb);

  return queue;
};

// Start fetching the cart on client-side only
if (typeof document !== "undefined") {
  const _getCustomer = () => withPQueue(() => withLoading(getCustomer));

  _getCustomer();

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && _getCustomer(),
  );
}

const state = {
  user,
  loading,
  login,
  logout,
  createAccount,
};

export const useAuth = () => state;
