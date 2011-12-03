// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class RecentQuotes
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */
 
function RecentQuotes(keyTicker) {
  this.keyTicker = keyTicker;
  this.quotes = [];
  this.last = null;
  this.trend = ''; // trend will be available when engough quotes are saved
  this.lastTick = 'e';
};

RecentQuotes._quotesListLimit = 12;

RecentQuotes.setLimit = function(limit) {
  limit = Math.floor(limit);
  RecentQuotes._quotesListLimit = limit < 3 ? 3 : limit;
}

RecentQuotes.retrieve = function(keyTicker) {
  return localStorageUtils.getObj('rq_' + keyTicker, null, RecentQuotes.prototype);
}

RecentQuotes.prototype.save = function() {
  localStorageUtils.saveObj('rq_' + this.keyTicker, this);
}

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
}

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

RecentQuotes.prototype.average = function() {
  var len = this.quotes.length;
  if (len < numberUtils.zeroTolerance)
    return 0;
  
  var sum = 0.0;
  for (var i = 0; i < len; ++ i)
    sum += this.quotes[i];
  return sum / len;
};

RecentQuotes.prototype.clear = function() {
  this.quotes = [];
  this.last = null;
};
