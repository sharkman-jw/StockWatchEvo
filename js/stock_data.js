// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class StockData
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

/**
 * Constructor
 * @param {bool} skipInit: this is for static creator methods
 */
function StockData(skipInit) {
  if (skipInit) {
  } else {
    this.symbol = null; // string
    this.exchange = null; // string
    this.name = null; // string
    this.last = null; // number
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

/**
 * Create a StockData object from google data.
 * @param {obj} data
 * @return {obj} StockData object
 */
StockData.createFromGoogleData = function(data) {
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
  
  return sd;
};

StockData.createFromData = function(data) {
  var sd = new StockData();
  sd.assign(data, false);
  return sd;
};

StockData.prototype.update = function(data) {
  // TODO or TOREMOVE
};

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
  this.keyTicker = this.exchange + ':' + this.symbol;
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
