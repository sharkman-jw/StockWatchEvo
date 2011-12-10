// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview background singleton
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

var bg = (function() {
  debugUtils.enable(true);
  
  var lsu = localStorageUtils;
  var subs = (function() {
    var _symbols = [];
    var _outdated = true;
    var _slm = null; // symbol list manager
    var _update = function() {
      if (_outdated && _slm)
          _symbols = _slm.getSymbols();
    };
    return {
      init: function(slm) {
        _slm = slm;
        _outdated = true;
        _symbols = [];
      },
      setOutdated: function() { _outdated = true; },
      getSymbols: function() {
        _update();
        return _symbols;
      },
      update: _update
    };
  })();
  
  var sdm = new StockDataManager();
  var slm = new SymbolListManager();
  
  // Setup quoters
  var gQuoter = new GoogleQuoter();
  var batsQuoter = new BatsQuoter();
  batsQuoter.enable = false;
  /**
   * Callback for GoogleQuoter after getting quote from providers
   * and now process the StockData object.
   */
  GoogleQuoter.processResultStockDataCallBack = function(stockData) {
    // This incoming stockData contains all data except bids and asks,
    // so we just use everything except those two.
    var sd = sdm.getStockData(stockData.keyTicker);
    if (sd) {
      stockData.bids = sd.bids;
      stockData.asks = sd.asks;
    }
    sdm.add(stockData);
    stockData.save();
    // TODO:
    // alertManager.checkAlert(stockData.keyTicker);
    debugUtils.log(stockData.keyTicker + " saved");
    // now request bids and asks
    batsQuoter.requestQuote(stockData.symbol, stockData.exchange);
  };
  /**
   * Callback for BatsQuoter after getting quote from BATS and now process the
   * StockData object.
   */
  BatsQuoter.processResultStockDataCallBack = function(stockData) {
    // Only bids and asks in the incoming stockData are valid, so we just use
    // these two.
    var sd = sdm.getStockData(stockData.keyTicker);
    if (sd) {
      sd.bids = stockData.bids;
      sd.asks = stockData.asks;
      stockData = sd;
    }
    sdm.add(stockData);
    stockData.save();
    debugUtils.log(stockData.keyTicker + " b&a saved");
  };
  
  /**
   * Handle the transition from previous version to latest version, using
   * current local storage data.
   * @note testing method: setup local storage as old version's
   */
  var upgrade = function() {
    var versionCached = lsu.get("_version", "");
    var currentVersion = chrome.app.getDetails().version;
    if (currentVersion == versionCached) { // up-to-date
      return; // no need to upgrade
    };
    
    var expectedPreviousVersion = "1.1.0.4";
    if (versionCached != expectedPreviousVersion) {
      // upgrade from unexpected version (including brand new installation):
      // setup as new, except for symbol lists (if they exists).
      
      // try retrieve symbol lists
      // TODO
      
      // clear all
      lsu.clearAll();
      
      // setup symbol lists
      // TODO
      
      return;
    }
    
    // upgrade from expected previous version
    
    // TODO: lots of work here.
  };
  
  /**
   * Initialize data.
   */
  var initOtherData = function() {
    StockDataManager.clearAllFromLS();
    
    // refresh data (on/off)
    lsu.save('refresh_data', '1');
    
    // number of recent quotes to be stored
    var recentQuotesLimit = 12;
    var setting = settingsManager.getSetting('data_refresh_interval');
    if (setting) {
      recentQuotesLimit = Math.floor(120/setting.getValue());
      if (recentQuotesLimit < 4)
        recentQuotesLimit = 4;
    }
    lsu.save('recent_quotes_limit', recentQuotesLimit);
  };
  
  /**
   *
   */
  var initSubscription = function() {
    slm.reloadFromLS();
    var sl = null;
    if (!slm.contains("Recent")) {
      sl = new SymbolList("Recent", 8);
      sl.save();
      slm.add(sl);
    }
    if (!slm.contains("Watch")) {
      sl = new SymbolList("Watch", 25);
      sl.add("NASDAQ:AAPL");
      sl.add("NYSE:GE");
      sl.add("NYSE:C");
      sl.add("NASDAQ:MSFT");
      sl.add("LON:LSE");
      sl.save();
      slm.add(sl);
    }
    if (!slm.contains("Indexes")) {
      sl = new SymbolList("Indexes", 25);
      //sl.add(indexManager.get("US", "DJI"));
      sl.add("INDEXDJX:.DJI"); // TODO
      sl.save();
      slm.add(sl);
    }
    slm.save();
    subs.init(slm);
    subs.update();
  };
  
  /**
   * Initialize settings.
   */
  var initSettings = function() {
    // data refresh
    settingsManager.createOptionSetting('data_refresh_interval',
      [10, 15, 20, 30, 45, 60], 15);
  };
  
  /**
   * Refresh quotes.
   */
  var loopRefreshQuotes = function() {
    // refresh if data refresh is on
    if (lsu.getInt('refresh_data', 0)) {
      gQuoter.requestGroupQuotes(subs.getSymbols());
    }
    // scehdule next refresh
    var setting = settingsManager.getSetting('data_refresh_interval');
    var timeout = 1000 * (setting ? setting.getValue() : 10);
    //window.setTimeout(loopRefreshQuotes, timeout);
  };
  
  return {
    stockDataManager: sdm,
    subscriptions: subs,
    
    /**
     *
     */
    init: function() {
      upgrade();
      initSettings();
      initSubscription();
      initOtherData();
    },
    
    /**
     *
     */
    run: function() {
      loopRefreshQuotes();
    },
    
    /**
     *
     */
    cleanup: function() {
    }
  };
})();


