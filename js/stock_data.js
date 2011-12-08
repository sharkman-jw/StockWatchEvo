// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview 
 *   - class StockData
 *   - class RecentQuotes
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

/**
 * Constructor
 * @param {bool} skipInit: this is for static creator methods
 */
function StockData(skipInit) {
  LSModel.call(this);
  
  if (skipInit) {
  } else {
    this.symbol = null; // string
    this.exchange = null; // string
    this.name = null; // string
    
    this.last = null; // number
    this.bids = []; // array: e.g.:[[100,"390.04"],[100,"390.01"]]
    this.asks = []; // array
    this.change = null; // number
    this.percentChange = null; // number
    this.open = null; // string
    this.high = null; // string
    this.low = null; // string
    this.vol = null; // string
    this.avgVol = null; // string
    this.high52w = null; // string
    this.high52w = null; // string
    this.marketCap = null; // string
    this.pe = null; // string
    this.beta = null; // string
    this.eps = null; // string
    this.type = null; // string
    
    this.extHours = false; // bool
    this.extLast = null; // number
    this.extChange = null; // number
    this.extPercentChange = null; // number
    this.tradingStatus = ''; // string - 'aft-hrs', 'pre-mkt', 'close' ...
    this.lastTradeTime = null; // string
    
    this.delay = 0; // number - in minutes
    
    this.lastTick = 'e'; // string - 'e', 'u', 'd'
    this.keyTicker = null; // string - exchange:symbol
  }
};

// inherit from LSModel
StockData.prototype = new LSModel();
StockData.prototype.constructor = StockData;

/**
 * Compose the local storage key.
 * @param {string} keyTicker
 * @return {string} local storage key
 * @note static method
 */
StockData._composeLSKey = function(keyTicker) {
  return keyTicker? ('d_' + keyTicker) : null;
};

/**
 * Retrieve a StockData object from local storage.
 * @param {string} keyTicker
 * @return {obj} StockData object
 * @note static method
 */
StockData.retrieve = function(keyTicker) {
  return localStorageUtils.getObj(StockData._composeLSKey(keyTicker),
    null, StockData.prototype);
};

/**
 * Create a StockData object from given data.
 * @param {obj} data
 * @return {obj} StockData object
 * @note static method
 */
StockData.createFromData = function(data) {
  var sd = new StockData();
  sd.assign(data, false);
  return sd;
};

StockData.prototype._generateLSKey = function(keyTicker) {
  this.lsKey = StockData._composeLSKey(keyTicker ? keyTicker : this.keyTicker);
};

/**
 * Assign properties' values to this instance.
 * @param {obj} data
 * @param {bool} validate: if true, only override properties that are currently
 *                         in this instance; otherwise, assign any properties
 *                         from input data.
 */
StockData.prototype.assign = function(data, validate) {
  if (validate) {
    for (each in data) {
      if (this.hasOwnProperty(each))
        this[each] = data[each];
    }
  } else {
    for (each in data) {
      this[each] = data[each];
    }
  }
  this.generateKeyTicker();
};

StockData.prototype.generateKeyTicker = function() {
  if (this.exchange && this.symbol)
    this.keyTicker = this.exchange + ':' + this.symbol;
  else
    this.keyTicker = null;
  this._generateLSKey(/*this.keyTicker*/);
  return this.keyTicker;
};

StockData.prototype.realLastPrice = function() {
  return this.extHours ? this.extLast : this.last;
};

StockData.prototype.realChange = function() {
  return this.extHours ? this.extChange : this.change;
};

StockData.prototype.realPercentChange = function() {
  return this.extHours ? this.extPercentChange : this.percentChange;
};

StockData.prototype.calcLastTick = function(prevLastPrice) {
  var diff = this.realLastPrice() - prevLastPrice;
  if (diff > numberUtils.zeroTolerance)
    this.lastTick = 'u';
  else if (diff < - numberUtils.zeroTolerance)
    this.lastTick = 'd';
  else
    this.lastTick = 'e';
};

StockData.prototype.toString = function() {
  return '[stock data ' + this.keyTicker + ']';
};



/**
 * Constructor
 * @param {string} keyTicker
 */
function RecentQuotes(keyTicker) {
  LSModel.apply(this, [keyTicker]);
  
  this.keyTicker = keyTicker;
  this.quotes = [];
  this.last = null;
  this.trend = ''; // trend will be available when engough quotes are saved
  this.lastTick = 'e';
};

// inherit from LSModel
RecentQuotes.prototype = new LSModel();
RecentQuotes.prototype.constructor = RecentQuotes;

RecentQuotes._quotesListLimit = 12;

RecentQuotes._composeLSKey = function(keyTicker) {
  return keyTicker ? ('rq_' + keyTicker) : null;
};

RecentQuotes.setLimit = function(limit) {
  limit = Math.floor(limit);
  RecentQuotes._quotesListLimit = limit < 3 ? 3 : limit;
};

RecentQuotes.retrieve = function(keyTicker) {
  return localStorageUtils.getObj(RecentQuotes._composeLSKey(keyTicker),
    null, RecentQuotes.prototype);
};

RecentQuotes.prototype._generateLSKey = function(keyTicker) {
  this.lsKey = RecentQuotes._composeLSKey(
    keyTicker ? keyTicker : this.keyTicker);
};

/**
 * Calculate trend based the lastest quote (which hasn't been
 * added to quote list yet) with current quote list average.
 * @param {number} newQuote
 */
RecentQuotes.prototype._calcTrend = function(newQuote) {
  var avg = this.average();
  if (Math.abs(newQuote - avg) < numberUtils.zeroTolerance)
    this.trend = 'e';
  else if (newQuote > avg)
    this.trend = 'u';
  else
    this.trend = 'd'; 
};

/**
 * Add a new quote; and calculate trend, last tick.
 * @param {number} quote
 */
RecentQuotes.prototype.add = function(quote) {
  // get rid of oldest quote(s) if reached limit
  if (this.quotes.length == RecentQuotes._quotesListLimit) {
    this._calcTrend(quote); // calc trend before updating the quote list
    this.quotes.shift();
  } else if (this.quotes.length > RecentQuotes._quotesListLimit) {
    // this will happend after limit was reset to be a smaller value
    this._calcTrend(quote); // calc trend before updating the quote list
    var toDelCount = this.quotes.length - RecentQuotes._quotesListLimit + 1;
    this.quotes.splice(0, toDelCount);
  }
  // add latest quote
  this.quotes.push(quote);
  // calc last tick (before updating last quote)
  if (this.last) {
    if (Math.abs(this.last - quote) < numberUtils.zeroTolerance)
      this.lastTick = 'e';
    else if (quote > this.last)
      this.lastTick = 'u';
    else
      this.lastTick = 'd';
  }
  // update last quote
  this.last = quote;
  this.save();
};

/**
 * Calculate average value of recent quotes.
 * @return average value
 */
RecentQuotes.prototype.average = function() {
  var len = this.quotes.length;
  if (len < numberUtils.zeroTolerance)
    return 0;
  
  var sum = 0.0;
  for (var i = 0; i < len; ++ i)
    sum += this.quotes[i];
  return sum / len;
};

/**
 * Clear
 */
RecentQuotes.prototype.clear = function() {
  this.quotes = [];
  this.last = null;
};

