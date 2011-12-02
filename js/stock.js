// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class Stock
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function Stock(symbol, exchange, name, name) {
  this.symbol = symbol; // string
  this.exchange = exchange; // string
  this.name = name; // string
  this.type = name; // string
  
  this.keyTicker = null; // string - exchange:symbol
};

Stock.prototype.generateKeyTicker = function() {
  this.keyTicker = this.exchange + ':' + this.symbol;
  return this.keyTicker;
};

Stock.prototype.toString = function() {
  return '[stock ' + this.keyTicker + ']';
};
