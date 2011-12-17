// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview 
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

/**
 * @class Quoter base class
 */
function Quoter() {
  this.source = '';
  this.quoteUrl = '';
  this.enable = true;
  this.resultStockDataHandler = null;
};

/**
 * Decode hexadecimal.
 * @param {string} text
 * @return {string} ascii text
 */
Quoter.decodeHexadecimal = function(text) {
  var matchedResults = null;
  var n = 0; // char numeric value
  var n1 = 0;
  var n2 = 0;
  do {
    matchedResults = text.match(_hexadecimalPattern);
    if (matchedResults) {
      n1 = matchedResults[1].toLowerCase().charCodeAt(0);
      n2 = matchedResults[2].toLowerCase().charCodeAt(0);
      n1 = n1 < 58 ? n1 - 48 : n1 - 97 + 10;
      n2 = n2 < 58 ? n2 - 48 : n2 - 97 + 10;
      n = n1 * 16 + n2;
      text = text.replace(matchedResults[0], String.fromCharCode(n));
    } else
      break;
  } while (matchedResults);
  return text;
};

/**
 * Request a quote.
 * @param {string} symbol
 */
Quoter.prototype.requestQuote = function(symbol) {
  var url = this.composeQuoteUrl(symbol);
  debugUtils.log(url);
  if (url) {
    var xhr = new XMLHttpRequest();
    xhr.resultStockDataHandler = this.resultStockDataHandler;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = this._processSingleRequestReadyStateChange;
    xhr.send(null);
  }
};

/**
 * Request a group of quotes.
 * @param {array} symbols
 */
Quoter.prototype.requestGroupQuotes = function(symbols) {
  var url = this.composeGroupQuoteUrl(symbols);
  debugUtils.log(url);
  if (url) {
    var xhr = new XMLHttpRequest();
    xhr.resultStockDataHandler = this.resultStockDataHandler;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = this._processGroupRequestReadyStateChange;
    xhr.send(null);
  }
};

/**
 * Compose the url for single quote.
 * @param {string} symbol
 */
Quoter.prototype.composeQuoteUrl = function(symbol) {
  return this.quoteUrl + symbol;
};

/**
 * Compose the url for group quote.
 * @param {array} symbols
 */
Quoter.prototype.composeGroupQuoteUrl = function(symbols) {
  return this.quoteUrl + symbols.join(',');
};

Quoter.prototype._processSingleRequestReadyStateChange = function() {
  // override this
};

Quoter.prototype._processGroupRequestReadyStateChange = function() {
  // override this
};



/**
 * @class GoogleQuoter, derived from Quoter
 */
function GoogleQuoter() {
  Quoter.call(this);
  
  this.source = 'Google';
  this.quoteUrl = 'http://www.google.com/finance/info?infotype=infoquoteall&q=';
};

/**
 * Inheritance
 */
GoogleQuoter.prototype = new Quoter();
GoogleQuoter.prototype.constructor = GoogleQuoter;

/**
 * Process result data from google.
 * @param {obj} data
 * @note static method
 */
GoogleQuoter.processResultData = function(data) {
  // create stock data from result data
  var sd = new StockData(true);
  sd.symbol = data.t;
  sd.exchange = data.e;
  sd.name = data.name;
  sd.last = numberUtils.parseNumberWithComma(data.l); // number
  sd.bids = [];
  sd.asks = [];
  sd.change = numberUtils.parseNumberWithComma(data.c); // number
  sd.percentChange = numberUtils.parseNumberWithComma(data.cp); // number
  sd.open = data.op;
  sd.high = data.hi;
  sd.low = data.lo;
  sd.vol = data.vo;
  sd.avgVol = data.avvo;
  sd.high52w = data.hi52;
  sd.low52w = data.lo52;
  sd.marketCap = data.mc;
  sd.pe = data.pe;
  sd.beta = data.beta;
  sd.eps = data.eps;
  sd.type = data.type;
  if (data.hasOwnProperty('el')) {
    sd.extHours = true;
    sd.extLast = numberUtils.parseNumberWithComma(data.el); // number
    sd.extChange = numberUtils.parseNumberWithComma(data.ec); // number
    sd.extPercentChange = numberUtils.parseNumberWithComma(data.ecp); // number
    if (sd.exchange == 'NASDAQ' || sd.exchange == 'NYSE' ||
      sd.exchange == 'NYSEAMEX') {
      if (data.elt.indexOf('PM') != -1)
        sd.tradingStatus = 'aft-hrs';
      else if (data.elt.indexOf('AM') != -1)
        sd.tradingStatus = 'pre-mkt';
    }
    sd.lastTradeTime = data.elt;
  } else {
    sd.extHours = false;
    sd.extLast = null; // number
    sd.extChange = null; // number
    sd.extPercentChange = null; // number
    sd.tradingStatus = '';
    sd.lastTradeTime = data.ltt;
  }
  sd.delay = data.delay;
  sd.lastTick = 'e'; // string - 'e', 'u', 'd'
  sd.generateKeyTicker(); // string - exchange:symbol
  
  return sd;
};

