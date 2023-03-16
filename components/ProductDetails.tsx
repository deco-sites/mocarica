import type { LoaderReturnType } from "$live/types.ts";
import type { Product, ProductDetailsPage } from "../commerce/types.ts";

export interface Props {
  page: LoaderReturnType<ProductDetailsPage | null>;
}

function ProductDetails(props: Props) {
  const { page } = props;
  if (!page) {
    return null;
  }

  const {
    breadcrumbList,
    product,
  } = page;

  const {
    description,
    productID,
    offers,
    image: images,
    name: variantName,
    gtin,
    isVariantOf,
  } = product;

  /**
   * I did not really liked the images from our default base store.
   * To overcome this issue without generating another catalog altogheter
   * I decided to get images from unplash. However, you should get the images
   * front the catalog itself. To do this, just uncomment the code below
   */
  // const [front, back] = images ?? [];
  const [front, back] = [{
    url: `https://source.unsplash.com/user/nikutm?v=${productID}`,
    alternateName: "nikutm-front",
  }, {
    url: `https://source.unsplash.com/user/nikutm?v=${productID}-2`,
    alternateName: "nikutm-back",
  }];

  return (
    <div>
      {breadcrumbList.itemListElement.map((item) => (
        <div>
          <span>{item.name}</span>
        </div>
      ))}
      {images?.map((image) => <img src={image.url} alt={image.description} />)}
      <h2>{isVariantOf?.name} - {variantName}</h2>
      <span>product page</span>
      <span>{description}</span>
    </div>
  );
}

export default ProductDetails;
