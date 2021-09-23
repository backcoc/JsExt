/**
 * show/save the last screenshot
 */

$(function() {
  //If the file has injected many times
  if ($('.jsContainer').length >= 1) {
    return
  }

  initSentry()

  //----------------------------------------------------------------------------//
  //Get current saved screenshot
  chrome.storage.local.get(['last_screenshot'], function(result) {
    if (typeof result.last_screenshot != 'undefined') {
      var finalCanvasScreen = document.createElement('canvas')
      var finalCanvasScreenContext = finalCanvasScreen.getContext('2d')

      //Draw screenshot
      var finalScreenshot = new Image()
      finalScreenshot.src = result.last_screenshot
      finalScreenshot.onload = function() {
        finalCanvasScreen.width = finalScreenshot.width - 10
        finalCanvasScreen.height = finalScreenshot.height

        finalCanvasScreenContext.drawImage(finalScreenshot, 0, 0)

        //Drow stroke
        finalCanvasScreenContext.strokeStyle = '#CFCFCF'
        finalCanvasScreenContext.lineWidth = 1
        finalCanvasScreenContext.strokeRect(
          0,
          0,
          finalScreenshot.width - 10,
          finalScreenshot.height
        )
        finalCanvasScreenContext.strokeRect(
          0,
          0,
          finalScreenshot.width - 10,
          finalScreenshot.height + 30
        )

        //Set the image
        $('.screenshot-image img').attr('src', finalCanvasScreen.toDataURL())
      } //If image loaded
    } else {
      window.close()
    }
  })
  //----------------------------------------------------------------------------//
  //Download btn event
  $('body').on('click', '#submit', function(e) {
    var downloadedImage = $('.screenshot-image img').attr('src')
    if (downloadedImage) {
      var downloadedImage = downloadedImage.replace('image/png', 'image/octet-stream')
      $(this).attr('download', 'JungleScout-screenshot.png')
      $(this).attr('href', downloadedImage)
    } else {
      window.close()
    }
  })
})
