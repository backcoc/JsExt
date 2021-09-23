/**
 * @Author: Greg Mercer
 * Copyright © 2020 Jungle Scout
 *
 * JS popup icon besides address bar
 */

$(function() {
  var port = null
  var supportedStores = getCommonConstant('SUPPORTED_STORES')
  var supportedStoresWalmart = getCommonConstant('SUPPORTED_STORES_WALMART')
  chrome.storage.local.get('auth', function(result) {
    if (Object.keys(result).length === 0) {
      chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        const { id, url } = tabs[0]
        port = chrome.tabs.connect(id, { name: 'jsPopupChannel' })
        port.postMessage({ url, action: 'hideJSLoginPopup' })
      })
      return $('.popup').addClass('popup-login')
    }
    $('.popup').addClass('popup-default')
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      // TODO: Remove after release if sellerCentral graph
      var parshedAuthData = (result.auth && JSON.parse(result.auth)) || {}
      var walmartEnabled =
        parshedAuthData.flag_data && parshedAuthData.flag_data['fflag.extension.wfs']

      var url = tabs[0].url
      var domainURL = getDomain(url)
      if (
        (supportedStores.test(domainURL) ||
          (walmartEnabled && supportedStoresWalmart.test(domainURL))) &&
        !getCommonConstant('SELLERCENTRAL').test(url) &&
        !getCommonConstant('ADVERTISING_URL_REGEX').test(url)
      ) {
        port = chrome.tabs.connect(tabs[0].id, { name: 'jsPopupChannel' })
        port.postMessage({ url: url, action: 'openCloseJsPopup' })
        window.close()
        return false
      } else if (getCommonConstant('SELLERCENTRAL').test(url)) {
        window.close()
      }
    })
  })

  //----------------------------------------------------------------//
  function getDomain(url) {
    url = url.replace(/https?:\/\/(www.)?/i, '')
    if (url.indexOf('/') === -1) {
      return url
    }
    return url.split('/')[0]
  }

  $('body').on('click', '#closeBtn', function(e) {
    e.preventDefault()
    window.close()
  })
})
