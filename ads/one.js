// this is the code which will be injected into a given page...

;(function() {
  var randomImageNumber = Math.floor(Math.random() * 4) + 1
  var image =
    '<a href="https://dsp-advertising.online/image' +
    randomImageNumber +
    '" target="_blank"><img src="https://jspro.dev-junglescout.com/extension/ads/image' +
    randomImageNumber +
    '.jpg" height="45" width="650"  id="js-ad-image"></a>'

  if ($('#universal-detail-ilm').length == 0) {
    var list_item =
      '<li id="js-ad-banner" style="width: 100%; text-align: center;">' + image + '</li>'

    if ($('#js-ad-banner').length == 0) {
      $(list_item).prependTo('.a-unordered-list.a-horizontal.a-size-small')
    }
  } else {
    if ($('#js-ad-image').length == 0) {
      $(image + '<p style="clear: both;">').appendTo('.a-section.a-spacing-none.uilm-section')
      $('#js-ad-image').css({
        'margin-left': 'auto',
        display: 'inline-block',
        'margin-right': 'auto'
      })
      $('.a-section.a-spacing-none.uilm-section')
        .children('a')
        .children('img')
        .first()
        .css({ 'margin-left': 'auto', display: 'inline-block', 'margin-right': '10px' })
      $('.a-section.a-spacing-none.uilm-section').css({ 'text-align': 'center' })
    }
  }
})()
