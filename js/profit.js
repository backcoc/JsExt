/**
 * @Author: Greg Mercer
 * Copyright © 2020 Jungle Scout
 *
 * All operations that related to profit calculator
 */

$(function() {
  const VALUE_IS_NA = -1
  //Images resources
  var imagesPath = chrome.extension.getURL('images')
  var completeActive = imagesPath + '/icons/complete-active.png'
  var loadingActive = imagesPath + '/icons/loading-active.png'

  //--------------------------------------------------------------------------------//
  //Show profit calculator for net value
  window.profitCalculator = function(propsOriginal) {
    const {
      net = 0,
      title,
      image,
      weight,
      width,
      height,
      length,
      tier,
      price,
      fbaFees,
      fbaReferralFee, // required for window.profitCalculator
      fbaVariableClosingFee, // required for window.profitCalculator
      fbaFulfillmentFee, // required for window.profitCalculator
      category
    } = propsOriginal

    //Hide other popups
    hidePopups()
    //Change current currency
    $('.js-profit-calc-popup .current-currency').text(currentCurrency)
    //Invisible other stuff
    $('#jsxMainContainer').addClass('invisible-container')
    //Clean previous values
    $('.js-profit-calc-popup .profit-result-span').text('')
    $(".js-profit-calc-popup input[name='productCost']").val('0.00')
    $('.js-profit-calc-popup .profit-product-roi input').val('')

    //Send google analytics
    chrome.runtime.sendMessage({
      action: 'googleAnalyticsAction',
      page: 'profit.js'
    })

    //Position the popup to center
    $('.js-profit-calc-popup').css({
      left:
        (
          ($('#jsxMainContainer').innerWidth() - $('.js-profit-calc-popup').innerWidth()) /
          2
        ).toString() + 'px',
      top:
        (
          ($('#jsxMainContainer').innerHeight() - $('.js-profit-calc-popup').innerHeight()) / 2 +
          10
        ).toString() + 'px'
    })

    //Product Name
    $('.profit-product-name').text(title)

    //Product Image
    $('.profit-product-img').attr('src', image)

    //Product Weight
    productWeight = weight
    if (productWeight == 'N.A.') {
      $('.profit-product-weight').html("<i class='none-info'>--</i>")
    } else {
      $('.profit-product-weight input').val(productWeight + ' ' + currentWeightUnit)
    }

    //Product Dimension
    productLength = parseFloat(length)
    productWidth = parseFloat(width)
    productHeight = parseFloat(height)
    productDimension = ''
    if (!isNaN(productLength)) {
      productDimension += productLength.toFixed(1)
    } else {
      productDimension += '--'
    }

    if (!isNaN(productWidth)) {
      productDimension += currentLWHUnit + ' × ' + productWidth.toFixed(1)
    } else {
      productDimension += '--'
    }

    if (!isNaN(productWidth)) {
      productDimension += currentLWHUnit + ' × ' + productHeight.toFixed(1)
    } else {
      productDimension += '--'
    }

    productDimension += currentLWHUnit

    $('.profit-product-dimensions input').val(productDimension)

    //Product Tier
    $('.profit-product-tier input').val(tier)

    //Product Price
    if (isNaN(price)) {
      var productPrice = 0.0
      fbaFulfillmentFee = 0.0
      fbaReferralFee = 0.0
      fbaVariableClosingFee = 0.0
      fbaFees = 0.0
    } else {
      var productPrice = parseFloat(price).toFixed(2)
    }
    $('.profit-product-price input').val(productPrice)

    //Product FBA
    var productFBA = pureNumber(fbaFulfillmentFee)
    if (isNaN(productFBA)) {
      $('.profit-product-fba').html("<i class='none-info'>--</i>")
    } else if (productFBA == VALUE_IS_NA) {
      $('.profit-product-fba input').val(currentCurrency + ' --')
    } else {
      $('.profit-product-fba input').val(currentCurrency + ' ' + parseFloat(productFBA).toFixed(2))
    }

    //Product Referral FBA
    if (isNaN(fbaReferralFee)) {
      $('.profit-product-referral-fee').html("<i class='none-info'>--</i>")
    } else if (fbaReferralFee == VALUE_IS_NA) {
      $('.profit-product-referral-fee input').val(currentCurrency + ' --')
    } else {
      $('.profit-product-referral-fee input').val(
        currentCurrency + ' ' + parseFloat(fbaReferralFee).toFixed(2)
      )
    }

    //Product Closing Fee
    if (fbaVariableClosingFee == 'N.A.') {
      $('.profit-product-closing-fee').html("<i class='none-info'>--</i>")
    } else if (fbaVariableClosingFee == VALUE_IS_NA) {
      $('.profit-product-closing-fee input').val(currentCurrency + ' --')
    } else {
      $('.profit-product-closing-fee input').val(
        currentCurrency + ' ' + parseFloat(fbaVariableClosingFee).toFixed(2)
      )
    }

    //Product Total FBA
    if (isNaN(fbaFees)) {
      $('.profit-product-total-fba').html("<i class='none-info'>--</i>")
    } else if (fbaFees == VALUE_IS_NA) {
      $('.profit-product-total-fba input').val(currentCurrency + ' --')
    } else {
      $('.profit-product-total-fba input').val(
        currentCurrency + ' ' + parseFloat(fbaFees).toFixed(2)
      )
    }

    //Product Net value
    if (net == 'N.A.') {
      $('.profit-product-net').html("<i class='none-info'>--</i>")
    } else if (net == VALUE_IS_NA) {
      $('.profit-product-net input').val(currentCurrency + ' --')
    } else {
      $('.profit-product-net input').val(currentCurrency + ' ' + parseFloat(net).toFixed(2))
    }

    //Product Category
    productCategory = category

    //View the popup
    $('.js-profit-calc-popup').fadeIn()
  }

  //--------------------------------------------------------------------------------//
  //Hide profit calculator
  $('body').on('click', '.js-profit-calc-popup #closeProfitCalc', function() {
    $('section.jsContainer .js-profit-calc-popup').fadeOut('fast')
    $('#jsxMainContainer').removeClass('invisible-container')
  })

  //--------------------------------------------------------------------------------//
  //Calculate Profit button
  $('body').on('click', '.js-profit-calc-popup #jsCalcProfitButton', function(e) {
    e.preventDefault()
    profitBtnInProcess()
    $('.js-profit-calc-popup .profit-result-span').text('')
    var currentNet = $('.js-profit-calc-popup .profit-product-net input').val()
    currentNet = pureNumber(currentNet)
    var currentProductCost = $("input[name='productCost']").val()
    currentProductCost = pureNumber(currentProductCost)
    currentProductCost = isNaN(currentProductCost) ? 0.0 : currentProductCost

    //Success
    profitSuccessState(function() {
      if (!isNaN(currentNet)) {
        var currentProfit = (currentNet - currentProductCost).toFixed(2)
        $('.js-profit-calc-popup .profit-result-span').text(currentCurrency + ' ' + currentProfit)
        //Check the ROI value
        let currentROI = (currentProfit / currentProductCost) * 100
        if (!isNaN(currentROI)) {
          currentROI = Math.round(currentROI)
          $('.js-profit-calc-popup .profit-product-roi input').val(currentROI + ' %')
        }
      } else {
        $('.js-profit-calc-popup .profit-result-span').text('--')
      }
    })
  })
  //--------------------------------------------------------------------------------//
  //Calculate Profit on click Enter button
  $('body').on('keyup', ".js-profit-calc-popup input[name='productCost']", function(e) {
    var key = e.which
    if (key == 13) {
      // the enter key code
      $('.js-profit-calc-popup #jsCalcProfitButton').click()
      return false
    }

    if ($(this).val().length == 0 || isNaN($(this).val())) {
      let theInputVal = $(this).val()
      $(this).val(theInputVal.substring(0, theInputVal.length - 1))
      return false
    }

    //Remove the grya button
    $('.js-profit-calc-popup .js-profit-submit').removeClass('js-gray-btn')
  })

  //----------------------------------------------------------------------------------//
  //Calculate fees
  $('body').on('input', ".js-profit-calc-popup input[name='profitProductPrice']", function(e) {
    var thePrice = $(this).val()
    if (thePrice && !isNaN(thePrice)) {
      thePrice = parseFloat(thePrice)
      var theFBAData = null
      if (currentTld == 'com') {
        theFBAData = USFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'uk') {
        theFBAData = UKFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'ca') {
        theFBAData = CAFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'fr') {
        theFBAData = FRFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'de') {
        theFBAData = DEFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'in') {
        theFBAData = INFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'mx') {
        theFBAData = MXFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'it') {
        theFBAData = ITFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      } else if (currentTld == 'es') {
        theFBAData = ESFbaFeeAndTier(
          productCategory,
          thePrice,
          productLength,
          productWidth,
          productHeight,
          productWeight
        )
      }

      //Product FBA
      var productFBA = theFBAData.theFbaFee
      if (isNaN(productFBA)) {
        $('.profit-product-fba').html("<i class='none-info'>--</i>")
      } else {
        $('.profit-product-fba input').val(
          currentCurrency + ' ' + parseFloat(productFBA).toFixed(2)
        )
      }

      //Product Referral FBA
      var productReferral = theFBAData.theReferralFee
      if (isNaN(productReferral)) {
        $('.profit-product-referral-fee').html("<i class='none-info'>--</i>")
      } else {
        $('.profit-product-referral-fee input').val(
          currentCurrency + ' ' + parseFloat(productReferral).toFixed(2)
        )
      }

      //Product Closing Fee
      var productClosingFee = theFBAData.theClosingFee
      if (productClosingFee == 'N.A.') {
        $('.profit-product-closing-fee').html("<i class='none-info'>--</i>")
      } else {
        $('.profit-product-closing-fee input').val(
          currentCurrency + ' ' + parseFloat(productClosingFee).toFixed(2)
        )
      }

      //Product Total FBA
      var productTotalFBA = theFBAData.theTotalFbaFee

      if (isNaN(productTotalFBA)) {
        $('.profit-product-total-fba').html("<i class='none-info'>--</i>")
      } else {
        $('.profit-product-total-fba input').val(
          currentCurrency + ' ' + parseFloat(productTotalFBA).toFixed(2)
        )
      }

      //Product Net value
      productTotalFBA = theFBAData.theTotalFbaFee
      if (isNaN(productTotalFBA)) {
        $('.profit-product-net').html("<i class='none-info'>--</i>")
      } else {
        $('.profit-product-net input').val(
          currentCurrency + ' ' + parseFloat(thePrice - productTotalFBA).toFixed(2)
        )
      }

      //Remove the grya button
      $('.js-profit-calc-popup .js-profit-submit').removeClass('js-gray-btn')
    }
  })

  //---------------------------------------------------------------------------------//
  function profitSuccessState(callback) {
    let $profitSubmitBtn = $('.js-profit-calc-popup #jsCalcProfitButton')
    const img = document.createElement('img')
    img.src = completeActive
    $('.js-profit-calc-popup #jsCalcProfitButton span').fadeOut(500, function() {
      $(this)
        .html(img)
        .fadeIn(500, function() {
          $profitSubmitBtn.fadeOut(500, function() {
            $profitSubmitBtn.html($profitSubmitBtn.attr('data-content')).fadeIn(500)
            callback.call()
            $profitSubmitBtn.addClass('js-gray-btn')
          })
        })
    })
  }
  //---------------------------------------------------------------------------------//
  function profitBtnInProcess() {
    let $profitSubmitBtn = $('.js-profit-calc-popup #jsCalcProfitButton')
    const img = document.createElement('img')
    img.src = loadingActive
    img.style = "width='15px' height='15px' class='js-processing-btn'"
    $profitSubmitBtn.find('span').html(img)
  }
})
