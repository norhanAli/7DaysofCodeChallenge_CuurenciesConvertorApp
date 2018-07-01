/**
 * Common database helper functions.
 */
class DBHelper {
  static IDB() {
    const dbPromise = idb.open('currency-converter-app', 1, upgradeDb => {
      upgradeDb.createObjectStore('currencies');
      upgradeDb.createObjectStore('conversions');
    });

    return dbPromise;
  }

  /**
   * CurrencyConverterApi base URL.
   */
  static get API_BASE_URL() {
    const version = 'v5';
    return `https://free.currencyconverterapi.com/api/${version}`;
  }

  /**
   * CurrencyConverterApi currencies URL.
   */
  static get CURRENCIES_URL() {
    return `${DBHelper.API_BASE_URL}/currencies`
  }

  /**
   * CurrencyConverterApi convert URL.
   */
  static get CONVERT_URL() {
    return `${DBHelper.API_BASE_URL}/convert`
  }

  /**
   * Fetch and store all currencies.
   */
  static fetchAndStoreCurrencies() {
    return fetch(DBHelper.CURRENCIES_URL)
    .then(resp => resp.json())
    .then(resp => resp.results)
    .then(currenciesObject => Object.values(currenciesObject))
    .then(currenciesList => {
      return DBHelper.IDB().then(db => {
        const tx = db.transaction('currencies', 'readwrite');
        const store = tx.objectStore('currencies');
        store.put(currenciesList, 'list');
        return currenciesList;
      });
    });
  }

  /**
   * Fetch currencies.
   */
  static fetchCurrencies() {
    // return from IndexedDB if values exists.
    return DBHelper.IDB()
    .then(db => {
      const tx = db.transaction('currencies');
      const store = tx.objectStore('currencies');
      return store.get('list');
    })
    .then(currencies => {
      if(!currencies) return this.fetchAndStoreCurrencies();
      return currencies;
    });
  }

  /**
   * Convert from currency to other currency and store.
   */
  static convertAndStore(fromID, toID) {
    const q = `${fromID}_${toID}`;
    const url = `${DBHelper.CONVERT_URL}?q=${q}`;

    return fetch(url)
    .then(resp => resp.json())
    .then(resp => resp.results[q])
    .then(value => {
      // store value.
      return DBHelper.IDB().then(db => {
        const tx = db.transaction('conversions', 'readwrite');
        const store = tx.objectStore('conversions');
        store.put(value, q);
        return value;
      });
    })
  }

  /**
   * Convert from currency to other currency.
   */
  static convert(fromID, toID) {
    const q = `${fromID}_${toID}`;

    // return from IndexedDB if values exists.
    return DBHelper.IDB()
    .then(db => {
      const tx = db.transaction('conversions');
      const store = tx.objectStore('conversions');
      return store.get(q);
    })
    .then(value => {
      if(!value) return this.convertAndStore(fromID, toID);
      return value;
    });
  }
}