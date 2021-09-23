// Injection guard
if ($('.jsContainer').length >= 1) {
  throw new Error('Injected! Race condition or duplicated injection.')
}

const reportSentryError = message => {
  chrome.runtime.sendMessage({
    action: 'reportSentry',
    message
  })
}

window.onerror = function(msg, url, lineNo, columnNo, error) {
  reportSentryError(msg)
  return false
}

// Used to wrap code that only executes when data collection is approved
const executeIfTrackingAllowed = trackingCode => {
  if (navigator.userAgent.includes('Firefox')) {
    chrome.storage.sync.get('consentDataCollectionPolicy', result => {
      if (result.consentDataCollectionPolicy === true) {
        return trackingCode()
      }
    })
  } else {
    return trackingCode()
  }
}

const watchAjaxRequests = () => {
  let ajaxRequestsFinishedTimeout = null

  $('body').on('ajaxRequestsStarted', () => {
    clearTimeout(ajaxRequestsFinishedTimeout)
  })

  //--------------------------------------------------------------------------------//
  //After the ajax requests have been stopped, to refresh headers
  $('body').on('ajaxRequestsFinished', () => {
    clearTimeout(ajaxRequestsFinishedTimeout)
    ajaxRequestsFinishedTimeout = setTimeout(function() {
      if (state) {
        state.saveCurrentState()
        fetchOppScoreAndStopSpinner()
      }
    }, 1000)
  })
}

$(document).ready(watchAjaxRequests)

//--------------------------------------------------------------------------------//
//Add comma
function numberWithCommas(x) {
  if (typeof x == 'undefined') {
    return 'N.A.'
  }
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

//--------------------------------------------------------------------------------//
//return just any number
function pureNumber(number) {
  if (number && typeof number == 'string') {
    number = number.match(/[0-9.]/g)
    number = number ? number.join('') : 'N.A.'
    return !isNaN(number) ? number : 'N.A.'
  } else if (!isNaN(number) && typeof number == 'number') {
    return number
  } else {
    return 'N.A.'
  }
}

//---------------------------------------------------------------//
//If there is invalid token around
function invalidToken(message) {
  //Fire the event
  chrome.runtime.sendMessage({ action: 'invalidToken', message })
  //Close the current modal
  if ($('.jsContainer').is(':visible')) {
    $('.jsContainer #closeJsPopup')
      .get(0)
      .click()
  }
  return false
}

//---------------------------------------------------------------//
function toNumeric(value) {
  if (typeof value === 'number') {
    return value
  }
  return !isNaN(value) && !isNaN(parseFloat(value)) && parseFloat(value)
}

//---------------------------------------------------------------//
//A prototype to clean undefined/null/empty values
Array.prototype.clean = function() {
  return this.filter(function(e) {
    return typeof e !== 'undefined' && e != null && e != ''
  })
}

// Temp polyfill for ES6 rest/spread operator

// Can be used like this:
// const object1 = {
//   a: 1,
//   b: 2,
//   c: 3
// };

// const object2 = Object.assign({c: 4, d: 5}, object1);
// console.log(object2.c, object2.d);

// expected output: 3 5

// we first set the Object.assign function to null to show that the polyfill works
Object.assign = null

// start polyfill

if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, varArgs) {
      // .length of function is 2
      'use strict'
      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object')
      }

      var to = Object(target)

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index]

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    },
    writable: true,
    configurable: true
  })
}

// end polyfill

//--------------------------------------------------------------------------------//
//Constants
STANDARD_NUM = 1
STANDARD_STRING = 'Standard (Standard Envelope)'
STANDARD_STRING_SHORT = 'Stand'

STANDARD_SMALL_NUM = 2
STANDARD_SMALL_STRING = 'Standard (Small Envelope)'
STANDARD_SMALL_STRING_SHORT = 'S. Stand'

STANDARD_LARGE_NUM = 3
STANDARD_LARGE_STRING = 'Standard (Large Envelope)'
STANDARD_LARGE_STRING_SHORT = 'L. Stand'

OVERSIZE_NUM = 4
OVERSIZE_STRING = 'Oversize'
OVERSIZE_STRING_SHORT = 'Over'

OVERSIZE_STANDARD_NUM = 5
OVERSIZE_STANDARD_STRING = 'Oversize (Standard)'
OVERSIZE_STANDARD_STRING_SHORT = 'O. Standard'

OVERSIZE_SMALL_NUM = 6
OVERSIZE_SMALL_STRING = 'Oversize (Small)'
OVERSIZE_SMALL_STRING_SHORT = 'S. Over'

OVERSIZE_MEDIUM_NUM = 7
OVERSIZE_MEDIUM_STRING = 'Oversize (Medium)'
OVERSIZE_MEDIUM_STRING_SHORT = 'M. Over'

OVERSIZE_LARGE_NUM = 8
OVERSIZE_LARGE_STRING = 'Oversize (Large)'
OVERSIZE_LARGE_STRING_SHORT = 'L. Over'

OVERSIZE_SPECIAL_NUM = 9
OVERSIZE_SPECIAL_STRING = 'Oversize (Special)'
OVERSIZE_SPECIAL_STRING_SHORT = 'Special'

OVERSIZE_REGULAR_NUM = 10
OVERSIZE_REGULAR_STRING = 'Oversize (Regular)'
OVERSIZE_REGULAR_STRING_SHORT = 'R. Over'

ENVOLPE_NUM = 11
ENVOLPE_STRING = 'Envelope'
ENVOLPE_STRING_SHORT = 'Enve'

//--------------------------------------------------------------------------------//
//Check active/inactive columns based on options page
function areColumnsChanged(table) {
  if (typeof table == 'undefined') {
    return false
  }
  const wrappedTable = $.parseHTML('<table></table>')
  table = $.parseHTML(table.trim())
  table = $(wrappedTable).append(table)
  let columnsChanged = false

  const brandColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-brand')
    .hasClass('hidden')
    ? false
    : true
  const priceColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-price')
    .hasClass('hidden')
    ? false
    : true
  const categoryColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-category')
    .hasClass('hidden')
    ? false
    : true
  const rankColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-rank')
    .hasClass('hidden')
    ? false
    : true
  const estSalesColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-est-sales-mo')
    .hasClass('hidden')
    ? false
    : true
  const estSalesDColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-est-sales-d')
    .hasClass('hidden')
    ? false
    : true
  const estRevenueColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-est-revenue')
    .hasClass('hidden')
    ? false
    : true
  const reviewsColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-reviews')
    .hasClass('hidden')
    ? false
    : true
  const ratingColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-rating')
    .hasClass('hidden')
    ? false
    : true
  const bBsellerColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-bb-seller')
    .hasClass('hidden')
    ? false
    : true
  const fbaFeeColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-fba-fee')
    .hasClass('hidden')
    ? false
    : true
  const tierColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-tier')
    .hasClass('hidden')
    ? false
    : true
  const newSellerColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-new-sellers')
    .hasClass('hidden')
    ? false
    : true
  const dimensionsColumns = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-dimensions')
    .hasClass('hidden')
    ? false
    : true
  const itemWeightColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-item-weight')
    .hasClass('hidden')
    ? false
    : true
  const netColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-net')
    .hasClass('hidden')
    ? false
    : true
  const lqsColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-lqs')
    .hasClass('hidden')
    ? false
    : true
  const supplierColumn = $(table)
    .find('thead')
    .filter(':first')
    .find('th.js-supplier')
    .hasClass('hidden')
    ? false
    : true
  const sponsoredProducts =
    $(table)
      .find('tbody')
      .attr('data-showAdsProducts') == 'false'
      ? false
      : true

  if (
    brandColumn != showBrandColumn ||
    priceColumn != showPriceColumn ||
    categoryColumn != showCategoryColumn ||
    rankColumn != showRankColumn ||
    estSalesColumn != showEstSalesColumn ||
    estSalesDColumn != showEstSalesDColumn ||
    estRevenueColumn != showEstRevenueColumn ||
    reviewsColumn != showReviewsColumn ||
    ratingColumn != showRatingColumn ||
    bBsellerColumn != showBbSellerColumn ||
    fbaFeeColumn != showFbaFeeColumn ||
    tierColumn != showTierColumn ||
    newSellerColumn != showNewSellerColumn ||
    dimensionsColumns != showDimensionsColumns ||
    itemWeightColumn != showItemWeightColumn ||
    netColumn != showNetColumn ||
    lqsColumn != showLQSColumn ||
    sponsoredProducts != showSponsoredProducts ||
    supplierColumn != showSupplierColumn
  ) {
    columnsChanged = true
  } else {
    columnsChanged = false
  }
  return columnsChanged
}

