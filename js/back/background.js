// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview background singleton
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

var bg = (function() {
  
  var lsu = localStorageUtils;
  var subs = symbolSubscription;
  
  var sdm = new StockDataManager();
  var slm = new SymbolListManager();
  
  // Setup quoters
  var gQuoter = new GoogleQuoter();
  var batsQuoter = new BatsQuoter();
  /**
   * Callback for Quoter after getting quote from providers and now process the
   * StockData object.
   */
  Quoter.processResultStockDataCallBack = function(stockData) {
    // This incoming stockData contains all data except bids and asks,
    // so we just use everything except those two.
    var sd = sdm.getStockData(stockData.keyTicker);
    if (sd) {
      stockData.bids = sd.bids;
      stockData.asks = sd.asks;
    }
    sdm.add(stockData);
    stockData.save();
    debugUtils.log(stockData.keyTicker + " saved");
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
   *
   */
  var processUpdate = function() {
    // TODO: transit from older versions to this version by using current data
    // in local storage. lots of work here.
    // testing method: setup local storage as old version's
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
    subs.symbols = slm.getSymbols();
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
      gQuoter.requestGroupQuotes(subs.symbols);
      batsQuoter.requestQuote("AAPL", "NASDAQ");
    }
    // scehdule next refresh
    var setting = settingsManager.getSetting('data_refresh_interval');
    var timeout = 1000 * (setting ? setting.getValue() : 10);
    //window.setTimeout(loopRefreshQuotes, timeout);
  };
  
  return {
    stockDataManager: sdm,
    
    /**
     *
     */
    init: function() {
      processUpdate();
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


