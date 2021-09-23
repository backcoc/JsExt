/**
 * Contains Jungle Scout Settings
 */

$(function() {
  initSentry()

  //---------------------------------------------------------------------------------//
  //Google Analytics
  /* removeIf(firefox) */
  var _gaq = _gaq || []
  _gaq.push(['_setAccount', 'UA-52913301-9'])
  _gaq.push(['_trackPageview', 'settings.js'])
  ;(function() {
    var ga = document.createElement('script')
    ga.type = 'text/javascript'
    ga.async = true
    ga.src = 'https://ssl.google-analytics.com/ga.js'
    var s = document.getElementsByTagName('script')[0]
    s.parentNode.insertBefore(ga, s)
  })()
  /* endRemoveIf(firefox) */
  
  //---------------------------------------------------------------------------------//
  $('body').on('change', "input[type='checkbox']", function(e) {
    $('#submit').removeClass('gray-btn')
  })

  $('body').on('change', "input[type='checkbox']:not('.dont-touch')", function(e) {
    $("input[type='checkbox']:enabled.dont-touch").prop('checked', false)
  })

  //---------------------------------------------------------------------------------//
  $('body').on('click', '#submit', function(e) {
    //Check the selected settings
    btnInProcess()

    if ($("input[name='clearCache']").is(':checked')) {
      chrome.storage.local.remove(['current_state'])
    }

    if ($("input[name='resetPopupDimensions']").is(':checked')) {
      chrome.storage.local.remove('currentDimension')
    }

    if ($("input[name='resetPopupPosition']").is(':checked')) {
      chrome.storage.local.remove('currentPosition')
    }

    // jsp
    if ($("input[name='resetActiveColumns']").is(':checked')) {
      resetColumnsSettings()
    }
    // --

    if ($("input[name='clearLastScreenshot']").is(':checked')) {
      chrome.storage.local.remove('last_screenshot')
    }

    if ($("input[name='clearLoginCredential']").is(':checked')) {
      chrome.storage.local.remove(['auth', 'last_screenshot', 'current_state'])
    }

    $("input[type='checkbox']").prop('checked', false)
    //Send message to refresh Amazon pages
    chrome.runtime.sendMessage({
      action: 'refreshAmazonPages'
    })
    //Button status
    successState()
  })

  //----------------------------------------------------------------------------------//
  function resetColumnsSettings() {
    chrome.storage.sync.set({ columnBrand: 'Y' })
    chrome.storage.sync.set({ columnPrice: 'Y' })
    chrome.storage.sync.set({ columnCategory: 'Y' })
    chrome.storage.sync.set({ columnRank: 'Y' })
    chrome.storage.sync.set({ columnEstSales: 'Y' })
    chrome.storage.sync.set({ columnEstSalesD: 'Y' })
    chrome.storage.sync.set({ columnEstRevenue: 'Y' })
    chrome.storage.sync.set({ columnDateFirstAvailable: 'Y' })
    chrome.storage.sync.set({ columnNumReviews: 'Y' })
    chrome.storage.sync.set({ columnRating: 'Y' })
    chrome.storage.sync.set({ columnBbSeller: 'Y' })
    chrome.storage.sync.set({ columnFbaFee: 'N' })
    chrome.storage.sync.set({ columnTier: 'N' })
    chrome.storage.sync.set({ columnsDimensions: 'N' })
    chrome.storage.sync.set({ columnItemWeight: 'N' })
    chrome.storage.sync.set({ columnNet: 'N' })
    chrome.storage.sync.set({ columnLQS: 'Y' })
    chrome.storage.sync.set({ showSponsoredProducts: 'Y' })
  }
  //---------------------------------------------------------------------------------//
  function successState() {
    var $theBtn = $('#submit span')
    $theBtn.fadeOut(500, function() {
      $(this)
        .html("<img src='../images/icons/complete-active.png' />")
        .fadeIn(500, function() {
          $('#submit').fadeOut(500, function() {
            $('#submit')
              .html($('#submit').attr('data-content'))
              .addClass('gray-btn')
              .fadeIn(500)
          })
        })
    })
  }
  //---------------------------------------------------------------------------------//
  function btnInProcess() {
    $('#submit').attr('data-content', $('#submit').html())
    $('#submit span').html(
      "<img src='../images/icons/loading-active.png' width='15px' height='15px' class='js-processing-btn'/>"
    )
  }
})
