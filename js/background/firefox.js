import { setGlobal } from './../jsx/actions/index'
import store from './../jsx/store'

export const initConsentDataCollection = async () => {
  if (navigator.userAgent.indexOf('Firefox') > -1) {
    chrome.storage.sync.get('consentDataCollectionPolicy', result => {
      const consentDataCollection =
        typeof result.consentDataCollectionPolicy !== 'undefined'
          ? result.consentDataCollectionPolicy
          : false
      store.dispatch(setGlobal({ consentDataCollection }))
    })
  } else {
    store.dispatch(setGlobal({ consentDataCollection: true }))
  }
}
