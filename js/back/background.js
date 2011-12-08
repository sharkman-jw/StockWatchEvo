// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview background singleton
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

var bg = (function() {
  
  var lsu = localStorageUtils;
  var subs = symbolSubscription;
  
  var sdm = new StockDataManager();
  var gQuoter = new GoogleQuoter();
  var batsQuoter = new BatsQuoter();
  
  /**
   * Callback for Quoter after getting quote from providers and now process the
   * StockData object.
   */
  Quoter.processResultStockDataCallBack = function(stockData) {
    stockData.save();
  };

  /**
   * Callback for BatsQuoter after getting quote from BATS and now process the
   * StockData object.
   */
  BatsQuoter.processResultStockDataCallBack = function(sd_in) {
    debugUtils.logObj(sd_in);
    var sd = StockData.retrieve(sd_in.keyTicker);
    sd.bids = sd_in.bids;
    sd.asks = sd_in.asks;
    sd.save();
    debugUtils.logObj(sd);
  };
  
  var processUpdate = function() {
  };
  
  /**
   * Initialize data.
   */
  var initOtherData = function() {
    sdm.clearAll();
    
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
    subs.add('AAPL');
    subs.add('C');
    subs.add('.DJI');
    subs.add('GOOG');
    subs.del('C');
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
      initSettings();
      //initSymbolLists();
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


