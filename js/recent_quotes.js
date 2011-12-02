// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class RecentQuotes
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */
 
function RecentQuotes(keyTicker) {
  this.keyTicker = keyTicker;
  this.quotes = [];
  this.last = null;
};

RecentQuotes.prototype.addQuote = function(quote, limit) {
  if (this.quotes.length == limit) {
    this.quotes.shift();
  } else if (this.quotes.length > limit) { // after limit was reset to be a smaller value
    var n = this.quotes.length - limit + 1; // number of quotes to remove
    quotes.splice(0, n);
  }
  this.quotes.push(quote);
  this.last = quote;
};

RecentQuotes.prototype.average = function() {
  var len = this.quotes.length;
  var sum = 0.0;
  for (var i = 0; i < len; ++ i)
    sum += this.quotes[i];
  return sum / len;
};

RecentQuotes.prototype.clear = function() {
  this.quotes = [];
  this.last = null;
};
