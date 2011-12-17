// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview popup singleton
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */
 
debugUtils.show = function(s, color) {
  if (!this.config.enable)
    return;
  var node = document.createElement('p');
  if (color) {
    node.setAttribute('style', 'color:' + color);
  }
  var textNode = document.createTextNode(">> " + s);
  node.appendChild(textNode);
  jQuery("#debug").prepend(node);
};

debugUtils.warn = function(s) {
  debugUtils.show(s, "yellow");
};

function track(s) { debugUtils.show(s); }
function trackObj(obj) { debugUtils.show(JSON.stringify(obj)); }



/**
 * Class Popup
 */
function Popup() {
  SBag.apply(this, ["sb_popup"]);
};
Popup.prototype = new SBag();
Popup.prototype.constructor = Popup;

Popup.prototype.init = function() {
  this.initLocalData();
  this.initUI();
  this.initQuoters();
};

Popup.prototype.initLocalData = function() {
  this.slm = new SymbolListManager();
  this.slm.reloadFromLS(); // loaded symbol list names, not the objects
  this.sdm = new StockDataManager(); // holds stock data locally
  this.subs = chrome.extension.getBackgroundPage().bg.subscriptions;
  
  this.headSymbolHolder = {symbol: null};
  this.recentList = this.slm.get("Recent");
  if (!this.recentList) this.handleInitFail();
  
};

Popup.prototype.initQuoters = function() {
  this.gQuoter = new GoogleQuoter();
  var sdm = this.sdm;
  /**
   * Callback for GoogleQuoter after getting quote from providers
   * and now process the StockData object.
   */
  this.gQuoter.resultStockDataHandler = function(stockData) {
    // This incoming stockData contains all data except bids and asks,
    // so we just use everything except those two.
    var sd = sdm.getStockData(stockData.keyTicker);
    if (sd) {
      stockData.bids = sd.bids;
      stockData.asks = sd.asks;
    }
    sdm.add(stockData);
    track(stockData + ": " + stockData.last);
  };
};

Popup.prototype.initUI = function() {
  this.topArea = new TopArea();
  this.topArea.init();
  this.add(this.topArea);
  // TODO
};

Popup.prototype.handleInitFail = function() {
  // TODO: show empty
};

Popup.prototype.run = function() {
  this.loopWork();
};

/**
 * Load stock data from local storage.
 */
Popup.prototype.loadStockData = function() {
  var sd = null;
  var symbols = this.subs.getSymbols();
  var n = symbols.length;
  for (var i = 0; i < n; ++ i) {
    sd = StockData.retrieve(symbols[i]);
    if (sd)
      this.sdm.add(sd);
    else
      track("Couldn't load stock data: " + symbols[i]);
  }
};

/**
 * Render popup view.
 */
/*Popup.prototype.render = function() {
  // TODO
  SBag.prototype.render.call(this);
};*/

Popup.prototype.loopWork = function() {
  this.loadStockData();
  this.topArea.setStockData(this.sdm.getStockData("NYSE:RENN"));
  this.render();
  // scehdule next round
  var setting = settingsManager.getSetting('data_refresh_interval');
  var timeout = 1000 * (setting ? setting.getValue() : 10);
  //window.setTimeout(loopRefreshQuotes, timeout);
};

Popup.prototype.quote = function(input) {
  this.gQuoter.requestGroupQuotes([input]);
};