/**
 * Request a group of quotes.
 * @param {array} symbols
 */
GoogleQuoter.prototype.requestGroupQuotes = function(symbols) {
  var total = symbols.length;
  var remaining = total; 
  var i = 0;
  var limit = 15; // one time request limit
  var batch = [];
  while (remaining > limit ) {
    batch = [];
    for (var j = 0; j < limit; ++ j, ++ i)
      batch.push(symbols[i]);
    Quoter.prototype.requestGroupQuotes.apply(this, [batch]);
    remaining -= limit;
  }
  batch = [];
  for (; i < total; ++ i)
    batch.push(symbols[i])
  Quoter.prototype.requestGroupQuotes.apply(this, [batch]);
};

/**
 * The onreadystatechange() method to be assigned to a XMLHttpRequest obj.
 * @note "this" in this function is meant for the XMLHttpRequest obj
 */
GoogleQuoter.prototype._processGroupRequestReadyStateChange = function() {
  if (this.readyState == 4) {
    var resultDataList = [];
    var good = false;
    
    if (this.status == 200 && this.responseText) {
      var text = this.responseText;
      // try decode hex if found the sign
      if (text.indexOf('\\x') != -1)
        text = Quoter.decodeHexadecimal(text);
      // try parse JSON data
      try {
        resultDataList = JSON.parse(text.substr(3));
        good = true;
      } catch (e) {
      }
    }
    
    var n = resultDataList.length;
    if (good && n) {
      var sd = null;
      for (var i = 0; i < n; ++ i) {
        sd = GoogleQuoter.processResultData(resultDataList[i]);
        if (sd && this.resultStockDataHandler)
          this.resultStockDataHandler(sd);
      }
    } else {
      debugUtils.log('GoogleQuoter failed.')
      // TODO: handle request fail
    }
  }
};



/**
 * @class BatsQuoter, derived from Quoter
 */
function BatsQuoter() {
  Quoter.call(this);
  
  this.source = 'BATX';
  this.quoteUrl = 'http://batstrading.com/book/';
};

/**
 * Inheritance
 */
BatsQuoter.prototype = new Quoter();
BatsQuoter.prototype.constructor = BatsQuoter;

/**
 * Process result data from BATS.
 * @param {obj} data
 * @param {string} market: exchange code
 */
BatsQuoter.processResultData = function(data, market) {
  var sd = new StockData();
  sd.assign({'symbol': data.symbol, 'exchange': market, 'bids': data.bids,
    'asks': data.asks}, false);
  return sd;
};

/**
 * Compose quote url using symbol and market.
 */
BatsQuoter.prototype.composeQuoteUrl = function(symbol, market) {
  if (market)
    return this.quoteUrl + symbol + '/data/?mkt=' + market;
  else
    return this.quoteUrl + symbol + '/data/';
};

/**
 * Avoid group quotes for BATS Quoter
 */
BatsQuoter.prototype.composeGroupQuoteUrl = function(symbols) {
  return null;
};

/**
 * Request a quote.
 * @param {string} symbol: plain symbol, e.g.: AAPL, GOOG
 * @param {string} market: optional, e.g.: NYSE, NASDAQ, NYSEAMEX
 */
BatsQuoter.prototype.requestQuote = function(symbol, market) {
  if (!this.enable)
    return;
  // only supports US markets
  if (market == "NYSE" || market == "NASDAQ" || market == "NYSEAMEX") {
    var url = this.composeQuoteUrl(symbol, market);
    debugUtils.log(url);
    if (url) {
      var xhr = new XMLHttpRequest();
      xhr.resultStockDataHandler = this.resultStockDataHandler;
      xhr.quoteTarget = {'symbol': symbol, 'market': market};
      xhr.open("GET", url, true);
      xhr.onreadystatechange = this._processSingleRequestReadyStateChange;
      xhr.send(null);
    }
  }
};

/**
 * The onreadystatechange() method to be assigned to a XMLHttpRequest obj.
 * @note "this" in this function is meant for the XMLHttpRequest obj
 */
BatsQuoter.prototype._processSingleRequestReadyStateChange = function() { 
  if (this.readyState == 4) {
    var resultData = null;
    var good = false;
    
    if (this.status == 200 && this.responseText) {
      var text = this.responseText;
      // try decode hex if found the sign
      if (text.indexOf('\\x') != -1)
        text = Quoter.decodeHexadecimal(text);
      // try parse JSON data
      try {
        resultData = JSON.parse(text).data;
        good = true;
      } catch (e) {
      }
    }
    
    if (good && resultData) {
      var sd = BatsQuoter.processResultData(resultData, this.quoteTarget.market);
      if (sd && this.resultStockDataHandler)
        this.resultStockDataHandler(sd);
    } else {
      debugUtils.log('BatsQuoter failed.')
      // TODO: handle fail
    }
  }
};


