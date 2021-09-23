/*
 * @Author: Greg Mercer
 * Copyright © 2020 Jungle Scout
 *
 * Contains the core of JS
 */

/**
 * Supported JS API stores:
 * -----------------
 * FR
 * US
 * UK
 * CA
 * IN
 * MX
 * IT
 * ES
 * DE
 */

// State needs to be global because it's shared with the common.js
let state = null

$(function() {
  //If the file has injected many times
  if ($('.jsContainer').length >= 1) {
    return
  }

  sameRankVariationInfo =
    "<i data-tooltip='When Amazon assigns all variations the same rank, individual sales cannot be calculated.  Total sales for the listing are displayed on the top line' class='none-info'>--v</i>"

  //Templates, Popups and resources
  var mainJsPopupPath = chrome.extension.getURL('jsPopup.html')
  var sharePopupPath = chrome.extension.getURL('share-popup.html')
  var profitCalcPopupPath = chrome.extension.getURL('profit-popup.html')

  //Images resources
  imagesPath = chrome.extension.getURL('images')
  var jsProLogoTopBar = imagesPath + '/js-logo-top-menu.png'
  var closeJsPopupImg = imagesPath + '/icons/white-cross.png'
  var refreshJsPopupImg = imagesPath + '/icons/refresh-active.png'
  var refreshJsPopupDeImg = imagesPath + '/icons/loading-deactive.png'
  var drawerMenuImg = imagesPath + '/icons/menu-active.png'
  var drawerDeactiveMenuImg = imagesPath + '/icons/menu-deactive.png'
  var cloudWordsImg = imagesPath + '/icons/word-cloud-active.png'
  var trendImg = imagesPath + '/icons/trend-button.png'
  var shareImg = imagesPath + '/icons/share-button.png'
  var removeRowImg = imagesPath + '/icons/cross-active.png'
  var noProductsSearchResultsImg = imagesPath + '/amazon-search-result-page.jpg'
  var noProductListingImg = imagesPath + '/amazon-product-listing-page.jpg'
  var noChartImg = imagesPath + '/js-searching.png'
  var completeActive = imagesPath + '/icons/complete-active.png'
  var loadingActive = imagesPath + '/icons/loading-active.png'
  var accusalesLogoImg = imagesPath + '/accusales-logo.png'

  //jQuery objects
  var $contentTable = null
  var $jsContainer = null
  //set jsClassicMode class by default. It will be changed to jsDockMode if previous state is set to DockMode
  var jsContainer = $(
    "<section id='jsContainerId' class='jsContainer jsClassicMode' style='display: none'></section>"
  )
  var jsLoginPopup = $('<div id="jsLoginPopup"></div>')

  //Globals
  tabUrl = window.location.href
  var showProductImageTimeout = null
  var currentScrollPosition = null
  var domObserver = null

  //General ajax setup
  $.ajaxSetup({
    crossDomain: true,
    dataType: 'json'
  })

  // Invoke JS API request in background.
  // The method accepts the same arguments as $.ajax
  function jsApiRequest(options, customActionName, customActionParams) {
    var requestOptions = $.extend(
      {
        headers: $.ajaxSetup().headers // copy authorization headers from the local ajaxSetup()
      },
      options
    )

    // using polyfill for spread(...) to pass any customActionParams in. (defined in common.js)
    const params = Object.assign(
      { action: customActionName || 'jsApiRequest', options: requestOptions },
      customActionParams
    )

    chrome.runtime.sendMessage(params, function(response) {
      if (response.success) {
        if (options.success) {
          // invoke success callback if defined
          options.success(response.data)
        }
      } else {
        if (options.error) {
          // invoke error callback if defined
          options.error(response.data.xhr, response.data.status, response.data.error)
        }
      }
    })
  }

  //Check new authentication tokens
  chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (
      areaName == 'local' &&
      typeof changes.auth != 'undefined' &&
      typeof changes.auth.newValue != 'undefined'
    ) {
      var dailyToken = JSON.parse(changes.auth.newValue).daily_token

      chrome.runtime.sendMessage({
        action: 'setDailyToken',
        payload: dailyToken
      })

      $.ajaxSetup({ headers: { Authorization: `Bearer ${dailyToken}` } })
      console.log('js_info: New token has been used!')
    }
  })

  //Show columns and other options
  showBrandColumn = false
  showPriceColumn = false
  showCategoryColumn = false
  showRankColumn = false
  showEstSalesColumn = false
  showEstSalesDColumn = false
  showEstRevenueColumn = false
  showReviewsColumn = false
  showRatingColumn = false
  showBbSellerColumn = false
  showFbaFeeColumn = false
  showTierColumn = false
  showNewSellerColumn = false
  showDimensionsColumns = false
  showItemWeightColumn = false
  showNetColumn = false
  showLQSColumn = false
  showSponsoredProducts = false
  showSupplierColumn = false

  //Current website details
  currentProtocol = location.protocol
  currentBaseUrl = currentProtocol + '//' + location.hostname
  currentTld = location.hostname.split('.').reverse()[0]
    ? location.hostname.split('.').reverse()[0]
    : 'com'

  bestSellerRankCountry = currentTld
  fullCurrentTld = currentTld == 'uk' ? 'co.uk' : currentTld == 'mx' ? 'com.mx' : currentTld
  currentCurrency = '$'
  currentWeightUnit = 'lbs'
  currentLWHUnit = '"'

  if (currentTld == 'uk') {
    currentCurrency = '£'
    currentWeightUnit = 'kgs'
    currentLWHUnit = 'cm'
  } else if (currentTld == 'de') {
    currentCurrency = '€'
    currentWeightUnit = 'kgs'
    currentLWHUnit = 'cm'
  } else if (currentTld == 'fr') {
    currentCurrency = '€'
    currentWeightUnit = 'kgs'
    currentLWHUnit = 'cm'
  } else if (currentTld == 'es') {
    currentCurrency = '€'
    currentWeightUnit = 'kgs'
    currentLWHUnit = 'cm'
  } else if (currentTld == 'it') {
    currentCurrency = '€'
    currentWeightUnit = 'kgs'
    currentLWHUnit = 'cm'
  } else if (currentTld == 'in') {
    currentCurrency = '₹'
  } else if (currentTld == 'jp') {
    currentCurrency = '¥'
  }

  //Tooltip effect
  var toolTipSelector = '.jsToolTip'
  var toolTipClass = 'jsToolTip'
  var hasToTopToolTip = false
  var hasJsTpMinWidth = false
  var hastoLeftToolTip = false
  var theToolTipHeight = 0
  var theToolTipWidth = 0
  let cssObj = {}
  $('body').on('mouseenter mouseleave mousemove', 'section.jsContainer [data-tooltip]', function(
    e
  ) {
    if (e.type == 'mouseenter') {
      //Change the position of the tooltip to the top
      $(this).hasClass('toTopToolTip')
        ? ((hasToTopToolTip = true),
          (toolTipClass += ' toTopToolTip'),
          (toolTipSelector += '.toTopToolTip'))
        : null
      //Check the min width of the tooltip
      $(this).hasClass('jsTpMinWidth')
        ? ((hasJsTpMinWidth = true), (cssObj['min-width'] = '330px'))
        : null
      //Change the position of the tooltip to the right
      $(this).hasClass('toLeftToolTip')
        ? ((hastoLeftToolTip = true),
          (toolTipClass += ' toLeftToolTip'),
          (toolTipSelector += '.toLeftToolTip'))
        : null
      // Hover over code
      let theToolTipText = $(this).attr('data-tooltip')
      if (theToolTipText.length > 0) {
        let $theToolTipObj = $("<p class='" + toolTipClass + "'></p>")
          .text(theToolTipText)
          .appendTo('body')
          .css(cssObj)
          .fadeIn('slow')
        theToolTipHeight = $theToolTipObj.height()
        theToolTipWidth = $theToolTipObj.width()
      }
    } else if (e.type == 'mousemove') {
      //Default values
      cssObj['top'] = e.pageY + 30
      cssObj['left'] = e.pageX - 10
      //Check the position of the tooltip
      hasToTopToolTip
        ? ((cssObj['top'] = e.pageY - theToolTipHeight - 35), (cssObj['left'] = e.pageX - 10))
        : null
      hastoLeftToolTip
        ? ((cssObj['top'] = e.pageY + 30), (cssObj['left'] = e.pageX - theToolTipWidth))
        : null
      hasToTopToolTip && hastoLeftToolTip
        ? ((cssObj['top'] = e.pageY - theToolTipHeight - 35),
          (cssObj['left'] = e.pageX - theToolTipWidth))
        : null
      $(toolTipSelector).css(cssObj)
    } else if (e.type == 'mouseleave') {
      $(toolTipSelector).remove()
      toolTipSelector = '.jsToolTip'
      toolTipClass = 'jsToolTip'
      hasToTopToolTip = false
      hasJsTpMinWidth = false
      hastoLeftToolTip = false
      theToolTipHeight = 0
      cssObj = {}
    }
  })

  //Inject popup
  $('body').prepend(jsContainer)
  $('body').append(jsLoginPopup)
  jsContainer.load(mainJsPopupPath, function() {
    $('#jsProLogoTopBar').attr('src', jsProLogoTopBar)
    $('#refreshJsPopup').attr('src', refreshJsPopupImg)
    $('#wordsCloudPopup img').attr('src', cloudWordsImg)
    $('#trendPopup img').attr('src', trendImg)
    $('#sharePopup img').attr('src', shareImg)
    $('.accusales-logo').attr('src', accusalesLogoImg)
    $('.main-screen .js-no-products .js-search-results-page-img').attr(
      'src',
      noProductsSearchResultsImg
    )
    $('.main-screen .js-no-products .js-listing-page-img').attr('src', noProductListingImg)
    $(
      '.js-product-history-no-chart img, .js-product-daily-history-no-chart img, .js-no-filter-products .js-no-products-img'
    ).attr('src', noChartImg)

    //Change units on the table
    $('#js-table th.js-item-weight').text(currentWeightUnit)

    //Loading share popup
    $('section.jsContainer .js-share-popup').load(sharePopupPath)

    //Loading profit popup
    $('section.jsContainer .js-profit-calc-popup').load(profitCalcPopupPath)

    chrome.storage.sync.get('dockMode', result => {
      const dockMode = result.dockMode === true
      if (dockMode) {
        $('.jsContainer').addClass('jsDockMode')
        $('.jsContainer').removeClass('jsClassicMode')
      }
    })

    chrome.storage.sync.set({ showSettings: false })

    $jsContainer = $('section.jsContainer')

    //Refresh table headers
    // refreshTableHeaders()
    //--------------------------------------------------------------------------------//
    //when the user change the columns, run JS again.
    chrome.storage.local.get(['auth', 'runJS', 'currentPosition', 'currentDimension'], result => {
      if (typeof result.runJS != 'undefined' && result.runJS == tabUrl) {
        $contentTable = $('section.jsContainer #jsxContentTable')

        //Get the daily token
        var dailyToken = JSON.parse(result.auth).daily_token

        chrome.runtime.sendMessage({
          action: 'setDailyToken',
          payload: dailyToken
        })

        $.ajaxSetup({ headers: { Authorization: `Bearer ${dailyToken}` } })

        //Check current state
        state = new currentState(tabUrl)

        fetchAndScrapeProducts(tabUrl).then(observer => {
          domObserver = observer
        })

        if ($jsContainer) {
          //View container
          $jsContainer.fadeIn('fast')

          //Load JS position
          if (typeof result.currentPosition != 'undefined') {
            $jsContainer.css({
              top: result.currentPosition.top,
              left: result.currentPosition.left
            })
          }

          //Load JS dimensions
          if (typeof result.currentDimension != 'undefined') {
            $jsContainer.css({
              width: result.currentDimension.width,
              height: result.currentDimension.height
            })
          }
        }

        //Send google analytics

        chrome.runtime.sendMessage({
          action: 'googleAnalyticsAction',
          page: 'jsPopup.js'
        })

        chrome.storage.local.remove('runJS')
      }
    })
  }) // All UI elements are loaded

  //----------------------------------------------------//
  //Waiting messages from browser action
  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == 'jsPopupChannel') {
      port.onMessage.addListener(function(response) {
        if (response.url == window.location.href) {
          if (response.action === 'hideJSLoginPopup') {
            return jsLoginPopup.fadeOut()
          }
          //Check auth
          chrome.storage.local.get(['auth', 'currentPosition', 'currentDimension'], result => {
            if (typeof result.auth != 'undefined') {
              if (response.action == 'openCloseJsPopup') {
                if ($jsContainer && $jsContainer.is(':visible')) {
                  //Close the popup
                  chrome.storage.sync.set({ showSettings: false })
                  $('.jsContainer #closeJsPopup')
                    .get(0)
                    .click()
                } else {
                  chrome.runtime.sendMessage({
                    action: 'trackExtensionPopupOpen',
                    payload: { type: 'JSP' }
                  })
                  //Get the daily token
                  var dailyToken = JSON.parse(result.auth).daily_token

                  chrome.runtime.sendMessage({
                    action: 'setDailyToken',
                    payload: dailyToken
                  })

                  $.ajaxSetup({ headers: { Authorization: `Bearer ${dailyToken}` } })

                  //Get the current URL
                  tabUrl = window.location.href

                  //Refresh table headers
                  // refreshTableHeaders()

                  state = new currentState(tabUrl)

                  fetchAndScrapeProducts(tabUrl).then(observer => {
                    domObserver = observer
                  })

                  if ($jsContainer) {
                    $jsContainer
                      .fadeIn('fast')
                      .css('left', $jsContainer[0].getBoundingClientRect().left)

                    //Load JS position
                    if (typeof result.currentPosition != 'undefined') {
                      $jsContainer.css({
                        top: result.currentPosition.top,
                        left: result.currentPosition.left
                      })
                    }

                    //Load JS dimensions
                    if (typeof result.currentDimension != 'undefined') {
                      $jsContainer.css({
                        width: result.currentDimension.width,
                        height: result.currentDimension.height
                      })
                    }

                    // if popup is opened from embed card, show menu drawer
                    chrome.storage.sync.get('showSettings', result => {
                      if (result.showSettings) {
                        const $theDrawerMenu = $("[class^='DrawerWrapper']")
                        $('section.jsContainer').css('overflow', 'hidden')
                        $theDrawerMenu.css('display', 'flex')
                        $theDrawerMenu.height($('section.jsContainer').height())
                        $('section.jsContainer #jsxMainContainer').addClass('invisible-container')
                        $theDrawerMenu.clearQueue().animate({ left: 0 }, 500, function() {
                          $('section.jsContainer').css('overflow', 'visible')
                        })
                      }
                    })
                  }

                  //Send google analytics
                  chrome.runtime.sendMessage({
                    action: 'googleAnalyticsAction',
                    page: 'jsPopup.js'
                  })
                }
              } //End if openCloseJsPopup
            }
          })
        }
      })
    }
  })

  //--------------------------------------------------------------------------------//
  // Close jsPopup button
  // TODO: keep this function for now!
  $('body').on('click', '.jsContainer #closeJsPopup', function(e) {
    e.preventDefault()
    //Save the changes first
    $('body').trigger('saveJSCurrentState')
    //Close other popup
    hidePopups()
    //Close JS popup
    $('.jsContainer').fadeOut('fast')
    //Remove content table to save Amazon pages!
    $('#js-table tbody').html('')
    chrome.runtime.sendMessage({ action: 'stopAllAjaxRequests' })

    if (domObserver) {
      domObserver.disconnect()
    }
  })

  //--------------------------------------------------------------------------------//
  //Refresh jsPopup button
  $('body').on('click', '.jsContainer #refreshJsPopup', function(e) {
    e.preventDefault()
    //Remove the filter mode
    $('section.jsContainer #js-table').attr('js-filter-mode', 'false')
    //Close other popup
    hidePopups()
    //Remove all requests
    chrome.runtime.sendMessage({ action: 'stopAllAjaxRequests' })

    // clear the data for the products rendered in the table from the registry (cache flushing)
    chrome.runtime.sendMessage({ action: 'flushProductsCache', currentTld })

    //Start clear the current state
    chrome.storage.local.remove('current_state')
    tabUrl = window.location.href
    state = new currentState(tabUrl)

    if (domObserver) {
      domObserver.disconnect()
    }

    fetchAndScrapeProducts(tabUrl).then(observer => {
      domObserver = observer
    })
  })

  //--------------------------------------------------------------------------------//
  //Save the current status
  $('body').on('saveJSCurrentState', function(event, data) {
    if (state) {
      state.saveCurrentState()
    }
  })

  //Handle events of zoom/unzoom of plotly
  $('body').on(
    'plotly_relayout',
    'section.jsContainer .js-product-history-chart, section.jsContainer .js-product-daily-history-chart',
    function(event, data) {
      if (Object.keys(data).length == 4) {
        //Zoomed
        $(this)
          .siblings('.js-chart-zoom-message')
          .fadeIn()
      } else if (
        Object.keys(data).length == 2 &&
        typeof data['xaxis.autorange'] != 'undefined' &&
        typeof data['yaxis.autorange']
      ) {
        //Auto resize
        $(this)
          .siblings('.js-chart-zoom-message')
          .css('display', 'none')
      }
    }
  )

  //--------------------------------------------------------------------------------//
  //Hide product history price/rank/sales
  $('body').on('click', 'section.jsContainer #closeProductHistory', function() {
    $(
      'section.jsContainer .js-product-history-popup, section.jsContainer .js-product-daily-history-popup'
    ).fadeOut('fast', function() {
      $('.js-product-history-no-chart, .js-product-daily-history-no-chart').css('display', 'none')
      $('.js-product-history-chart, .js-product-daily-history-chart').css('display', 'block')
      $(
        '.js-product-history-popup .js-product-history-img, .js-product-daily-history-popup .js-product-daily-history-img'
      ).attr('src', '')
      Plotly.purge($('.js-product-history-chart').get(0))
      Plotly.purge($('.js-product-daily-history-chart').get(0))
      $('.js-product-daily-options option')
        .removeAttr('selected')
        .filter(':first')
        .attr('selected', 'selected')
      $theParentSalesDRow = null
      $(
        '.js-product-history-popup .js-chart-zoom-message, .js-product-daily-history-popup .js-chart-zoom-message'
      ).css('display', 'none')
    })
    $('section.jsContainer #jsxMainContainer').removeClass('invisible-container')
  })

  //--------------------------------------------------------------------------------//
  //Add the product to the js web app
  $('body').on('click', '.js-supplier .js-find-supplier', function(e) {
    e.preventDefault()
    //Hide other popups
    hidePopups()
    var $theRow = $(this).parents('tr')
    var theImageSource = $theRow.attr('data-image')
    if (typeof theImageSource != 'undefined' && theImageSource) {
      var theURLObj = new URL(theImageSource)
      var theOrigin = theURLObj.origin
      var thePath = theURLObj.pathname
      window.open(
        `https://www.alibaba.com/picture/search.htm?imageType=${theOrigin}&imageAddress=${thePath}&sourceFrom=JungleScout`,
        '_blank'
      )
    }
  })

  //--------------------------------------------------------------------------------//
  //Showing the default drawer menu
  //TODO: keep this menu drawer opener/closer!
  $('body').on('click', 'section.jsContainer #drawerMenu, #closeMenuDrawer', function(e) {
    let inputHasValue = false
    e.preventDefault()
    hidePopups()
    const $theDrawerMenu = $("[class^='DrawerWrapper']")
    if ($theDrawerMenu.css('left') == '-327px') {
      //Show the drawer
      $('section.jsContainer').css('overflow', 'hidden')
      $theDrawerMenu.css('display', 'flex')
      //Change the height of it
      $theDrawerMenu.height($('section.jsContainer').height())
      //Send google analytics to filter JS as it's the default one

      //Always refresh the drawer
      // refreshDefaultDrawer()
      //Show the drawer
      $('section.jsContainer #jsxMainContainer').addClass('invisible-container')
      $theDrawerMenu.clearQueue().animate({ left: 0 }, 500, function() {
        $('section.jsContainer').css('overflow', 'visible')
      })

      //Activate the filter button again if we've some of values inside the inputs
      $(".filter-inputs-container input[type='text']").val(function(i, val) {
        val = val.trim()
        if (!inputHasValue) {
          val
            ? ($('#jsFilterResultsBtn').removeClass('js-gray-btn'), (inputHasValue = true))
            : $('.filter-inputs-container #jsFilterResultsBtn').addClass('js-gray-btn')
        }
        return val
      })
    } else if ($theDrawerMenu.css('left') == '0px') {
      //Hide the drawer
      $('section.jsContainer').css('overflow', 'hidden')
      $theDrawerMenu.clearQueue().animate({ left: -327 }, 500, function() {
        $theDrawerMenu.css('display', 'none')
        $('section.jsContainer').css('overflow', 'visible')
        $('section.jsContainer #jsxMainContainer').removeClass('invisible-container')
      })
    }
  })

  //--------------------------------------------------------------------------------//
  //Hide the floating message popup
  $('body').on(
    'click',
    'section.jsContainer #closeFloatMessage, section.jsContainer #closeFloatAddingChildrenMessage',
    function(e) {
      $(
        'section.jsContainer .js-floating-message, section.jsContainer .js-add-children-to-webapp-message'
      ).fadeOut('slow')
      // $('section.jsContainer #js-table').css('opacity', '1')
      $('section.jsContainer #jsxMainContainer').removeClass('invisible-container')
      //Clear the previous content
      if ($(this).attr('id') == 'closeFloatMessage') {
        $('.js-floating-message h2').removeClass('js-remove-margin')
        $('.js-floating-message .js-message-content').empty()
      } else if ($(this).attr('id') == 'closeFloatAddingChildrenMessage') {
        $('.js-add-children-to-webapp-message .js-track-children-products-table').empty()
      }
    }
  )

  //--------------------------------------------------------------------------------//
  //Hide all popups and the drawer menu if the user clicked on the invisible container
  $('body').on('click', 'section.jsContainer #jsxMainContainer.invisible-container', function(e) {
    hidePopups()
    chrome.storage.sync.set({ showSettings: false })
    //Hide the drawer menu
    if ($("[class^='DrawerWrapper']").css('left') == '0px') {
      $('section.jsContainer #drawerMenu').click()
    }
  })
})
