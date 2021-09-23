export const getColumnsFromStorage = (columns, defaultColumns) => {
  // mapping of storage keys into column names, e.g. { columnBrand: 'brand', ... }
  const storageKeyToColumnName = columns.reduce((object, column) => {
    object[column.storageKey] = column.name
    return object
  }, {})
  const storageKeys = columns.map(column => column.storageKey)

  return new Promise(resolve => {
    chrome.storage.sync.get(storageKeys, result => {
      const selectedColumns = []
      storageKeys.forEach(storageKey => {
        const storageValue = result[storageKey]
        const columnName = storageKeyToColumnName[storageKey]

        // Column is selected if storageValue is 'Y'.
        // If value is 'N' then column is unselected.
        // If there's no column data in storage then check if column is default.
        if (
          storageValue === 'Y' ||
          (storageValue === undefined && defaultColumns.includes(columnName))
        ) {
          selectedColumns.push(columnName)
        }
      })

      resolve(selectedColumns)
    })
  })
}

export const setColumnsInStorage = (columns, selectedColumns) => {
  const storageData = columns.reduce((object, column) => {
    object[column.storageKey] = selectedColumns.includes(column.name) ? 'Y' : 'N'
    return object
  }, {})
  chrome.storage.sync.set(storageData)
}

export const setEmbedDataPointsInStorage = selectedColumns => {
  chrome.storage.sync.set({ selectedEmbedDataPoints: selectedColumns })
}

export const setShowSponsoredInStorage = showSponsoredProducts => {
  chrome.storage.sync.set({
    showSponsoredProducts
  })
}

export const setProductPageEmbedExpandedInStorage = productPageEmbedExpanded => {
  chrome.storage.sync.set({
    productPageEmbedExpanded
  })
}

export const setShowEmbedInStorage = showEmbed => {
  chrome.storage.sync.set({
    showEmbed
  })
}

export const setShowProductPageEmbedInStorage = showProductPageEmbed => {
  chrome.storage.sync.set({
    showProductPageEmbed
  })
}

export const setConsentDataCollectionPolicyInStorage = () => {
  chrome.storage.sync.set({ consentDataCollectionPolicy: true })
}

export const setExpressModeInStorage = expressMode => {
  chrome.storage.sync.set({
    expressMode
  })
}

export const setBuyboxReportInStorage = buyboxReport => {
  chrome.storage.sync.set({
    buyboxReport
  })
}

export const setDockModeInStorage = dockMode => {
  chrome.storage.sync.set({ dockMode })
}

export const setDockModeNotificationInStorage = showDockModeNotification => {
  chrome.storage.sync.set({ showDockModeNotification })
}

export const setShowEmbedSettingsInStorage = showSettings => {
  chrome.storage.sync.set({ showSettings })
}

export const setBlueDotNotificationInStorage = showActionsBlueDotNotification => {
  chrome.storage.sync.set({ showActionsBlueDotNotification })
}

export const setUseBackendScrapingInStorage = (useBackendScraping, timestamp) => {
  chrome.storage.sync.set({ useBackendScraping, useBackendScrapingSetTime: timestamp })
}

export const getUseBackendScrapingFromStorage = async () => {
  return new Promise(resolve => {
    chrome.storage.sync.get('useBackendScraping', ({ useBackendScraping }) => {
      resolve(useBackendScraping)
    })
  })
}

export const getLastUseBackendScrapingSetTimeFromStorage = async () => {
  return new Promise(resolve => {
    chrome.storage.sync.get('useBackendScrapingSetTime', ({ useBackendScrapingSetTime }) => {
      resolve(useBackendScrapingSetTime)
    })
  })
}
