// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class SymbolSubscription
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function SymbolSubscription() {
  this.hash = {};
}

SymbolSubscription.prototype.add = function(symbol) {
  this.hash[symbol] = '';
}

SymbolSubscription.prototype.remove = function(symbol) {
  delete this.hash[symbol];
}

SymbolSubscription.prototype.symbolList = function() {
  var symbols = [];
  for (each in this.hash) {
    symbols.push(each);
  }
  return symbols;
}
