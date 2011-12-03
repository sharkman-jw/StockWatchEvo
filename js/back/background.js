// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview background singleton
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

var bg = (function() {
  
  var lsu = localStorageUtils;
  var sm = settingsManager;
  var subs = symbolSubscription;
  
  var gQuoter = new GoogleQuoter();
  
  /**
   * Callback for Quoter after getting quote from providers and now process the
   * StockData object.
   */
  Quoter.processResultStockDataCallBack = function(stockData) {
    stockData.save();
  };
  
  var processUpdate = function() {
  };
  
  /**
   * Initialize data.
   */
  var initOtherData = function() {
    clearStockData();
    
    // refresh data (on/off)
    lsu.save('refresh_data', '1');
    
    // number of recent quotes to be stored
    var recentQuotesLimit = 12;
    var setting = sm.getSetting('data_refresh_interval');
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
    sm.createOptionSetting('data_refresh_interval',
      [10, 15, 20, 30, 45, 60], 15);
  };
  
  /**
   * Refresh quotes.
   */
  var loopRefreshQuotes = function() {
    // refresh if data refresh is on
    if (lsu.getInt('refresh_data', 0)) {
      gQuoter.requestGroupQuotes(subs.symbols);
    }
    // scehdule next refresh
    var setting = sm.getSetting('data_refresh_interval');
    var timeout = 1000 * (setting ? setting.getValue() : 10);
    //window.setTimeout(loopRefreshQuotes, timeout);
  };
  
  var clearStockData = function() {
    return lsu.clearByPattern(/^(sd|rq)_(.+)$/i);
  };
  
  return {
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