//----------------------------------------------------//
//return FBA fee and tier for US
function USFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = [
    'Books',
    'Music',
    'Videos',
    'Albums',
    'Video Games',
    'Movies & TV',
    'Software'
  ]
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  const smallestValue = parseFloat(dimensionArrayAsc[0])
  const mediumValue = parseFloat(dimensionArrayAsc[1])
  const largestValue = parseFloat(dimensionArrayAsc[2])
  const weight = parseFloat(_weight)

  // BUG ?
  // TODO: tierWeight doesn't get assigned, but is checked against in the code below
  let tierWeight = null
  const UW = weight

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the tier value
      if (largestValue <= 15 && mediumValue <= 12 && smallestValue <= 0.75 && weight <= 0.875) {
        theTier = STANDARD_SMALL_STRING_SHORT
        theFullTierDescription = STANDARD_SMALL_STRING
        theTierNumber = STANDARD_SMALL_NUM
      } else if (largestValue <= 18 && mediumValue <= 14 && smallestValue <= 8 && weight <= 20) {
        theTier = STANDARD_LARGE_STRING_SHORT
        theFullTierDescription = STANDARD_LARGE_STRING
        theTierNumber = STANDARD_LARGE_NUM
      } else if (
        largestValue <= 60 &&
        mediumValue <= 30 &&
        largestValue + 2 * mediumValue + 2 * largestValue <= 130 &&
        tierWeight <= 70
      ) {
        theTier = OVERSIZE_SMALL_STRING_SHORT
        theFullTierDescription = OVERSIZE_SMALL_STRING
        theTierNumber = OVERSIZE_SMALL_NUM
      } else if (
        largestValue <= 108 &&
        largestValue + 2 * mediumValue + 2 * smallestValue <= 130 &&
        tierWeight <= 150
      ) {
        theTier = OVERSIZE_MEDIUM_STRING_SHORT
        theFullTierDescription = OVERSIZE_MEDIUM_STRING
        theTierNumber = OVERSIZE_MEDIUM_NUM
      } else if (
        largestValue <= 108 &&
        largestValue + 2 * mediumValue + 2 * smallestValue <= 165 &&
        tierWeight <= 150
      ) {
        theTier = OVERSIZE_LARGE_STRING_SHORT
        theFullTierDescription = OVERSIZE_LARGE_STRING
        theTierNumber = OVERSIZE_LARGE_NUM
      } else {
        theTier = OVERSIZE_SPECIAL_STRING_SHORT
        theFullTierDescription = OVERSIZE_SPECIAL_STRING
        theTierNumber = OVERSIZE_SPECIAL_NUM
      }

      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //STANDARD_SMALL_STRING
        if (theTierNumber == STANDARD_SMALL_NUM) {
          theFbaFee = 2.41
        }
        //STANDARD_LARGE_STRING
        else if (theTierNumber == STANDARD_LARGE_NUM) {
          if (UW <= 1) {
            theFbaFee = 2.99
          } else if (UW > 1 && UW < 2) {
            theFbaFee = 4.18
          } else {
            theFbaFee = 4.18 + 0.39 * (Math.round(UW) - 2)
          }
        }
        //OVERSIZE_SMALL_STRING
        else if (theTierNumber == OVERSIZE_SMALL_NUM) {
          theFbaFee = 6.85 + 0.39 * (Math.round(UW) - 2)
        }
        //OVERSIZE_MEDIUM_STRING
        else if (theTierNumber == OVERSIZE_MEDIUM_NUM) {
          theFbaFee = 9.2 + 0.39 * (Math.round(UW) - 2)
        }
        //OVERSIZE_LARGE_STRING
        else if (theTierNumber == OVERSIZE_LARGE_NUM) {
          theFbaFee = 75.06 + 0.8 * (Math.round(UW) - 90)
        }
        //OVERSIZE_SPECIAL_STRING
        else if (theTierNumber == OVERSIZE_SPECIAL_NUM) {
          theFbaFee = 138.08 + 0.92 * (Math.round(UW) - 90)
        } else {
          theFbaFee = 0.0
        }

        //Get the final FBA Fee
        theReferralFee = thePrice * 0.15

        //Closing Fee
        theClosingFee = 1.8

        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the tier value
      if (largestValue <= 15 && mediumValue <= 12 && smallestValue <= 0.75 && weight <= 0.75) {
        theTier = STANDARD_SMALL_STRING_SHORT
        theFullTierDescription = STANDARD_SMALL_STRING
        theTierNumber = STANDARD_SMALL_NUM
      } else if (largestValue <= 18 && mediumValue <= 14 && smallestValue <= 8 && weight <= 20) {
        theTier = STANDARD_LARGE_STRING_SHORT
        theFullTierDescription = STANDARD_LARGE_STRING
        theTierNumber = STANDARD_LARGE_NUM
      } else if (
        largestValue <= 60 &&
        mediumValue <= 30 &&
        largestValue + 2 * mediumValue + 2 * largestValue <= 130 &&
        tierWeight <= 70
      ) {
        theTier = OVERSIZE_SMALL_STRING_SHORT
        theFullTierDescription = OVERSIZE_SMALL_STRING
        theTierNumber = OVERSIZE_SMALL_NUM
      } else if (
        largestValue <= 108 &&
        largestValue + 2 * mediumValue + 2 * smallestValue <= 130 &&
        tierWeight <= 150
      ) {
        theTier = OVERSIZE_MEDIUM_STRING_SHORT
        theFullTierDescription = OVERSIZE_MEDIUM_STRING
        theTierNumber = OVERSIZE_MEDIUM_NUM
      } else if (
        largestValue <= 108 &&
        largestValue + 2 * mediumValue + 2 * smallestValue <= 165 &&
        tierWeight <= 150
      ) {
        theTier = OVERSIZE_LARGE_STRING_SHORT
        theFullTierDescription = OVERSIZE_LARGE_STRING
        theTierNumber = OVERSIZE_LARGE_NUM
      } else {
        theTier = OVERSIZE_SPECIAL_STRING_SHORT
        theFullTierDescription = OVERSIZE_SPECIAL_STRING
        theTierNumber = OVERSIZE_SPECIAL_NUM
      }

      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //STANDARD_SMALL_STRING
        if (theTierNumber == STANDARD_SMALL_NUM) {
          if (UW <= 0.375) {
            theFbaFee = 2.5
          } else {
            theFbaFee = 2.63
          }
        }
        //STANDARD_LARGE_STRING
        else if (theTierNumber == STANDARD_LARGE_NUM) {
          if (UW <= 0.375) {
            theFbaFee = 3.31
          } else if (theFbaFee <= 0.75) {
            theFbaFee = 3.48
          } else if (UW > 1 && UW < 2) {
            theFbaFee = 4.9
          } else if (UW > 2 && UW <= 3) {
            theFbaFee = 5.42
          } else {
            theFbaFee = 5.42 + 0.38 * (Math.round(UW) - 3)
          }
        }
        //OVERSIZE_SMALL_STRING
        else if (theTierNumber == OVERSIZE_SMALL_NUM) {
          theFbaFee = 8.26 + 0.38 * (Math.round(UW) - 2)
        }
        //OVERSIZE_MEDIUM_STRING
        else if (theTierNumber == OVERSIZE_MEDIUM_NUM) {
          theFbaFee = 11.37 + 0.39 * (Math.round(UW) - 2)
        }
        //OVERSIZE_LARGE_STRING
        else if (theTierNumber == OVERSIZE_LARGE_NUM) {
          theFbaFee = 75.78 + 0.79 * (Math.round(UW) - 90)
        }
        //OVERSIZE_SPECIAL_STRING
        else if (theTierNumber == OVERSIZE_SPECIAL_NUM) {
          theFbaFee = 137.32 + 0.92 * (Math.round(UW) - 90)
        } else {
          theFbaFee = 0.0
        }

        if (
          [
            'Camera & Photo',
            'Cell Phone Devices',
            'Consumer Electronics',
            'Unlocked Cell Phones',
            'Video Game Consoles'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.08 > 0.3 ? thePrice * 0.08 : 0.3
        } else if (
          ['Automotive', 'Industrial & Scientific', '3D Printed Products'].includes(category)
        ) {
          theReferralFee = thePrice * 0.12 > 0.3 ? thePrice * 0.12 : 0.3
        } else if (['Sports', 'Grocery & Gourmet Food'].includes(category)) {
          theReferralFee = thePrice * 0.15
        } else if (['Jewelry', 'Clothing, Shoes & Jewelry']) {
          theReferralFee = thePrice * 0.2 > 0.3 ? thePrice * 0.2 : 0.3
        } else if (category == 'Watches') {
          theReferralFee = thePrice * 0.16 > 2.0 ? thePrice * 0.16 : 2
        } else if (category == 'Personal Computers') {
          theReferralFee = thePrice * 0.06 > 0.3 ? thePrice * 0.06 : 0.3
        } else {
          theReferralFee = thePrice * 0.15 > 0.3 ? thePrice * 0.15 : 0.3
        }

        theTotalFbaFee = theFbaFee + theReferralFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //End if other categories
  } //End if complete process
  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for UK
function UKFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = [
    'Books',
    'Music',
    'PC & Video Games',
    'DVD',
    'DVD & Blu-ray',
    'Video Games',
    'Software'
  ]
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  //Conver pound to gram
  const weight = parseFloat(_weight * 453.592)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Get the tier value
    if (largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //S. Stand
        if (theTierNumber == STANDARD_NUM) {
          if (thePrice <= 300) {
            if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
              theFbaFee = 1.38
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 2.5 &&
              weight <= 460
            ) {
              if (weight <= 60) {
                theFbaFee = 1.51
              } else if (weight <= 210) {
                theFbaFee = 1.66
              } else if (weight <= 460) {
                theFbaFee = 1.6
              } else {
                theFbaFee = 0.0
              }
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 5 &&
              weight <= 960
            ) {
              theFbaFee = 2.21
            } else if (
              largestValue <= 45 &&
              mediumValue <= 34 &&
              smallestValue <= 26 &&
              weight <= 11900
            ) {
              if (weight <= 150) {
                theFbaFee = 2.18
              } else if (weight <= 400) {
                theFbaFee = 2.32
              } else if (weight <= 900) {
                theFbaFee = 2.49
              } else if (weight <= 1400) {
                theFbaFee = 2.65
              } else if (weight <= 1900) {
                theFbaFee = 2.9
              } else if (weight <= 2900) {
                theFbaFee = 4.14
              } else if (weight <= 3900) {
                theFbaFee = 4.53
              } else if (weight <= 4900) {
                theFbaFee = 4.62
              } else if (weight <= 6900) {
                theFbaFee = 5.28
              } else if (weight <= 9900) {
                theFbaFee = 5.42
              } else if (weight <= 10900) {
                theFbaFee = 5.43
              } else {
                theFbaFee = 3.63
              }
            }
          } else {
            theFbaFee = 0.0
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          //S. Over
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 760) {
              theFbaFee = 4.08
            } else if (weight <= 1010) {
              theFbaFee = 4.55
            } else if (weight <= 1260) {
              theFbaFee = 4.91
            } else if (weight <= 1510) {
              theFbaFee = 5
            } else {
              theFbaFee = 5.06
            }

            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          }
          //R. Over
          else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 4.97
            } else if (weight <= 1760) {
              theFbaFee = 5.29
            } else if (weight <= 2760) {
              theFbaFee = 5.4
            } else if (weight <= 3760) {
              theFbaFee = 5.43
            } else if (weight <= 4760) {
              theFbaFee = 5.47
            } else if (weight <= 5760) {
              theFbaFee = 6.46
            } else if (weight <= 6760) {
              theFbaFee = 6.52
            } else if (weight <= 8760) {
              theFbaFee = 6.55
            } else if (weight <= 9760) {
              theFbaFee = 6.58
            } else if (weight <= 14760) {
              theFbaFee = 7
            } else if (weight <= 19760) {
              theFbaFee = 7.35
            } else {
              theFbaFee = 8.14
            }

            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 8.26
            } else if (weight <= 9760) {
              theFbaFee = 9.96
            } else if (weight <= 14760) {
              theFbaFee = 10.53
            } else if (weight <= 19760) {
              theFbaFee = 11.03
            } else if (weight <= 24760) {
              theFbaFee = 12.01
            } else if (weight <= 29760) {
              theFbaFee = 12.04
            } else {
              theFbaFee = 0.0
            }

            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        if (
          category == 'Books' ||
          category == 'Music' ||
          category == 'DVD' ||
          category == 'DVD & Blu-ray' ||
          category == 'PC & Video Games' ||
          category == 'Software'
        ) {
          theReferralFee = thePrice * 0.15
        } else {
          theReferralFee = thePrice * 0.15
          if (theReferralFee < 0.4) {
            theReferralFee = 0.4
          }
        }

        //Calculate Variable Closing Fee
        if (category == 'Books') {
          theClosingFee = 0.43
        } else if (category == 'Music') {
          theClosingFee = 0.24
        } else if (category == 'DVD' || category == 'DVD & Blu-ray') {
          theClosingFee = 0.14
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //S. Stand
        if (theTierNumber == STANDARD_NUM) {
          if (thePrice <= 300) {
            if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
              theFbaFee = 1.38
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 2.5 &&
              weight <= 460
            ) {
              if (weight <= 60) {
                theFbaFee = 1.51
              } else if (weight <= 210) {
                theFbaFee = 1.66
              } else if (weight <= 460) {
                theFbaFee = 1.6
              } else {
                theFbaFee = 0.0
              }
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 5 &&
              weight <= 960
            ) {
              theFbaFee = 2.21
            } else if (
              largestValue <= 45 &&
              mediumValue <= 34 &&
              smallestValue <= 26 &&
              weight <= 11900
            ) {
              if (weight <= 150) {
                theFbaFee = 2.18
              } else if (weight <= 400) {
                theFbaFee = 2.32
              } else if (weight <= 900) {
                theFbaFee = 2.49
              } else if (weight <= 1400) {
                theFbaFee = 2.65
              } else if (weight <= 1900) {
                theFbaFee = 2.9
              } else if (weight <= 2900) {
                theFbaFee = 4.14
              } else if (weight <= 3900) {
                theFbaFee = 4.53
              } else if (weight <= 4900) {
                theFbaFee = 4.62
              } else if (weight <= 6900) {
                theFbaFee = 5.28
              } else if (weight <= 9900) {
                theFbaFee = 5.42
              } else if (weight <= 10900) {
                theFbaFee = 5.43
              } else {
                theFbaFee = 3.63
              }
            }
          } else {
            theFbaFee = 0.0
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          //S. Over
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 760) {
              theFbaFee = 4.08
            } else if (weight <= 1010) {
              theFbaFee = 4.55
            } else if (weight <= 1260) {
              theFbaFee = 4.91
            } else if (weight <= 1510) {
              theFbaFee = 5
            } else {
              theFbaFee = 5.06
            }

            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          }
          //R. Over
          else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 4.97
            } else if (weight <= 1760) {
              theFbaFee = 5.29
            } else if (weight <= 2760) {
              theFbaFee = 5.4
            } else if (weight <= 3760) {
              theFbaFee = 5.43
            } else if (weight <= 4760) {
              theFbaFee = 5.47
            } else if (weight <= 5760) {
              theFbaFee = 6.46
            } else if (weight <= 6760) {
              theFbaFee = 6.52
            } else if (weight <= 8760) {
              theFbaFee = 6.55
            } else if (weight <= 9760) {
              theFbaFee = 6.58
            } else if (weight <= 14760) {
              theFbaFee = 7
            } else if (weight <= 19760) {
              theFbaFee = 7.35
            } else {
              theFbaFee = 8.14
            }

            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 8.26
            } else if (weight <= 9760) {
              theFbaFee = 9.96
            } else if (weight <= 14760) {
              theFbaFee = 10.53
            } else if (weight <= 19760) {
              theFbaFee = 11.03
            } else if (weight <= 24760) {
              theFbaFee = 12.01
            } else if (weight <= 29760) {
              theFbaFee = 12.04
            } else {
              theFbaFee = 0.0
            }

            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        if (
          [
            'DIY & Tools',
            'Musical Instruments',
            'Additive Manufacturing',
            'Flow Control & Filtration',
            'Fluid Transfer',
            'Industrial Electrical Supplies',
            'Industrial Tools & Instruments',
            'Material Handling',
            'Metalworking',
            'Musical Instruments & DJ',
            'Renewable Energy Supplies'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.1224 > 0.25 ? thePrice * 0.1224 : 0.25
        } else if (['Computers', 'Electronics', 'Large Appliances', 'Tyres'].includes(category)) {
          theReferralFee = thePrice * 0.0714 > 0.25 ? thePrice * 0.0714 : 0.25
        } else if (category == 'PC & Video Games') {
          theReferralFee = thePrice * 0.0816
        } else if (category == 'Jewelry') {
          theReferralFee = thePrice * 0.204 > 0.25 ? thePrice * 0.204 : 0.25
        } else {
          theReferralFee = thePrice * 0.153 > 0.25 ? thePrice * 0.153 : 0.25
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End of complete process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for CA
function CAFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = [
    'Books',
    'Music',
    'Video Games',
    'DVD',
    'DVD & Blu-ray',
    'Software'
  ]
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)
  let outboundweight = 0.0

  //Round all values
  if (completeProcess) {
    //Conver pound to gram
    const weight = parseFloat(_weight * 453.592)
    let tierWeight = null
    const UW = weight
    let DW = (largestValue * mediumValue * smallestValue) / 6
    DW = parseFloat(DW)
    if (UW > DW) {
      tierWeight = UW
    } else {
      tierWeight = DW
    }

    //Get the tier value
    if (largestValue <= 38 && mediumValue <= 27 && smallestValue <= 2 && tierWeight <= 460) {
      theTier = ENVOLPE_STRING_SHORT
      theFullTierDescription = ENVOLPE_STRING
      theTierNumber = ENVOLPE_NUM
    } else if (
      largestValue <= 45 &&
      mediumValue <= 35 &&
      smallestValue <= 20 &&
      tierWeight <= 8900
    ) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else if (
      largestValue > 270 ||
      largestValue + 2 * mediumValue + 2 * smallestValue > 419 ||
      tierWeight > 68760
    ) {
      theTier = OVERSIZE_SPECIAL_STRING_SHORT
      theFullTierDescription = OVERSIZE_SPECIAL_STRING
      theTierNumber = OVERSIZE_SPECIAL_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        if (theTierNumber == ENVOLPE_NUM) {
          outboundweight = tierWeight + 40
          if (outboundweight <= 100) {
            theFbaFee = 1.9
          } else {
            theFbaFee = 1.9 + 0.25 * Math.round((outboundweight - 100) / 100)
          }
        } else if (theTierNumber == STANDARD_NUM) {
          outboundweight = tierWeight + 100
          if (outboundweight <= 500) {
            theFbaFee = 3.75
          } else {
            theFbaFee = 3.75 + 0.37 * Math.round((outboundweight - 500) / 500)
          }
        } else if (theTierNumber == OVERSIZE_SPECIAL_NUM) {
          outboundweight = weight + 240
          theFbaFee = 125
        } else if (theTierNumber == OVERSIZE_NUM) {
          outboundweight = weight + 240
          if (outboundweight <= 500) {
            theFbaFee = 3.75
          } else {
            theFbaFee = 3.75 + 0.37 * Math.round((outboundweight - 500) / 500)
          }
        }

        //Get the referral fee
        theReferralFee = thePrice * 0.15

        //Calculate Variable Closing Fee
        if (category == 'Books') {
          theClosingFee = 0.24
        } else if (category == 'Music' || category == 'DVD' || category == 'DVD & Blu-ray') {
          theClosingFee = 1.09
        } else if (category == 'Video Games' || category == 'Software') {
          theClosingFee = 1.35
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        if (theTierNumber == ENVOLPE_NUM) {
          outboundWeight = weight + 40
          if (outboundWeight <= 100) {
            theFbaFee = 3.37
          } else {
            theFbaFee = 3.37 + 0.31 * Math.round((outboundWeight - 100) / 100.0)
          }
        } else if (theTierNumber == STANDARD_NUM) {
          outboundweight = weight + 100
          if (outboundWeight <= 250) {
            theFbaFee = 5.44
          } else if (outboundWeight <= 500) {
            theFbaFee = 5.57
          } else if (outboundWeight <= 1000) {
            theFbaFee = 6.4
          } else if (outboundWeight <= 1500) {
            theFbaFee = 7.6
          } else {
            theFbaFee = 7.6 + 0.43 * Math((outboundWeight - 1500) / 500.0)
          }
        } else if (theTierNumber == OVERSIZE_SPECIAL_NUM) {
          theFbaFee = 125
          outboundweight = weight + 240
        } else if (theTierNumber == OVERSIZE_NUM) {
          outboundweight = weight + 240
          if (outboundweight <= 1000) {
            return 9.71
          } else {
            return 9.71 + 0.44 * Math.round((outboundweight - 1000) / 500.0)
          }
        }

        //Get the referral fee & closing fee
        if (category == 'Personal Computers') {
          theReferralFee = thePrice * 0.06 > 0.4 ? thePrice * 0.06 : 0.4
        } else if (
          [
            'Automotive & Powersports',
            'Tools & Home Improvement',
            'Industrial & Scientific'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.12 > 0.4 ? thePrice * 0.12 : 0.4
        } else if (['Jewelry', 'Clothing, Shoes & Jewelry']) {
          theReferralFee = thePrice * 0.2 > 0.4 ? thePrice * 0.2 : 0.4
        } else if (category == 'Watches') {
          theReferralFee = thePrice * 0.16 > 0.4 ? thePrice * 0.15 : 0.4
        } else if (category == 'Electronics') {
          if (price <= 100) {
            theReferralFee = thePrice * 0.15 > 0.4 ? thePrice * 0.15 : 0.4
          } else {
            theReferralFee = 15 + thePrice * 0.08
          }
        } else if (['Camera and Photo', 'Cell Phones', 'Consumer Electronics']) {
          theReferralFee = thePrice * 0.08 > 0.4 ? thePrice * 0.08 : 1
        } else {
          theReferralFee = thePrice * 0.15 > 0.4 ? thePrice * 0.15 : 1
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for FR
function FRFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = [
    'Livres',
    'CD',
    'Video',
    'DVD',
    'DVD & Blu-ray',
    'Music',
    'Jeux video',
    'Software',
    'Logiciels et CD-ROM'
  ]
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  //Conver pound to gram
  const weight = parseFloat(_weight * 453.592)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Get the tier value
    if (largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //S. Stand
        if (theTierNumber == STANDARD_NUM) {
          if (thePrice <= 350) {
            if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
              theFbaFee = 1.24
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 2.5 &&
              weight <= 460
            ) {
              if (weight <= 60) {
                theFbaFee = 1.51
              } else if (weight <= 460) {
                theFbaFee = 1.54
              } else {
                theFbaFee = 0.0
              }
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 5 &&
              weight <= 960
            ) {
              theFbaFee = 2.08
            } else if (
              largestValue <= 45 &&
              mediumValue <= 34 &&
              smallestValue <= 26 &&
              weight <= 11900
            ) {
              if (weight <= 150) {
                theFbaFee = 2.01
              } else if (weight <= 400) {
                theFbaFee = 2.11
              } else if (weight <= 900) {
                theFbaFee = 2.84
              } else if (weight <= 1900) {
                theFbaFee = 3.4
              } else if (weight <= 4900) {
                theFbaFee = 4.97
              } else if (weight <= 11900) {
                theFbaFee = 5.02
              } else {
                theFbaFee = 0.0
              }
            }
          } else {
            theFbaFee = 0.0
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          //S. Over
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 760) {
              theFbaFee = 5.22
            } else if (weight <= 1010) {
              theFbaFee = 5.41
            } else if (weight <= 1510) {
              theFbaFee = 5.48
            } else if (weight <= 1760) {
              theFbaFee = 5.85
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          }
          //R. Over
          else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 5.71
            } else if (weight <= 1760) {
              theFbaFee = 6.53
            } else if (weight <= 2760) {
              theFbaFee = 6.86
            } else if (weight <= 3760) {
              theFbaFee = 7.15
            } else if (weight <= 4760) {
              theFbaFee = 7.2
            } else if (weight <= 5760) {
              theFbaFee = 7.63
            } else if (weight <= 6760) {
              theFbaFee = 7.72
            } else if (weight <= 8760) {
              theFbaFee = 7.76
            } else if (weight <= 9760) {
              theFbaFee = 7.79
            } else if (weight <= 14760) {
              theFbaFee = 8.33
            } else if (weight <= 24760) {
              theFbaFee = 8.76
            } else if (weight <= 29760) {
              theFbaFee = 9.73
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 7.2
            } else if (weight <= 9760) {
              theFbaFee = 8.75
            } else if (weight <= 14760) {
              theFbaFee = 9.27
            } else if (weight <= 19760) {
              theFbaFee = 9.73
            } else if (weight <= 24760) {
              theFbaFee = 10.64
            } else if (weight <= 29760) {
              theFbaFee = 10.9
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        theReferralFee = thePrice * 0.15

        //Calculate Variable Closing Fee
        theClosingFee = 0.52

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //Stand
        if (theTierNumber == STANDARD_NUM) {
          if (thePrice <= 350) {
            if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
              theFbaFee = 2.24
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 2.5 &&
              weight <= 460
            ) {
              if (weight <= 60) {
                theFbaFee = 2.37
              } else if (weight <= 210) {
                theFbaFee = 3
              } else {
                theFbaFee = 3.37
              }
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 5 &&
              weight <= 960
            ) {
              theFbaFee = 3.95
            } else if (
              largestValue <= 45 &&
              mediumValue <= 34 &&
              smallestValue <= 26 &&
              weight <= 11900
            ) {
              if (weight <= 150) {
                theFbaFee = 3.94
              } else if (weight <= 400) {
                theFbaFee = 4.59
              } else if (weight <= 900) {
                theFbaFee = 5.32
              } else if (weight <= 1400) {
                theFbaFee = 5.51
              } else if (weight <= 1900) {
                theFbaFee = 5.62
              } else if (weight <= 2900) {
                theFbaFee = 6.9
              } else if (weight <= 3900) {
                theFbaFee = 7.34
              } else if (weight <= 4900) {
                theFbaFee = 7.36
              } else if (weight <= 6900) {
                theFbaFee = 7.99
              } else if (weight <= 9900) {
                theFbaFee = 8.19
              } else if (weight <= 10900) {
                theFbaFee = 8.24
              } else {
                theFbaFee = 8.25
              }
            }
          } else {
            theFbaFee = 0.0
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          if (thePrice <= 350) {
            if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
              if (weight <= 760) {
                return 7.48
              } else if (weight <= 1010) {
                return 7.75
              } else if (weight <= 1510) {
                return 7.84
              } else {
                return 8.36
              }
              theTier = OVERSIZE_SMALL_STRING_SHORT
              theFullTierDescription = OVERSIZE_SMALL_STRING
            } else if (
              largestValue <= 120 &&
              mediumValue <= 60 &&
              smallestValue <= 60 &&
              weight <= 29760
            ) {
              if (weight <= 760) {
                theFbaFee = 7.52
              } else if (weight <= 1760) {
                theFbaFee = 8.59
              } else if (weight <= 2760) {
                theFbaFee = 9.02
              } else if (weight <= 3760) {
                theFbaFee = 9.4
              } else if (weight <= 4760) {
                theFbaFee = 9.46
              } else if (weight <= 5760) {
                theFbaFee = 10.02
              } else if (weight <= 6760) {
                theFbaFee = 10.13
              } else if (weight <= 8760) {
                theFbaFee = 10.19
              } else if (weight <= 9760) {
                theFbaFee = 10.24
              } else if (weight <= 14760) {
                theFbaFee = 10.94
              } else if (weight <= 24760) {
                theFbaFee = 11.5
              } else {
                theFbaFee = 12.81
              }

              theTier = OVERSIZE_REGULAR_STRING_SHORT
              theFullTierDescription = OVERSIZE_REGULAR_STRING
            }
            //L. Over
            else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
              if (weight <= 4760) {
                theFbaFee = 13.12
              } else if (weight <= 9760) {
                theFbaFee = 15.91
              } else if (weight <= 14760) {
                theFbaFee = 16.84
              } else if (weight <= 19760) {
                theFbaFee = 17.67
              } else if (weight <= 24760) {
                theFbaFee = 19.31
              } else if (weight <= 29760) {
                theFbaFee = 119.77
              } else {
                theFbaFee = 0.0
              }
              theTier = OVERSIZE_LARGE_STRING_SHORT
              theFullTierDescription = OVERSIZE_LARGE_STRING
            }
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        if (category == 'Ordinateurs, Périphériques PC et Téléviseurs') {
          theReferralFee = thePrice * 0.05 > 0.3 ? thePrice * 0.05 : 0.3
        } else if (['Ordinateurs', 'High-tech', 'Gros électroménager'].includes(category)) {
          theReferralFee = thePrice * 0.721 > 0.3 ? thePrice * 0.721 : 0.3
        } else if (category == 'Consoles de Jeux-Vidéo') {
          theReferralFee = thePrice * 0.0824
        } else if (['Beauté'].includes(category)) {
          theReferralFee = thePrice * 0.0824 ? thePrice * 0.0824 : 0.3
        } else if (category == 'Pneus') {
          theReferralFee = thePrice * 0.103 > 0.3 ? thePrice * 0.103 : 0.3
        } else if (
          [
            'Accessoires High-Tech',
            'Bricolage',
            'Instruments de musique',
            'Fournitures électriques industrielles',
            'Outils et instruments industriels'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.1236 > 0.3 ? thePrice * 0.1236 : 0.3
        } else if (category == 'Montres') {
          theReferralFee = thePrice * 0.1545 > 0.3 ? thePrice * 0.1545 : 0.3
        } else if (category == 'Bijoux') {
          theReferralFee = thePrice * 0.206 > 0.3 ? thePrice * 0.206 : 0.3
        } else {
          theReferralFee = thePrice * 0.1545 > 0.3 ? thePrice * 0.1545 : 0.3
        }

        //Calculate Variable Closing Fee
        if (category == 'Image & Son, Micro & Photo' || category == 'Accessoires Kindle') {
          theClosingFee = 0.79
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for DE
function DEFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = ['Bücher', 'Musik', 'VHS', 'DVD', 'DVD & Blu-ray', 'Software']
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  //Conver pound to gram
  const weight = parseFloat(_weight * 453.592)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Get the tier value
    if (largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //S. Stand
        if (theTierNumber == STANDARD_NUM) {
          if (thePrice <= 350) {
            if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
              theFbaFee = 1.09
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 2.5 &&
              weight <= 460
            ) {
              if (weight <= 210) {
                theFbaFee = 1.24
              } else if (weight <= 460) {
                theFbaFee = 1.26
              } else {
                theFbaFee = 0.0
              }
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 5 &&
              weight <= 960
            ) {
              theFbaFee = 1.72
            } else if (
              largestValue <= 45 &&
              mediumValue <= 34 &&
              smallestValue <= 26 &&
              weight <= 11900
            ) {
              if (weight <= 150) {
                theFbaFee = 1.88
              } else if (weight <= 400) {
                theFbaFee = 1.94
              } else if (weight <= 900) {
                theFbaFee = 2.62
              } else if (weight <= 1400) {
                theFbaFee = 2.63
              } else if (weight <= 1900) {
                theFbaFee = 2.65
              } else if (weight <= 4900) {
                theFbaFee = 3.87
              } else if (weight <= 11900) {
                theFbaFee = 3.92
              } else {
                theFbaFee = 0.0
              }
            }
          } else {
            theFbaFee = 0.0
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          if (thePrice <= 350) {
            //S. Over
            if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
              if (weight <= 760) {
                theFbaFee = 4.78
              } else if (weight <= 1010) {
                theFbaFee = 4.89
              } else if (weight <= 1510) {
                theFbaFee = 4.92
              } else if (weight <= 1760) {
                theFbaFee = 4.99
              } else {
                theFbaFee = 0.0
              }
              theTier = OVERSIZE_SMALL_STRING_SHORT
              theFullTierDescription = OVERSIZE_SMALL_STRING
            }
            //R. Over
            else if (
              largestValue <= 120 &&
              mediumValue <= 60 &&
              smallestValue <= 60 &&
              weight <= 29760
            ) {
              if (weight <= 760) {
                theFbaFee = 4.8
              } else if (weight <= 1760) {
                theFbaFee = 4.99
              } else if (weight <= 2760) {
                theFbaFee = 5.89
              } else if (weight <= 5760) {
                theFbaFee = 5.93
              } else if (weight <= 6760) {
                theFbaFee = 6.02
              } else if (weight <= 8760) {
                theFbaFee = 6.06
              } else if (weight <= 9760) {
                theFbaFee = 6.09
              } else if (weight <= 14760) {
                theFbaFee = 6.63
              } else if (weight <= 19760) {
                theFbaFee = 7.06
              } else if (weight <= 29760) {
                theFbaFee = 8.03
              } else {
                theFbaFee = 0.0
              }
              theTier = OVERSIZE_REGULAR_STRING_SHORT
              theFullTierDescription = OVERSIZE_REGULAR_STRING
            }
            //L. Over
            else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
              if (weight <= 4760) {
                theFbaFee = 6.05
              } else if (weight <= 9760) {
                theFbaFee = 7.05
              } else if (weight <= 14760) {
                theFbaFee = 7.57
              } else if (weight <= 19760) {
                theFbaFee = 8.03
              } else if (weight <= 24760) {
                theFbaFee = 8.94
              } else if (weight <= 29760) {
                theFbaFee = 8.96
              } else {
                theFbaFee = 0.0
              }
              theTier = OVERSIZE_LARGE_STRING_SHORT
              theFullTierDescription = OVERSIZE_LARGE_STRING
            }
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        theReferralFee = thePrice * 0.15

        //Calculate Variable Closing Fee
        theClosingFee = 1.01

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //Stand
        if (theTierNumber == STANDARD_NUM) {
          if (thePrice <= 350) {
            if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
              theFbaFee = 1.63
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 2.5 &&
              weight <= 460
            ) {
              if (weight <= 60) {
                theFbaFee = 1.79
              } else if (weight <= 210) {
                theFbaFee = 1.92
              } else {
                theFbaFee = 2.04
              }
            } else if (
              largestValue <= 33 &&
              mediumValue <= 23 &&
              smallestValue <= 5 &&
              weight <= 960
            ) {
              theFbaFee = 2.4
            } else if (
              largestValue <= 45 &&
              mediumValue <= 34 &&
              smallestValue <= 26 &&
              weight <= 11900
            ) {
              if (weight <= 150) {
                theFbaFee = 2.53
              } else if (weight <= 400) {
                theFbaFee = 2.81
              } else if (weight <= 900) {
                theFbaFee = 3.22
              } else if (weight <= 1400) {
                theFbaFee = 3.76
              } else if (weight <= 1900) {
                theFbaFee = 4.09
              } else if (weight <= 2900) {
                theFbaFee = 4.57
              } else if (weight <= 3900) {
                theFbaFee = 4.95
              } else if (weight <= 4900) {
                theFbaFee = 5.02
              } else if (weight <= 6900) {
                theFbaFee = 5.41
              } else if (weight <= 9900) {
                theFbaFee = 5.55
              } else if (weight <= 10900) {
                theFbaFee = 5.74
              } else {
                theFbaFee = 5.75
              }
            }
          } else {
            theFbaFee = 0.0
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 760) {
              theFbaFee = 5.33
            } else if (weight <= 1010) {
              theFbaFee = 5.45
            } else if (weight <= 1510) {
              theFbaFee = 5.49
            } else {
              theFbaFee = 5.57
            }
            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          } else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 5.33
            } else if (weight <= 1760) {
              theFbaFee = 5.57
            } else if (weight <= 2760) {
              theFbaFee = 6.5
            } else if (weight <= 4760) {
              theFbaFee = 6.55
            } else if (weight <= 5760) {
              theFbaFee = 6.76
            } else if (weight <= 6760) {
              theFbaFee = 6.86
            } else if (weight <= 8760) {
              theFbaFee = 6.91
            } else if (weight <= 9760) {
              theFbaFee = 6.94
            } else if (weight <= 14760) {
              theFbaFee = 7.53
            } else if (weight <= 19760) {
              theFbaFee = 8
            } else {
              theFbaFee = 9.06
            }
            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 7.11
            } else if (weight <= 9760) {
              theFbaFee = 8.2
            } else if (weight <= 14760) {
              theFbaFee = 8.78
            } else if (weight <= 19760) {
              theFbaFee = 9.28
            } else if (weight <= 24760) {
              theFbaFee = 10.27
            } else if (weight <= 29760) {
              theFbaFee = 10.29
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          }
        }

        //Get the referral fee
        if (
          [
            'Additive Fertigung',
            'Baumarkt',
            'Durchflussregelung & Filtration',
            'Flüssigkeitstransfer',
            'Industrielle Elektroinstallation ',
            'Industrielle Werkzeuge & Instrumente',
            'Materialtransportprodukte',
            'Schleifmittel & Veredlungsprodukte',
            'Musikinstrumente & DJ-Equipment',
            'Handmade'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.12 > 0.3 ? thePrice * 0.12 : 0.3
        } else if (category == 'Bier, Wein und Spirituosen') {
          theReferralFee = thePrice * 0.1
        } else if (['Computer', 'Elektronik', 'Elektro-Großgeräte'].includes(category)) {
          theReferralFee = thePrice * 0.07 > 0.3 ? thePrice * 0.07 : 0.3
        } else if (['Fahrräder'].includes(category)) {
          theReferralFee = thePrice * 0.1 > 0.3 ? thePrice * 0.1 : 0.3
        } else {
          theReferralFee = thePrice * 0.15 > 0.3 ? thePrice * 0.15 : 0.3
        }

        //Calculate Variable Closing Fee
        if (category == 'PC & Videospiele') {
          theClosingFee = 1.01
        } else if (
          category == 'Elektronik & Foto' ||
          category == 'Kindle-Zubehör' ||
          category == 'Küche, Haus & Garten' ||
          category == 'Spielwaren'
        ) {
          theClosingFee = 0.45 + (0.15 * weight) / 1000
        } else if (category == 'sport') {
          theClosingFee = 0.8
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for IN
function INFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Complete the proccess to get the tier
  if (completeProcess) {
    //Conver pound to gram
    const weight = parseFloat(_weight * 453.592)
    let tierWeight = null
    const UW = weight
    let DW = (largestValue * mediumValue * smallestValue) / 5
    DW = parseFloat(DW)
    if (UW > DW) {
      tierWeight = UW
    } else {
      tierWeight = DW
    }

    //Get the tier value
    if (
      largestValue <= 30.48 &&
      mediumValue <= 20.32 &&
      smallestValue <= 10.16 &&
      tierWeight <= 950
    ) {
      theTier = STANDARD_SMALL_STRING_SHORT
      theFullTierDescription = STANDARD_SMALL_STRING
      theTierNumber = STANDARD_SMALL_NUM
    } else if (
      largestValue <= 50.8 &&
      mediumValue <= 40.64 &&
      smallestValue <= 25.4 &&
      tierWeight <= 11900
    ) {
      theTier = STANDARD_STRING
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else if (tierWeight > 29760) {
      theTier = OVERSIZE_SPECIAL_STRING_SHORT
      theFullTierDescription = OVERSIZE_SPECIAL_STRING
      theTierNumber = OVERSIZE_SPECIAL_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Get the FBA fees
    if (!isNaN(thePrice)) {
      //S. Stand small
      if (theTierNumber == STANDARD_SMALL_NUM) {
        if (thePrice <= 20000) {
          const outboundweight = tierWeight + 50
          if (outboundweight <= 500) {
            return 10 + 28
          } else {
            return 28 + Math.round(outboundweight / 500) * 16
          }
        } else {
          theFbaFee = 0.0
        }
      }
      //S. Stand
      else if (theTierNumber == STANDARD_NUM) {
        if (thePrice <= 20000) {
          const outboundweight = tierWeight + 100
          if (outboundweight <= 500) {
            return 10 + 28
          } else if (weight <= 1000) {
            return 54
          } else {
            return 54 + Math.round((outboundweight - 1000) / 1000) * 10
          }
        } else {
          theFbaFee = 0.0
        }
      }
      //Oversize and Oversize special
      else if (theTierNumber == OVERSIZE_SPECIAL_NUM || theTierNumber == OVERSIZE_NUM) {
        const outboundweight = tierWeight + 240
        if (outboundweight <= 5000) {
          return 25 + 67
        } else {
          return 25 + 67 + Math.round((outboundweight - 5000) / 1000) * 10
        }
      }

      //Get the referral fee
      if ((category == 'Car & Motorbike', 'Silver Coins and Bars', 'Fine Jewellery (Gold Coins)')) {
        theReferralFee = thePrice * 0.02
      } else if (['Electronics', 'Beauty products'].includes(category)) {
        theReferralFee = thePrice * 0.04
      } else if (
        [
          'Music',
          'Video',
          'Fine Jewellery (unstudded and solitaire)',
          'Ladders, Home security systems, Kitchen and Bath fixtures',
          'Lawn & Garden- Solar devices',
          'Lawn & Garden- Outdoor Equipments',
          'Automotive - Tyres and Rims',
          'BISS',
          'Musical Instruments - Keyboards',
          'Consumable Physical Gift Card',
          'Mobile Phones & Tablets',
          'Laptops',
          'Camera and Camcorder'
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.05
      } else if (
        [
          'Musical Instruments',
          'Baby Products',
          'Bicycles',
          'Sports- Cricket and Badminton Equipments',
          'Tennis, Table Tennis and Squash',
          'Football, Volleyball, Basketball and Throwball',
          'Swimming',
          'Television'
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.06
      } else if (
        [
          'Industrial & Scientific',
          'Toys & Games',
          'Camera Lenses',
          'Video Games - Consoles',
          'Camera Lenses',
          'Luggage- Suitcase and Trolleys',
          'Gas Stoves and Pressure Cookers',
          'Glassware and Ceramic ware',
          'LED Bulbs and Battens',
          'Office Products',
          'PC Components (RAM, Motherboards)',
          'Laptops Bags & Sleeves'
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.07
      } else if (
        [
          'Silver Jewellery',
          'Fine Jewellery (studded)',
          'Home improvement (excl. accessories)',
          'Clocks',
          'Industrial Supplies',
          'Industrial Supplies',
          'Scanners and Printers'
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.08
      } else if (
        [
          'Pet Supplies',
          'Sports, Fitness & Outdoors',
          'Video Games - Accessories',
          'Handbags',
          'Lawn & Garden- Other subcategories'
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.1
      } else if (['Memory Cards'].includes(category)) {
        theReferralFee = thePrice * 0.12
      } else if (
        [
          'Health and Personal Care (HPC)',
          'Large Appliances Accessories',
          'Camera Accessories',
          'Speakers'
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.11
      } else if (['Automotive Accessories', 'Pantry'].includes(category)) {
        theReferralFee = thePrice * 0.13
      } else if (['Watches', 'Indoor Lighting (except LED bulbs and battens)', 'GPS Devices']) {
        theReferralFee = thePrice * 0.135
      } else if (
        [
          'Laptop Battery',
          'Modems & networking devices',
          'Headsets, Headphones and Earphones '
        ].includes(category)
      ) {
        theReferralFee = thePrice * 0.14
      } else if (['Coins Collectibles'].includes(category)) {
        theReferralFee = thePrice * 0.15
      } else if (['Shows'].includes(category)) {
        theReferralFee = thePrice * 0.155
      } else if (['USB flash drives (Pen Drives)', 'Keyboards and Mouse'].includes(category)) {
        theReferralFee = thePrice * 0.16
      } else if (category == 'Apparel Accessories') {
        theReferralFee = thePrice * 0.17
      } else {
        theReferralFee = thePrice * 0.18
      }

      //Calculate Variable Closing Fee
      if (
        category == 'Beauty' ||
        category == 'Grocery & Gourmet Food' ||
        category == 'Health & Personal Care' ||
        category == 'Movies & TV Shows' ||
        category == 'Software' ||
        category == 'Pet Supplies'
      ) {
        if (thePrice <= 250) {
          theClosingFee = 0.0
        } else if (thePrice <= 500) {
          theClosingFee = 5
        } else {
          theClosingFee = 10
        }
      }

      //Final FBA Fees
      theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
      theTotalFbaFee = theTotalFbaFee.toFixed(2)
    } //End if we have a price
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for MX
function MXFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = [
    'Libros',
    'Películas',
    'Música',
    'Videojuegos',
    'Revistas y Software'
  ]
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  //Conver pound to gram
  const weight = parseFloat(_weight * 453.592)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Get the tier value
    if (largestValue <= 45 && mediumValue <= 35 && smallestValue <= 20 && weight <= 8900) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Check the thePrice , we need that
      if (!isNaN(thePrice)) {
        //Get the FBA fees
        if (theTierNumber == STANDARD_NUM) {
          let outboundweight = 0.0
          if (weight <= 500) {
            outboundweight = weight + 75
          } else {
            outboundweight = weight + 125
          }

          if (outboundweight <= 500) {
            theFbaFee = 31
          } else if (outboundweight <= 1000) {
            theFbaFee = 32
          } else if (outboundweight <= 2000) {
            theFbaFee = 34
          } else if (outboundweight <= 5000) {
            theFbaFee = 37.05
          } else {
            theFbaFee = 37.05 + 2.8 * Math.round((outboundweight - 500) / 500)
          }
        } else if (theTierNumber == OVERSIZE_NUM) {
          const outboundweight = weight + 500
          if (outboundweight <= 500) {
            theFbaFee = 43.3
          } else if (outboundweight <= 1000) {
            theFbaFee = 44.3
          } else if (outboundweight <= 2000) {
            theFbaFee = 46.3
          } else if (outboundweight <= 5000) {
            theFbaFee = 49.35
          } else {
            theFbaFee = 49.35 + 2.8 * Math.round((outboundweight - 500) / 500)
          }
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      }
    } //End if the category is listed and start method two
    else {
      //Check the thePrice , we need that
      if (!isNaN(thePrice)) {
        //Get the FBA fees
        if (theTierNumber == STANDARD_NUM) {
          let outboundweight = 0.0
          if (weight <= 500) {
            outboundweight = weight + 75
          } else {
            outboundweight = weight + 125
          }

          if (outboundweight <= 250) {
            theFbaFee = 53.65
          } else if (outboundweight <= 500) {
            theFbaFee = 57.15
          } else if (outboundweight <= 1000) {
            theFbaFee = 62.65
          } else if (outboundweight <= 2000) {
            theFbaFee = 66.7
          } else if (outboundweight <= 5000) {
            theFbaFee = 76.21
          } else {
            theFbaFee = 76.21 + 2.8 * Math.round((outboundweight - 5000) / 500)
          }
        } else if (theTierNumber == OVERSIZE_NUM) {
          const outboundweight = weight + 500
          if (outboundweight <= 1000) {
            theFbaFee = 75.38
          } else if (outboundweight <= 2000) {
            theFbaFee = 80.99
          } else if (outboundweight <= 5000) {
            theFbaFee = 88.25
          } else {
            theFbaFee = 88.25 + 3.13 * Math.round((outboundweight - 5000) / 500)
          }
        }

        if (['Automotriz y Motocicletas'].includes(category)) {
          theReferralFee = thePrice * 0.12 > 10 ? thePrice * 0.12 : 10
        } else if (
          [
            'Cámaras y Fotografía',
            'Electrónicos',
            'Entretenimiento en casa',
            'Entretenimiento en casa',
            'Computadoras personales',
            'Tecnología inalámbrica'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.1 > 10 ? thePrice * 0.1 : 10
        } else if (
          ['Productos para bebé', 'Alimentación', 'Videoconsolas', 'Bebidas alcohólicas'].includes(
            category
          )
        ) {
          theReferralFee = thePrice * 0.08 > 10 ? thePrice * 0.08 : 10
        } else if (['Joyería'].includes(category)) {
          theReferralFee = thePrice * 0.2 > 10 ? thePrice * 0.2 : 10
        } else if (['Relojes'].includes(category)) {
          theReferralFee = thePrice * 0.16 > 10 ? thePrice * 0.16 : 10
        } else {
          theReferralFee = thePrice * 0.15 > 10 ? thePrice * 0.15 : 10
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for IT
function ITFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = ['Libri', 'DVD', 'VHS', 'Video']
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  //Conver pound to gram
  const weight = parseFloat(_weight * 453.592)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Get the tier value
    if (largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //S. Stand
        if (theTierNumber == STANDARD_NUM) {
          if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
            theFbaFee = 2.26
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 2.5 &&
            weight <= 460
          ) {
            if (weight <= 60) {
              theFbaFee = 2.33
            } else if (weight <= 210) {
              theFbaFee = 2.4
            } else if (weight <= 460) {
              theFbaFee = 2.43
            } else {
              theFbaFee = 0.0
            }
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 5 &&
            weight <= 960
          ) {
            theFbaFee = 2.83
          } else if (
            largestValue <= 45 &&
            mediumValue <= 34 &&
            smallestValue <= 26 &&
            weight <= 11900
          ) {
            if (weight <= 150) {
              theFbaFee = 3.1
            } else if (weight <= 400) {
              theFbaFee = 3.2
            } else if (weight <= 900) {
              theFbaFee = 3.3
            } else if (weight <= 1400) {
              theFbaFee = 3.4
            } else if (weight <= 2900) {
              theFbaFee = 4.8
            } else if (weight <= 4900) {
              theFbaFee = 4.97
            } else if (weight <= 11900) {
              theFbaFee = 5.02
            } else {
              theFbaFee = 0.0
            }
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          //S. Over
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 760) {
              theFbaFee = 5.77
            } else if (weight <= 1010) {
              theFbaFee = 5.9
            } else if (weight <= 1260) {
              theFbaFee = 6.11
            } else if (weight <= 1510) {
              theFbaFee = 6.15
            } else if (weight <= 1760) {
              theFbaFee = 6.19
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          }
          //R. Over
          else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 6.08
            } else if (weight <= 1760) {
              theFbaFee = 6.19
            } else if (weight <= 2760) {
              theFbaFee = 6.2
            } else if (weight <= 3760) {
              theFbaFee = 6.63
            } else if (weight <= 4760) {
              theFbaFee = 6.66
            } else if (weight <= 6760) {
              theFbaFee = 7.4
            } else if (weight <= 7760) {
              theFbaFee = 7.5
            } else if (weight <= 9760) {
              theFbaFee = 7.55
            } else if (weight <= 14760) {
              theFbaFee = 8.33
            } else if (weight <= 19760) {
              theFbaFee = 8.6
            } else if (weight <= 24760) {
              theFbaFee = 9.16
            } else if (weight <= 29760) {
              theFbaFee = 9.6
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 6.66
            } else if (weight <= 9760) {
              theFbaFee = 7.55
            } else if (weight <= 14760) {
              theFbaFee = 8.33
            } else if (weight <= 19760) {
              theFbaFee = 8.6
            } else if (weight <= 29760) {
              theFbaFee = 9.6
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        theReferralFee = thePrice * 0.15

        //Calculate Variable Closing Fee
        theClosingFee = 0.36

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //Stand
        if (theTierNumber == STANDARD_NUM) {
          if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
            theFbaFee = 2.59
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 2.5 &&
            weight <= 460
          ) {
            if (weight <= 60) {
              theFbaFee = 2.72
            } else if (weight <= 210) {
              theFbaFee = 3.01
            } else {
              theFbaFee = 3.19
            }
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 5 &&
            weight <= 960
          ) {
            theFbaFee = 3.44
          } else if (
            largestValue <= 45 &&
            mediumValue <= 34 &&
            smallestValue <= 26 &&
            weight <= 11900
          ) {
            if (weight <= 150) {
              theFbaFee = 3.52
            } else if (weight <= 400) {
              theFbaFee = 3.94
            } else if (weight <= 900) {
              theFbaFee = 4.59
            } else if (weight <= 1400) {
              theFbaFee = 4.94
            } else if (weight <= 1900) {
              theFbaFee = 5.16
            } else if (weight <= 2900) {
              theFbaFee = 5.98
            } else if (weight <= 3900) {
              theFbaFee = 6.7
            } else if (weight <= 4900) {
              theFbaFee = 7.11
            } else if (weight <= 6900) {
              theFbaFee = 7.96
            } else if (weight <= 7900) {
              theFbaFee = 8.22
            } else if (weight <= 8900) {
              theFbaFee = 8.25
            } else if (weight <= 10900) {
              theFbaFee = 8.42
            } else {
              theFbaFee = 8.44
            }
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 760) {
              theFbaFee = 7.8
            } else if (weight <= 1010) {
              theFbaFee = 7.98
            } else if (weight <= 1260) {
              theFbaFee = 8.26
            } else if (weight <= 1510) {
              theFbaFee = 8.31
            } else {
              theFbaFee = 8.36
            }
            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          } else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 8.26
            } else if (weight <= 1760) {
              theFbaFee = 8.4
            } else if (weight <= 2760) {
              theFbaFee = 8.41
            } else if (weight <= 3760) {
              theFbaFee = 8.99
            } else if (weight <= 4760) {
              theFbaFee = 9.03
            } else if (weight <= 6760) {
              theFbaFee = 10.02
            } else if (weight <= 7760) {
              theFbaFee = 10.16
            } else if (weight <= 8760) {
              theFbaFee = 10.22
            } else if (weight <= 9760) {
              theFbaFee = 10.28
            } else if (weight <= 14760) {
              theFbaFee = 11.39
            } else if (weight <= 19760) {
              theFbaFee = 11.74
            } else if (weight <= 24760) {
              theFbaFee = 12.49
            } else {
              theFbaFee = 13.12
            }
            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 11.05
            } else if (weight <= 9760) {
              theFbaFee = 12.58
            } else if (weight <= 14760) {
              theFbaFee = 13.86
            } else if (weight <= 19760) {
              theFbaFee = 14.31
            } else if (weight <= 24760) {
              theFbaFee = 16.05
            } else if (weight <= 29760) {
              theFbaFee = 16.15
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        if (
          ['Elettronica', 'Informatica', 'Pneumatici', 'Grandi elettrodomestici'].includes(category)
        ) {
          theReferralFee = thePrice * 0.0721 > 0.3 ? thePrice * 0.0721 : 0.3
        } else if (category == 'Informatica: Portatili') {
          theReferralFee = thePrice * 0.05 > 0.3 ? thePrice * 0.05 : 0.3
        } else if (category == 'Console videogiochi') {
          theReferralFee = thePrice * 0.0824
        } else if (category == 'Pneumatici') {
          theReferralFee = thePrice * 0.103 > 0.3 ? thePrice * 0.103 : 0.3
        } else if (
          [
            'Fai da te',
            'Impianti elettrici',
            'Lavorazione metalli',
            'Stampa 3D',
            'Strumenti musicali e DJ',
            'Utensili Manuali ed Electrici',
            'Accessori Elettronica',
            'Lavorazione dei metalli',
            'Strumenti musicali e DJ',
            'Prodotti per il trasporto di materiali',
            'Impianti elettrici',
            'Strumenti e attrezzatura industriale',
            'Trasferimento di fluidi',
            'Controllo di flusso e filtrazione'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.1236 > 0.3 ? thePrice * 0.1236 : 0.3
        } else if (['Software', 'Videogiochi'].includes(category)) {
          theReferralFee = thePrice * 0.1545
        } else if (category == 'Gioielli') {
          theReferralFee = thePrice * 0.2 > 0.3 ? thePrice * 0.2 : 0.3
        } else {
          theReferralFee = thePrice * 0.1545 > 0.3 ? thePrice * 0.1545 : 0.3
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}

//----------------------------------------------------//
//return FBA fee and tier for ES
function ESFbaFeeAndTier(category, price, length, width, height, _weight) {
  let thePrice = pureNumber(price) //I need just the number

  const firstMethodCategories = [
    'Libros',
    'Música',
    'Videojuegos',
    'DVDs, Blu-ray, VHS',
    'Software'
  ]
  let theFbaFee = 'N.A.'
  let theTotalFbaFee = 'N.A.'
  let theTier = 'N.A.'
  let theFullTierDescription = 'N.A.'
  let theTierNumber = 0
  let theReferralFee = 0.0
  let theClosingFee = 0.0
  let dimensionArrayAsc = [length, width, height]
  dimensionArrayAsc = dimensionArrayAsc.sort(function(a, b) {
    return a - b
  }) //Sort in ASC

  //Convert from inch to cm
  const smallestValue = parseFloat(dimensionArrayAsc[0] * 2.54)
  const mediumValue = parseFloat(dimensionArrayAsc[1] * 2.54)
  const largestValue = parseFloat(dimensionArrayAsc[2] * 2.54)

  //Conver pound to gram
  const weight = parseFloat(_weight * 453.592)

  const completeProcess =
    !isNaN(weight) && !isNaN(smallestValue) && !isNaN(mediumValue) && !isNaN(largestValue)
      ? true
      : false
  thePrice = parseFloat(thePrice)

  //Round all values
  if (completeProcess) {
    //Get the tier value
    if (largestValue <= 45 && mediumValue <= 34 && smallestValue <= 26 && weight <= 11900) {
      theTier = STANDARD_STRING_SHORT
      theFullTierDescription = STANDARD_STRING
      theTierNumber = STANDARD_NUM
    } else {
      theTier = OVERSIZE_STRING_SHORT
      theFullTierDescription = OVERSIZE_STRING
      theTierNumber = OVERSIZE_NUM
    }

    //Complete the proccess to get the tier
    if ($.inArray(category, firstMethodCategories) != -1) {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //S. Stand
        if (theTierNumber == STANDARD_NUM) {
          if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
            theFbaFee = 1.34
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 2.5 &&
            weight <= 460
          ) {
            if (weight <= 460) {
              theFbaFee = 1.38
            } else {
              theFbaFee = 0.0
            }
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 5 &&
            weight <= 960
          ) {
            if (weight <= 960) {
              theFbaFee = 1.84
            } else {
              theFbaFee = 0.0
            }
          } else if (
            largestValue <= 45 &&
            mediumValue <= 34 &&
            smallestValue <= 26 &&
            weight <= 11900
          ) {
            if (weight <= 150) {
              theFbaFee = 1.56
            } else if (weight <= 400) {
              theFbaFee = 1.74
            } else if (weight <= 900) {
              theFbaFee = 2.56
            } else if (weight <= 1400) {
              theFbaFee = 2.71
            } else if (weight <= 1900) {
              theFbaFee = 2.78
            } else if (weight <= 4900) {
              theFbaFee = 4.16
            } else if (weight <= 6900) {
              theFbaFee = 4.54
            } else if (weight <= 7900) {
              theFbaFee = 4.8
            } else if (weight <= 11900) {
              theFbaFee = 5.02
            } else {
              theFbaFee = 0.0
            }
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          //S. Over
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 1010) {
              theFbaFee = 3.61
            } else if (weight <= 1510) {
              theFbaFee = 3.91
            } else if (weight <= 1760) {
              theFbaFee = 4.16
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          }
          //R. Over
          else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 3.95
            } else if (weight <= 1760) {
              theFbaFee = 4.41
            } else if (weight <= 2760) {
              theFbaFee = 4.89
            } else if (weight <= 3760) {
              theFbaFee = 4.94
            } else if (weight <= 4760) {
              theFbaFee = 5.09
            } else if (weight <= 5760) {
              theFbaFee = 6.48
            } else if (weight <= 6760) {
              theFbaFee = 6.6
            } else if (weight <= 7760) {
              theFbaFee = 6.8
            } else if (weight <= 8760) {
              theFbaFee = 7.2
            } else if (weight <= 9760) {
              theFbaFee = 7.5
            } else if (weight <= 14760) {
              theFbaFee = 8.07
            } else if (weight <= 24760) {
              theFbaFee = 8.76
            } else if (weight <= 29760) {
              theFbaFee = 9.73
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 5.09
            } else if (weight <= 9760) {
              theFbaFee = 7.5
            } else if (weight <= 14760) {
              theFbaFee = 8.11
            } else if (weight <= 19760) {
              theFbaFee = 8.76
            } else if (weight <= 24760) {
              theFbaFee = 9.5
            } else if (weight <= 29760) {
              theFbaFee = 10.9
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        theReferralFee = thePrice * 0.15

        //Calculate Variable Closing Fee
        if (category == 'Libros' || category == 'Video' || category == 'DVD & Blu-ray') {
          theClosingFee = 0.45
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
      } //End if we have a price
    } //End if the category is listed and start method two
    else {
      //Get the FBA fees
      if (!isNaN(thePrice)) {
        //Stand
        if (theTierNumber == STANDARD_NUM) {
          if (largestValue <= 20 && mediumValue <= 15 && smallestValue <= 1 && weight <= 80) {
            theFbaFee = 2.13
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 2.5 &&
            weight <= 460
          ) {
            if (weight <= 60) {
              theFbaFee = 2.37
            } else if (weight <= 210) {
              theFbaFee = 2.65
            } else {
              theFbaFee = 2.85
            }
          } else if (
            largestValue <= 33 &&
            mediumValue <= 23 &&
            smallestValue <= 5 &&
            weight <= 960
          ) {
            theFbaFee = 2.97
          } else if (
            largestValue <= 45 &&
            mediumValue <= 34 &&
            smallestValue <= 26 &&
            weight <= 11900
          ) {
            if (weight <= 150) {
              theFbaFee = 2.82
            } else if (weight <= 400) {
              theFbaFee = 3.3
            } else if (weight <= 900) {
              theFbaFee = 3.6
            } else if (weight <= 1400) {
              theFbaFee = 4.05
            } else if (weight <= 1900) {
              theFbaFee = 4.11
            } else if (weight <= 2900) {
              theFbaFee = 4.67
            } else if (weight <= 3900) {
              theFbaFee = 5.58
            } else if (weight <= 4900) {
              theFbaFee = 5.64
            } else if (weight <= 6900) {
              theFbaFee = 6.04
            } else if (weight <= 10900) {
              theFbaFee = 6.19
            } else {
              theFbaFee = 6.2
            }
          }
          theTier = STANDARD_STRING_SHORT
          theFullTierDescription = STANDARD_STRING
        }
        //Oversize
        else if (theTierNumber == OVERSIZE_NUM) {
          if (largestValue <= 61 && mediumValue <= 46 && smallestValue <= 46 && weight <= 1760) {
            if (weight <= 1010) {
              theFbaFee = 5.31
            } else if (weight <= 1510) {
              theFbaFee = 5.76
            } else {
              theFbaFee = 5.97
            }
            theTier = OVERSIZE_SMALL_STRING_SHORT
            theFullTierDescription = OVERSIZE_SMALL_STRING
          } else if (
            largestValue <= 120 &&
            mediumValue <= 60 &&
            smallestValue <= 60 &&
            weight <= 29760
          ) {
            if (weight <= 760) {
              theFbaFee = 5.35
            } else if (weight <= 1760) {
              theFbaFee = 5.97
            } else if (weight <= 2760) {
              theFbaFee = 6.61
            } else if (weight <= 3760) {
              theFbaFee = 6.67
            } else if (weight <= 4760) {
              theFbaFee = 6.89
            } else if (weight <= 5760) {
              theFbaFee = 8.76
            } else if (weight <= 6760) {
              theFbaFee = 8.92
            } else if (weight <= 7760) {
              theFbaFee = 9.19
            } else if (weight <= 8760) {
              theFbaFee = 9.73
            } else if (weight <= 9760) {
              theFbaFee = 10.13
            } else if (weight <= 14760) {
              theFbaFee = 10.9
            } else if (weight <= 24760) {
              theFbaFee = 11.83
            } else {
              theFbaFee = 13.14
            }
            theTier = OVERSIZE_REGULAR_STRING_SHORT
            theFullTierDescription = OVERSIZE_REGULAR_STRING
          }
          //L. Over
          else if (largestValue > 120 || mediumValue > 60 || smallestValue > 60) {
            if (weight <= 4760) {
              theFbaFee = 7.93
            } else if (weight <= 9760) {
              theFbaFee = 11.65
            } else if (weight <= 14760) {
              theFbaFee = 12.59
            } else if (weight <= 19760) {
              theFbaFee = 13.6
            } else if (weight <= 24760) {
              theFbaFee = 14.75
            } else if (weight <= 29760) {
              theFbaFee = 16.92
            } else {
              theFbaFee = 0.0
            }
            theTier = OVERSIZE_LARGE_STRING_SHORT
            theFullTierDescription = OVERSIZE_LARGE_STRING
          } else {
            theFbaFee = 0.0
          }
        }

        //Get the referral fee
        if (['Electrónica', 'Informática'].includes(category)) {
          theReferralFee = thePrice * 0.07 * 0.3 ? thePrice * 0.07 : 0.3
        } else if (category == 'Consolas de videojuegos') {
          theReferralFee = thePrice * 0.08
        } else if (['Neumáticos', 'Cerveza, vino y licores'].includes(category)) {
          theReferralFee = thePrice * 0.1 > 0.3 ? thePrice * 0.1 : 0.3
        } else if (
          [
            'Trabajo del metal',
            'Manutención',
            'Accesorios de informática',
            'Instrumentos musicales',
            'Accesorios de electrónica',
            'Eléctrica industrial',
            'Herramientas eléctricas y de mano',
            'Herramientas e instrumental industrial',
            'Impresión y escaneo 3D',
            'Bricolaje y herramientas',
            'Siderurgia',
            'Instrumentos musicales y equipos para DJ',
            'Suministros de energía renovable',
            'Transferencia de líquidos',
            'Control y filtración de flujo',
            'Bricolaje y herramientas'
          ].includes(category)
        ) {
          theReferralFee = thePrice * 0.12
        } else if (category == 'Informática: Ordenadores Portátiles y Tablets') {
          theReferralFee = thePrice * 0.07 > 0.3 ? thePrice * 0.07 : 0.3
        } else if (category == 'Joyería') {
          theReferralFee = thePrice * 0.2 > 0.3 ? thePrice * 0.2 : 0.3
        } else {
          theReferralFee = thePrice * 0.15 > 0.3 ? thePrice * 0.15 : 0.3
        }

        //Final FBA Fees
        theTotalFbaFee = theFbaFee + theReferralFee + theClosingFee
        theTotalFbaFee = theTotalFbaFee.toFixed(2)
        theFbaFee = theFbaFee.toFixed(2)
      } //End if we have a price
    } //Other categories
  } //End if complete the process

  return {
    theTier: theTier,
    theFullTierDescription: theFullTierDescription,
    theTotalFbaFee: theTotalFbaFee,
    theFbaFee: theFbaFee,
    theReferralFee: theReferralFee,
    theClosingFee: theClosingFee
  }
}
