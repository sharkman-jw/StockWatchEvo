// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class StockDataManager
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function SDMItem() {
  this.stockData = null;
  this.recentQuotes = null;
};

SDMItem.prototype.remove = function() {
  if (this.stockData)
    this.stockData.remove();
  if (this.recentQuotes)
    this.recentQuotes.remove();
};

SDMItem.prototype.save = function() {
  if (this.stockData)
    this.stockData.save();
  if (this.recentQuotes)
    this.recentQuotes.save();
};



/**
 * Class StockDataManager: manage stock data at runtime; data includes
 *                         StockData, RecentQuotes, Alert...
 */
function StockDataManager() {
  this.items = {};
  this.count = 0;
};

StockDataManager.dataLSKeyPattern = /^(d|rq)_(.+)$/i;

StockDataManager.clearAllFromLS = function() {
  localStorageUtils.clearByPattern(StockDataManager.dataLSKeyPattern);
};

/**
 * Add a data under management.
 * @param {obj} obj
 */
StockDataManager.prototype.add = function(obj) {
  if (!obj)
    return;
  if (obj instanceof StockData) {
    this.addStockData(obj);
  } else if (obj instanceof RecentQuotes) {
    this.addRecentQuotes(obj);
  }
};

/**
 * Add a StockData obj under management.
 * @param {obj} sd
 */
StockDataManager.prototype.addStockData = function(sd) {
  var item = null;
  if (this.items.hasOwnProperty(sd.keyTicker)) {
    item = this.items[sd.keyTicker];
  } else {
    item = new SDMItem();
    this.count ++;
    this.items[sd.keyTicker] = item;
  }
  item.stockData = sd;
};

/**
 * Add a RecentQuotes obj under management.
 * @param {obj} rq
 */
StockDataManager.prototype.addRecentQuotes = function(rq) {
  var item = null;
  if (this.items.hasOwnProperty(rq.keyTicker)) {
    item = this.items[rq.keyTicker];
  } else {
    item = new SDMItem();
    this.count ++;
    this.items[rq.keyTicker] = item;
  }
  item.recentQuotes = rq;
};

/**
 * Get a StockData obj by keyTicker.
 * @param {string} keyTicker
 */
StockDataManager.prototype.getStockData = function(keyTicker) {
  return this.items.hasOwnProperty(keyTicker) ? 
    this.items[keyTicker].stockData : null;
};

/**
 * Get a RecentQuotes obj by keyTicker.
 * @param {string} keyTicker
 */
StockDataManager.prototype.getRecentQuotes = function(keyTicker) {
  return this.items.hasOwnProperty(keyTicker) ? 
    this.items[keyTicker].recentQuotes : null;
};

/**
 * Remove a stock's data from manager; it may also remove data
 * from local storage, if specified.
 * @param {string} keyTicker
 * @param {bool} removeFromLS: remove data from local storage too if true
 */
StockDataManager.prototype.del = function(keyTicker, removeFromLS) {
  if (this.items.hasOwnProperty(keyTicker)) {
    var item = this.items[keyTicker];
    if (removeFromLS)
      item.remove();
    delete this.items[keyTicker];
    this.count --;
  }
};

StockDataManager.prototype.cleanup = function() {
  // TODO
};

/**
 * Save all contained data objects to local storage.
 */
StockDataManager.prototype.saveAll = function() {
  for (keyTicker in this.items) {
    this.items[keyTicker].save();
  }
};

/**
 * Clear data manager.
 * @param {bool} removeFromLS: remove data from local storage too if true
 */
StockDataManager.prototype.clear = function(removeFromLS) {
  if (removeFromLS) {
    for (keyTicker in this.items) {
    this.items[keyTicker].remove();
  }
  }
  this.items = {};
  this.count = 0;
};

/**
 * Reload data from local storage.
 */
StockDataManager.prototype.reload = function() {
  this.items = {};
  var sd = null;
  var rq = null;
  var lsItems = localStorageUtils.getByPattern(
    StockDataManager.dataLSKeyPattern);
  for (each in lsItems) {
    if (each.lastIndexOf("d_", 0) === 0) {
      sd = localStorageUtils.getObj(each, null, StockData.prototype);
      this.addStockData(sd);
    } else if (each.lastIndexOf("rq_", 0) === 0) {
      rq = localStorageUtils.getObj(each, null, RecentQuotes.prototype);
      this.addRecentQuotes(rq);
    }
  }
};

/**
 * Get size of stored items.
 */
StockDataManager.prototype.size = function() {
  return this.count;
};
