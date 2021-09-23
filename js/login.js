/**
 * @Author: Greg Mercer
 * Copyright © 2020 Jungle Scout
 *
 * check username and password
 */

$(function() {
  // Set extension title
  $(document).ready(function() {
    document.title = getConstant('APP_LOGIN_TITLE')
  })

  initSentry()

  //---------------------------------------------------------------------------------//
  //Google Analytics
  // Ignore if running Jest tests.
  if (typeof process === 'undefined' || process.env.JEST_WORKER_ID == undefined) {
    /* removeIf(firefox) */
    var _gaq = _gaq || []
    _gaq.push(['_setAccount', 'UA-52913301-9'])
    _gaq.push(['_trackPageview', 'login.js'])
    ;(function() {
      var ga = document.createElement('script')
      ga.type = 'text/javascript'
      ga.async = true
      ga.src = 'https://ssl.google-analytics.com/ga.js'
      var s = document.getElementsByTagName('script')[0]
      s.parentNode.insertBefore(ga, s)
    })()
    /* endRemoveIf(firefox) */
  }
  //---------------------------------------------------------------------------------//

  var searchParams = new URLSearchParams(window.location.search)
  if (searchParams.has('errorcode')) {
    $('#error_' + searchParams.get('errorcode')).show()
  }

  $('body').on('click', '#submit', function(e) {
    e.preventDefault()
    clearState()
    btnInProcess()
    $('.message').text('Checking...')
    $('.message').css('visibility', 'visible')

    var username = $('#email').val()
    var password = $('#password').val()
    username = username ? username.trim() : null
    password = password ? password.trim() : null

    if (!username || !password) {
      errorState()
      $('.message').text('*Please check your username and password!')
      return false
    }

    //Contact to API
    $.ajax({
      url: getConstant('API_HOST') + '/api/v1/users/initial_authentication',
      type: 'POST',
      crossDomain: true,
      dataType: 'json',
      data: { username: username, password: password, app: getAppCode() },
      success: function(result) {
        if (result && result.status) {
          $('.message').text(result.message)
          var dailyToken =
            typeof result.daily_token == 'undefined' ? '' : $.trim(result.daily_token)

          chrome.runtime.sendMessage({
            action: 'setDailyToken',
            payload: dailyToken
          })

          var authJsonObj = JSON.stringify({
            username: result.username,
            created_at: result.created_at,
            email: result.email,
            nickname: result.nickname,
            daily_token: dailyToken,
            language: result.language,
            last_checked: Date.now(),
            extension_info: result.extension_info,
            feature_access: result.feature_access,
            flag_data: result.flag_data
          })
          chrome.storage.local.set({ auth: authJsonObj })
          successState()
          //Send message to refresh Amazon pages
          chrome.runtime.sendMessage({
            action: 'refreshAmazonPages'
          })
          //Send message to inform that the global data needs to be updated
          chrome.runtime.sendMessage({
            action: 'setGlobalData'
          })
          //Redirect the user to Amazon page
          setTimeout(function() {
            window.location.href = 'https://www.amazon.com'
          }, 1500)
        } else if (result && !result.status) {
          errorState()
          chrome.runtime.sendMessage({
            action: 'trackError',
            pageType: 'Login',
            errorType: 'Login error',
            tab: 'Login',
            message: result.message
          })
          $('.message').text(result.message)
        }
      },
      error: function(xhr, status, error) {
        errorState()
        $('.message').text('Something went wrong, please try again later!')
        chrome.runtime.sendMessage({
          action: 'trackError',
          pageType: 'Login',
          errorType: 'Login error',
          tab: 'Login',
          message: 'Something went wrong, please try again later!'
        })
      }
    })
  })
  //---------------------------------------------------------------------------------//
  $('body').on('click', '#closeBtn', function(e) {
    e.preventDefault()
    window.close()
  })
  //---------------------------------------------------------------------------------//
  $('body').on('click', '#refreshBtn', function(e) {
    e.preventDefault()
    window.reload()
  })

  //---------------------------------------------------------------------------------//
  $('body').on('keypress', "input[name='username'], input[name='password']", function(e) {
    var key = e.which
    if (key == 13) {
      $('#submit').click()
      return false
    }
    $('.sign-btn').removeClass('js-gray-btn')
  })
  //---------------------------------------------------------------------------------//
  function clearState() {
    $('.form-element, .form-input-element, .sign-btn').removeClass('error js-gray-btn')
    $('.message').removeClass('error-message')
  }
  //---------------------------------------------------------------------------------//
  function errorState() {
    $('.form-element, .form-input-element').addClass('error-element')
    $('.sign-btn span').html($('.sign-btn').attr('data-content'))
    $('.sign-btn').addClass('js-gray-btn')
    $('.message').addClass('error-message')
  }
  //---------------------------------------------------------------------------------//
  function successState() {
    var $theBtn = $('.sign-btn span')
    $theBtn.fadeOut(500, function() {
      $(this)
        .html("<img src='../images/icons/complete-active.png' />")
        .fadeIn(500, function() {
          $('.sign-btn').fadeOut(500, function() {
            $('.sign-btn')
              .html($('.sign-btn').attr('data-content'))
              .fadeIn(500)
          })
        })
    })
  }
  //---------------------------------------------------------------------------------//
  function btnInProcess() {
    $('.sign-btn').attr('data-content', $('.sign-btn').html())
    $('.sign-btn span').html(
      "<img src='../images/icons/loading-active.png' width='15px' height='15px' class='js-processing-btn'/>"
    )
    $('#error_0').hide()
    $('#error_1').hide()
    $('#error_2').hide()
  }
})
