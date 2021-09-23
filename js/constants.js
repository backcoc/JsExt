// Double injection guard
if (typeof $ != 'undefined' && $('.jsContainer').length >= 1) {
  throw new Error('Injected!')
}

//NOTE: to use constants please use getConstant(name), don't use this directly.
//Ex. getConstant('APP_LOGIN_TITLE') will return 'Login to Jungle Scout Pro'
//if its the pro chrome extension.
// TODO: segregate constants to websites as necessary
const constants = {
  SUPPORTED_STORES: /(amazon.com(.?)$)|(amazon.co.uk(.?)$)|(amazon.ca(.?)$)|(amazon.de(.?)$)|(amazon.fr(.?)$)|(amazon.in(.?)$)|(amazon.com.mx(.?)$)|(amazon.it(.?)$)|(amazon.es(.?)$)|(amazon.co.jp(.?)$)/i,
  SUPPORTED_STORES_WALMART: /(walmart.com(.?)$)/i,
  BEST_SELLER_REGX: /(best\-?sellers)/i,
  NEW_RELEASES_REGX: /(new\-?releases)/i,
  MOVERS_AND_SHAKERS_REGX: /(movers\-?and\-?shakers)/i,
  TOP_RATED_REGX: /(top\-?rated)/i,
  MOST_WISHES_REGX: /(most\-?wished\-?for)/i,
  MOST_GIFTED_REGX: /(most\-?gifted)/i,
  ASIN_REGEX: /(dp|product|asin)?\/[0-9A-Z]{10}/,
  ITEM_REGEX_WALMART: /.*\/ip\/.*/,
  SHOP_PAGES: /pages\/[0-9A-Z]{10}/,
  GENERAL_SEARCH_REGEX: /(field\-keywords)/i,
  WISH_LIST_INF_REGEX: /(hz\/wishlist\/inf)/i,
  WISH_LIST_LS_REGEX: /(hz\/wishlist\/ls)/i,
  STORE_FRONT_REGEX: /(stores\/node\/[0-9])/i,
  BUYING_GUIDE_REGEX: /(vs\/buying\-guide\/)/i,
  SEARCH_RESULT_REGEX: /(s\?k=)/i,
  SEARCH_RESULT_REGEX_WALMART: /(search\/\?)/i,
  SELLERCENTRAL: /sellercentral(-\w*)*\.amazon.*\//i,
  ADVERTISING_URL_REGEX: /advertising(-\w*)*\.amazon.*\/campaigns/i,
  JUNGLE_SCOUT_WEB_APP_REGEX: /members\.junglescout\.com/i,
  PRODUCT_RECORD_EXPIRY_TIME: 15 * 60 * 1000, // 15 minutes old - considered FRESH. Change as required.
  jsp: {
    APP_LOGIN_TITLE: 'Login to Jungle Scout Pro',
    API_HOST: 'https://ext.junglescout.com'
  },
  jsl: {
    APP_LOGIN_TITLE: 'Login to Jungle Scout',
    API_HOST: 'https://ext.junglescout.com'
  }
}

//will figure out app code from manifest
function getAppCode() {
  return chrome.runtime.getManifest().name.includes('Lite') ? 'jsl' : 'jsp'
}

//will return undefined if not found
function getConstant(name) {
  return constants[getAppCode()][name]
}

function getCommonConstant(name) {
  return constants[name]
}

// for unit testing purpose
if (typeof exports != 'undefined') {
  exports.getAppCode = getAppCode
  exports.getConstant = getConstant
  exports.getCommonConstant = getCommonConstant
}
