import { bulkUpdateProductDetails } from './../jsx/actions/products'
import {
  updateAdvertisingDataScrapingTabId,
  updateBusinessReportsScrapingTabId
} from '../jsx/actions/sellerCentralGraph'

export const resetSellerCentralScraperTabId = ({ store, tabId, tabUrl }) => {
  if (
    store.getState().sellerCentralGraph.businessReports.scraperTabId === tabId &&
    !getCommonConstant('SELLERCENTRAL').test(tabUrl)
  ) {
    store.dispatch(updateBusinessReportsScrapingTabId(null))
  }

  if (
    store.getState().sellerCentralGraph.advertisingReports.scraperTabId === tabId &&
    !getCommonConstant('ADVERTISING_URL_REGEX').test(tabUrl)
  ) {
    store.dispatch(updateAdvertisingDataScrapingTabId(null))
  }
}

//-------
// Utils for updating product data in bulk which save time on communication with Redux store
let updatedProductDataAccumulator = {}
let updateProductsTimeout = null

export const updateProductDataInBulk = (store, { asin, market, productDetails }, tabId) => {
  const entry = updatedProductDataAccumulator[asin]
  if (!entry) {
    updatedProductDataAccumulator[asin] = productDetails
  } else {
    updatedProductDataAccumulator[asin] = {
      ...entry,
      ...productDetails
    }
  }

  clearTimeout(updateProductsTimeout)
  updateProductsTimeout = setTimeout(function() {
    store.dispatch(
      bulkUpdateProductDetails({ market, products: { ...updatedProductDataAccumulator } }, tabId)
    )
    updatedProductDataAccumulator = {}
  }, 100)
}
//---------

//-------
// Utils for updating product data in bulk which save time on communication with Redux store
let addProductsToStoreAccumulator = {}
let addProductsToStoreTimeout = null

const dispatchAddProductsInBulk = (store, market) => {
  // The reason is that the fetch is not order return, so there will be two executive `dispatchAddProductsInBulk`
  if (Object.keys(addProductsToStoreAccumulator).length <= 0) return
  store.dispatch(
    bulkUpdateProductDetails({ market, products: { ...addProductsToStoreAccumulator } })
  )
  addProductsToStoreAccumulator = {}
}

export const addProductToStoreInBulk = (store, { ordinal, market, asin, product }) => {
  addProductsToStoreAccumulator[asin] = product
  if (ordinal < 10) {
    // attempt to render the top 10 items faster (together with what already is collected there in accumulator)
    dispatchAddProductsInBulk(store, market)
  } else {
    clearTimeout(addProductsToStoreTimeout)
    addProductsToStoreTimeout = setTimeout(function() {
      dispatchAddProductsInBulk(store, market)
    }, 50)
  }
}
