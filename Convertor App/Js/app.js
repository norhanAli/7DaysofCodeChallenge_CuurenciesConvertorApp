/// <reference path="service-worker.js" />

debugger
document.addEventListener('DOMContentLoaded', (event) => {
    var Cached_data = [];
    if ('serviceWorker' in navigator) {

        navigator.serviceWorker
          .register('service-worker.js', { scope: './' })
          .then(function (registration) {
              console.log("Service Worker Registered");
          })
          .catch(function (err) {
              console.log("Service Worker Failed to Register", err);
          })

    }
    fillCurrencies('fromCurrency_dropdown');
    fillCurrencies('toCurrency_dropdown');
    
});


/**
 * Fetch currencies and fill currencyFrom and currencyTo.
 */
fillCurrencies = (currencyInputID) => {
    const currencyInput = document.getElementById(currencyInputID);

    DBHelper.fetchCurrencies()
    .then(currencies => {
        currencies.forEach(currency => {
            debugger
            // extract data.
            //{ currencyName, id } currency;

            // create option dynamically.
            const option = document.createElement('option');
            option.innerHTML = currency.currencyName;
            option.value =currency.id;

            // append new option.
            currencyInput.appendChild(option);
        });
    });
}

/**
 * Convert source value to target value.
 */
ConvertCurrency = () => {
    // references to input.
    const currencyFrom = document.getElementById('fromCurrency_dropdown').value;
    const currencyTo = document.getElementById('toCurrency_dropdown').value;

    const currencySource = document.getElementById('amoutValue').value;
    const currencyTarget = document.getElementById('resultValue');

    // empty currency source
    if (!currencySource) {
        return;
    }

    // fetch currency difference.
    DBHelper.convert(currencyFrom, currencyTo)
    .then(resp => resp.val)
    .then(value => {
        const targetValue = value * currencySource;
        currencyTarget.value ='= '+ targetValue;
    });
}



//GetCurrencydropdown();


