import { FeatureFlags } from '../jsx/constants/feature_flags'
import { isFeatureEnabled } from '../jsx/helpers/features'

const getDomain = url => {
  url = url.replace(/https?:\/\/(www.)?/i, '')
  if (url.indexOf('/') === -1) {
    return url
  }
  return url.split('/')[0]
}

const validAmazonURL = url => {
  if (
    (getCommonConstant('SUPPORTED_STORES').test(getDomain(url)) &&
      (getCommonConstant('BEST_SELLER_REGX').test(url) ||
        getCommonConstant('NEW_RELEASES_REGX').test(url) ||
        getCommonConstant('MOVERS_AND_SHAKERS_REGX').test(url) ||
        getCommonConstant('TOP_RATED_REGX').test(url) ||
        getCommonConstant('MOST_WISHES_REGX').test(url) ||
        getCommonConstant('MOST_GIFTED_REGX').test(url) ||
        getCommonConstant('SHOP_PAGES').test(url) ||
        getCommonConstant('GENERAL_SEARCH_REGEX').test(url) ||
        getCommonConstant('WISH_LIST_INF_REGEX').test(url) ||
        getCommonConstant('WISH_LIST_LS_REGEX').test(url) ||
        getCommonConstant('STORE_FRONT_REGEX').test(url) ||
        getCommonConstant('ASIN_REGEX').test(url) ||
        getCommonConstant('SEARCH_RESULT_REGEX').test(url) ||
        getCommonConstant('BUYING_GUIDE_REGEX').test(url))) ||
    getCommonConstant('SELLERCENTRAL').test(url)
  ) {
    return true
  } else {
    return false
  }
}

const validWalmartURL = (url, flagData) => {
  const isWallMartEnabled = isFeatureEnabled(FeatureFlags.WALMART, flagData)

  if (!isWallMartEnabled) {
    return false
  }

  return (
    getCommonConstant('SUPPORTED_STORES_WALMART').test(getDomain(url)) &&
    (getCommonConstant('ITEM_REGEX_WALMART').test(url) ||
      getCommonConstant('SEARCH_RESULT_REGEX_WALMART').test(url))
  )
}

export const updateExtensionIcon = (url, tabId, flagData) => {
  if (validAmazonURL(url) || validWalmartURL(url, flagData)) {
    chrome.browserAction.setIcon({
      path: {
        '16': 'images/16-active.png'
      },
      tabId: tabId
    })
  } else {
    chrome.browserAction.setIcon({
      path: {
        '16': 'images/16-inactive.png'
      },
      tabId: tabId
    })
  }
}
//---------
