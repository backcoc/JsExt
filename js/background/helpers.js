function isSentryEnabled() {
  // using preprocess https://github.com/jsoverson/preprocess#directive-syntax
  var sentryEnabled = 'true'
  return sentryEnabled === 'true'
}
function initSentry() {
  console.log('SENTRY_ENABLED:' + isSentryEnabled())
  if (
    (typeof process === 'undefined' || process.env.JEST_WORKER_ID == undefined) &&
    isSentryEnabled()
  ) {
    Sentry.init({
      dsn: 'https://51574f2e37c742b3bd057957b21ebd5b@sentry.io/1415589',
      release: chrome.runtime.getManifest().version
    })
    Sentry.configureScope(scope => {
      scope.setTag('ext_name', chrome.runtime.getManifest().name)
    })
  }
}

function captureMessageWithSentry(message) {
  if (
    (typeof process === 'undefined' || process.env.JEST_WORKER_ID == undefined) &&
    isSentryEnabled()
  ) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      let url
      if (tabs.length > 0 && tabs[0].url) {
        url = tabs[0].url
      }

      Sentry.withScope(scope => {
        if (url) {
          scope.setTag('url', url)
        }
        Sentry.captureMessage(message)
      })
    })
  } else {
    // if running on local output error message to console not to sentry
    console.log('Error: ' + message)
  }
}

function getErrorType(message) {
  if (message === 'Duplicate Token') {
    return 1
  } else if (message === 'Expired Token') {
    return 2
  } else {
    return 0
  }
}

const timeout = resolve => setTimeout(() => resolve({ status: false, message: 'timeout' }), 10000)

// for unit testing purpose
if (typeof exports != 'undefined') {
  exports.getErrorType = getErrorType
  exports.initSentry = initSentry
  exports.timeout = timeout
}
