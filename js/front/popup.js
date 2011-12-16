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




function Popup() {
  SView.apply(this, ["popup"]);
};
Popup.prototype = new SView();
Popup.prototype.constructor = Popup;

Popup.prototype.init = function() {
  this.initLocalData();
  this.initUI();
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

Popup.prototype.initUI = function() {
  this.topArea = new TopArea();
  this.topArea.init();
  this.addSubview(this.topArea);
  // TODO
};

Popup.prototype.handleInitFail = function() {
  // TODO: show empty
};

Popup.prototype.run = function() {
};

/**
 * Load stock data from local storage.
 */
Popup.prototype.loadStockData = function() {
};

Popup.prototype.refreshUI = function() {
};

Popup.prototype.loopWork = function() {
  this.loadStockData();
  this.refreshUI();
  // scehdule next round
  var setting = settingsManager.getSetting('data_refresh_interval');
  var timeout = 1000 * (setting ? setting.getValue() : 10);
  //window.setTimeout(loopRefreshQuotes, timeout);
};


