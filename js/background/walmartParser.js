import { ProductParser } from '@junglescout/js-walmart-scraper-parse-module'
import * as cheerio from 'cheerio'

export async function parse(html, country, productId) {
  let data
  try {
    data = await parseProductData(html, country, productId)
  } catch (err) {
    console.error(err)
  }
  return data
}
async function parseProductData(html, country, productId) {
  const data = cheerio.load(html, { decodeEntities: false })
  return {
    price: ProductParser.Price.parse(data),
    upc: ProductParser.Upc.parse(data),
    reviews: ProductParser.Reviews.parse(data),
    brand: ProductParser.Brand.parse(data),
    name: ProductParser.Name.parse(data),
    breadcrumbs: ProductParser.Breadcrumbs.parse(data),
    description: ProductParser.Description.parse(data),
    nComments: ProductParser.NumComments.parse(data),
    walmartNumber: ProductParser.WalmartNumber.parse(data),
    sellerName: ProductParser.SellerName.parse(data),
    freeNextDayDeliveryItem: ProductParser.FreeNextDayDelivery.parse(data),
    freeTwoDayDeliveryItem: ProductParser.FreeTwoDayDelivery.parse(data),
    isFreeDelivery: ProductParser.FreeDelivery.parse(data),
    pricePerUnit: ProductParser.PricePerUnit.parse(data),
    reccomendedPercentage: ProductParser.ReccomendedPercentage.parse(data),
    nQuestions: ProductParser.NumQuestions.parse(data),
    sellers: ProductParser.NumSellers.parse(data),
    sellerId: ProductParser.SellerId.parse(data),
    productImage: ProductParser.ProductImage.parse(data),
    pageProductId: ProductParser.ProductId.parse(data),
    variantIds: ProductParser.Variants.parse(data),
    buyboxAdProducts: ProductParser.BuyboxAdProducts.parse(data),
    isGiftEligible: ProductParser.GiftEligible.parse(data),
    CategoryPathId: ProductParser.CategoryPathId.parse(data),
    rootCategory: ProductParser.RootCategory.parse(data)
  }
}
