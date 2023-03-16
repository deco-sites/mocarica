import { fetchAPI } from "$live/utils/fetchAPI.ts";

// TODO: move these keys to their env variables
const storefrontAccessToken = "0de0d486c27e0b13cd216698d1b8e770";
const storeName = "mocarica";

const gql = (x: TemplateStringsArray) => x.toString().trim();

const fetchGraphQL = async <T>(
  query: string,
  fragments: string[] = [],
  variables: Record<string, unknown> = {},
) => {
  const finalQuery = [query, ...fragments].join("\n");

  const { data, errors } = await fetchAPI<{ data?: T; errors: unknown[] }>(
    `https://${storeName}.myshopify.com/api/2022-10/graphql.json`,
    {
      method: "POST",
      body: JSON.stringify({
        query: finalQuery,
        variables,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
    },
  );

  if (Array.isArray(errors) && errors.length > 0) {
    if (typeof Deno !== "undefined") {
      console.error(Deno.inspect(errors, { depth: 100, colors: true }));
    }

    throw new Error(
      `Error while running query:\n${finalQuery}\n\n${
        JSON.stringify(
          variables,
        )
      }`,
    );
  }

  return data;
};

export { fetchGraphQL, gql };
