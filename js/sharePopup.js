/**
 * @Author: Greg Mercer
 * Copyright © 2020 Jungle Scout
 *
 * show/hide/actions of the share popup
 */

$(function() {
  //If the file has injected many times
  if ($('.jsContainer').length >= 1) {
    return
  }

  //Show share popup and its buttons
  $('body').on('click', 'section.jsContainer #sharePopup', function(e) {
    e.preventDefault()
    if ($(this).hasClass('js-inactive-btn-footer')) {
      return
    }
    //Hide other popups
    hidePopups()

    //Send google analytics
    chrome.runtime.sendMessage({
      action: 'googleAnalyticsAction',
      page: 'share-popup.html'
    })
      
    //Position the popup to center
    let $jsSharePopup = $('.js-share-popup')
    $jsSharePopup.css({
      left: ($('section.container').width() - $jsSharePopup.width()) / 2,
      top: ($('section.container').height() - $jsSharePopup.height()) / 2
    })

    //Invisible other stuff
    $('section.jsContainer .container').addClass('invisible-container')

    //View the popup
    $('section.jsContainer .js-share-popup').fadeIn()
  })

  //--------------------------------------------------------------------------------//
  //Hide share popup
  $('body').on('click', 'section.jsContainer #closeSharePopup', function(e) {
    e.stopPropagation()
    $('section.jsContainer .container').removeClass('invisible-container')
    $('.js-share-popup').fadeOut()
  })
})
