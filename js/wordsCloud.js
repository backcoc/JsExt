/**
 * Get and generate the words cloud
 */

$(function() {
  //If the file has injected many times
  if ($('.jsContainer').length >= 1) {
    return
  }

  //Hide Words Cloud
  $('body').on('click', 'section.jsContainer #closeWordsCloud', function() {
    $('.js-words-cloud-popup').fadeOut(function() {
      $(
        '.js-words-cloud-popup .js-words-cloud-content, .js-words-cloud-popup .js-words-cloud-top-keywords'
      ).empty()
    })

    $('section.jsContainer #jsxMainContainer').removeClass('invisible-container')
  })

  // Global variable needed to pass data from React to this page
  // remove once keyword cloud is turned into React component completely
  let productTitles
  let onCsvDownload
  window.sendDataForCSVDownload = function(titles, csvDownloadHandler) {
    productTitles = titles
    onCsvDownload = csvDownloadHandler
  }
  //Download the words cloud as CSV file
  $('body').on('click', 'section.jsContainer #downloadWordsCloud', function() {
    var wordsCloud = new WordsCloud(productTitles)
    wordsCloud.exportCloudToCSV()

    if (onCsvDownload && typeof onCsvDownload === 'function') {
      onCsvDownload()
    }
  })

  //---------------------------------------------------------------//
  //Get and generate the words cloud based on the products name
  function WordsCloud(products) {
    //Global variables
    var cloudWords = []
    var cloudWordsObj = []

    //List the words cloud
    var getWordsCloud = function() {
      let productsTitles = ''
      keywordsCount = 1
      cloudWords = []

      productsTitles = products.join(' ')

      productsTitles = productsTitles.toLowerCase()
      productsTitles = productsTitles.replace(
        /(\binch\b)|(\ball\b)|(\bthe\b)|(\bof\b)|(\band\b)|(\bwill\b)|(\bin\b)|(\bfor\b)|(\bour\b)|(\byour\b)|(\bto\b)|(\byou\b)|(\bwe\b)|(\bat\b)|(\bme\b)|(\bwith\b)|(\bby\b)|(\bmm\b)|(\bme\b)|(\bif\b)|(–)|([“”])|(\d+)|([()])|([{}])|(\[)|(\])|(&)|(\/)|(!)|(:)|(,)|(')|(-)|(")|(_)/g,
        ' '
      )
      let words = productsTitles.split(' ')

      //Loop on all words
      for (let x = 0; x < words.length; x++) {
        if (typeof words[x] === 'undefined' || words[x].length <= 2) {
          continue
        }

        //Check how many duplicated
        let keywordsCount = 1
        if ($.inArray(words[x], cloudWords) == -1) {
          for (let a = 0; a < words.length; a++) {
            if (words[x] == words[a]) {
              keywordsCount++
            }
          }
          cloudWords.push(words[x])
          cloudWordsObj.push({ theWord: words[x], theWordsCount: keywordsCount })
        }
      }

      return cloudWordsObj
    }

    //Get the cloud in html tags
    var getWordsCloudHTML = function() {
      let theKeywordsCloud = ''
      let cloudWordsObj = getWordsCloud()
      let theTopKeywordsObj = null
      let theTopKeywords = ''
      cloudWordsObj.sort(sortKeywordsByLength)
      cloudWordsObj.reverse()
      theTopKeywordsObj = cloudWordsObj.slice(0, 5) //Top five
      cloudWordsObj = cloudWordsObj.slice(0, 50) //Top 50
      cloudWordsObj.sort(sortKeywordsByAlphabet)
      $(cloudWordsObj).each(function(index) {
        let theLevel = this.theWordsCount <= 5 ? 'one' : this.theWordsCount <= 10 ? 'two' : 'three'
        theKeywordsCloud +=
          "<div class='js-cloud-keyword'><span class='js-keyword-level-" +
          theLevel +
          "'>" +
          this.theWord +
          '</span><span> (' +
          this.theWordsCount +
          ') </span></div>'
      })

      $(theTopKeywordsObj).each(function(index) {
        theTopKeywords += '<span>' + this.theWord + '</span>'
      })

      return { theKeywordsCloud: theKeywordsCloud, theTopKeywords: theTopKeywords }
    }

    //Sort the list of keywords by length
    var sortKeywordsByLength = function(keywordA, keywordB) {
      if (keywordA.theWordsCount < keywordB.theWordsCount) return -1
      if (keywordA.theWordsCount > keywordB.theWordsCount) return 1
      return 0
    }

    //Sort the list of keywords by alphabet
    var sortKeywordsByAlphabet = function(keywordA, keywordB) {
      if (keywordA.theWord < keywordB.theWord) return -1
      if (keywordA.theWord > keywordB.theWord) return 1
      return 0
    }

    //Export the words as CSV
    var exportCloudToCSV = function() {
      let cloudWordsObj = getWordsCloud()
      cloudWordsObj.sort(sortKeywordsByLength)
      cloudWordsObj.reverse()
      cloudWordsObj.sort(sortKeywordsByAlphabet)
      var a = document.createElement('a')
      var e = document.createEvent('MouseEvents')
      var rows = 'Words,Count' + '\n'
      $(cloudWordsObj).each(function(index) {
        rows += this.theWord + ',' + this.theWordsCount + '\n'
      })
      a.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(rows)
      a.download = 'JS-WordsCloud.csv'
      e.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      a.dispatchEvent(e)
      return true
    }

    //Return the public functions
    return { getWordsCloudHTML: getWordsCloudHTML, exportCloudToCSV: exportCloudToCSV }
  }
})
