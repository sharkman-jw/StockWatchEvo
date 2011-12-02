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
};

Quoter.processResultStockDataCallBack = null;

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
 * Request a group of quotes.
 * @param {array} symbols
 */
Quoter.prototype.requestGroupQuotes = function(symbols) {
  var xhr = new XMLHttpRequest();
  var url = this.composeGroupQuoteUrl(symbols);
  xhr.open("GET", url, true);
  xhr.onreadystatechange = this._processXMLHttpRequestReadyStateChange;
  xhr.send(null);
};

/**
 * Compose the url for group quote.
 * @param {array} symbols
 */
Quoter.prototype.composeGroupQuoteUrl = function(symbols) {
  return this.quoteUrl + symbols.join(',');
};

Quoter.prototype._processXMLHttpRequestReadyStateChange = function() {
  // override this
};

Quoter.prototype.requestSingleQuote = function(symbol) {
  // TODO
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
 */
GoogleQuoter.processResultData = function(data) {
  // create stock data from result data
  var sd = new StockData(true);
  sd.symbol = data.t;
  sd.exchange = data.e;
  sd.name = data.name;
  sd.last = numberUtils.parseNumberWithComma(data.l); // number
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
      sd.exchange == 'AMEX') {
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
  
  if (Quoter.processResultStockDataCallBack)
    Quoter.processResultStockDataCallBack(sd);
};

/**
 * The onreadystatechange() method to be assigned to a XMLHttpRequest obj.
 * @note "this" in this function is meant for the XMLHttpRequest obj
 */
GoogleQuoter.prototype._processXMLHttpRequestReadyStateChange = function() {
  if (this.readyState == 4) {
    var resultDataList = [];
    var good = false;
    
    var text = this.responseText;
    if (text) {
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
    if (good && n > 0) {
      for (var i = 0; i < n; ++ i)
        GoogleQuoter.processResultData(resultDataList[i]);
    } else {
      // TODO
    }
  }
};






