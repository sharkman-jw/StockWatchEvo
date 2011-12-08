// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview 
 *   - numberUtils
 *   - localStorageUtils
 *   - debugUtils
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */


/**
 * numberUtils singleton
 */
var numberUtils = (function() {
  var _epsilon = 0.000001; // good enough for this app
  
  return {
    zeroTolerance: _epsilon,
    
    /**
     * Format number with comma(s)
     * @param {number} value: input number
     * @param {number} decimals: number of decimals
     * @return {string} formatted string
     */
    formatWithComma: function(value, decimals) {
      if (!decimals && decimals != 0)
        decimals = 2;
      else if (decimals < 0)
        decimals = 0;
      
      var neg = false;
      if (value < 0) {
        neg = true;
        value = -value;
      }
      
      var s = value.toFixed(decimals);
      if (value < 1000)
        return neg ? ('-' + s) : s;
      
      var x = s.split('.');
      var x1 = x[0]; // part before decimal point
      var x2 = x.length > 1 ? ('.' + x[1]) : ''; // part after decimal point
      
      var parts = [];
      var n = x1.length % 3;
      if (n > 0) {
        parts.push(x1.substr(0, n));
      }
      while (n < x1.length) {
        parts.push(x1.substr(n, 3));
        n += 3;
      }
      
      return neg ? ('-' + parts.join(',') + x2) : (parts.join(',') + x2);
    },
    
    /**
     * Parse number string with comma(s) to float number
     * @param {string} s
     * @return {number} parsed result
     */
    parseNumberWithComma: function(s) {
      if (s)
        return parseFloat(s.replace(/,/g, ''));
      return Number.NaN;
    },
    
    /**
     * Compare number
     * @param {number} val1
     * @param {number} val2
     * @return {number} compare result
     */
    compare: function(val1, val2) {
      if (Math.abs(val1 - val2) < epsilon)
        return 'e';
      else if (val1 > val2)
        return 'g';
      return 'l';
    }
  };
})();



/**
 * localStorageUtils singleton: wrapper of local storage.
 */
var localStorageUtils = (function() {
  /**
   * Retrieve a str from local storage.
   * @param {string} key
   * @param {string} defaultVal: if no valid value is retrieved, use this
   */
  var _retrieveStr = function(key, defaultVal) {
    var val = localStorage.getItem(key);
    if (val == 'null' || val == 'undefined')
      return null;
    return (val || val == '') ? val : (defaultVal ? defaultVal : null);
  };
  
  /**
   * Save a str to local storage.
   * @param {string} key
   * @param {any} val: value to store in string format
   */
  var _save = function(key, val) {
    localStorage.setItem(key, val);
  };
  
  return {
    save: _save,
    saveStr: _save,
    get: _retrieveStr,
    getStr: _retrieveStr,
    saveNumber: _save,
    
    /**
     * Retrieve a number from local storage.
     * @param {string} key
     * @param {num} defaultVal: default value to use if no valid one is retrieved
     */
    getNumber: function(key, defaultVal) {
      var val = _retrieveStr(key, null);
      return val ? parseFloat(val) : defaultVal;
    },
    
    /**
     * Retrieve an integer from local storage.
     * @param {string} key
     * @param {number} defaultVal: default value to use if no valid one is 
     *                             retrieved.
     */
    getInt: function(key, defaultVal) {
      var val = _retrieveStr(key, null);
      return val ? parseInt(val) : defaultVal;
    },
    
    /**
     * Save an object to local storage.
     * @param {string} key
     * @param {obj} obj: object to save
     */
    saveObj: function(key, obj) {
      localStorage.setItem(key, JSON.stringify(obj));
    },
    
    /**
     * Retrieve an object from local storage.
     * @param {string} key
     * @param {obj} defaultVal: default obj to use if no valid one is retrieved
     * @param {obj} classPrototype: prototype to assign to the retrieved obj
     */
    getObj: function(key, defaultVal, classPrototype) {
      var val = _retrieveStr(key, null);
      if (val) {
        var obj = JSON.parse(val);
        if (classPrototype) {
          obj.__proto__ = classPrototype;
        }
        return obj;
      }
      return defaultVal;
    },
    
    /**
     * Retrieve string values from local storage by regex pattern.
     * @param {regex} local storage key regex pattern.
     */
    getByPattern: function(pattern) {
      var matchedItems = {};
      for (each in localStorage) {
        if (each.match(pattern)) {
          matchedItems[each] = _retrieveStr(each);
        }
      }
      return matchedItems;
    },
    
    /**
     * Clear local storage items by key pattern.
     * @param {regex} local storage key regex pattern, of those items to be
     *                removed.
     * @return {number} number of items removed.
     */
    clearByPattern: function(pattern) {
      var n = 0;
      for (each in localStorage) {
        if (each.match(pattern)) {
          localStorage.removeItem(each);
          n ++;
        }
      }
      return n;
    },
    
    /**
     * Clear all local storage data
     * @return {number} number of items removed
     */
    clearAll: function() {
      var n = 0;
      for (each in localStorage) {
        localStorage.removeItem(each);
        n ++;
      }
      return n;
    },
    
    /**
     * Remove an item by key. This is bascially a forward call.
     * @param {string} key
     */
    remove: function(key) {
      localStorage.removeItem(key);
    }
  };
})();



/**
 * This is a interface for models that can be saved to and retrieved from
 * local storage.
 */
function LSModel(seedWord) {
  if (seedWord)
    this._generateLSKey(seedWord);
  else
    this.lsKey = null;
};

LSModel.prototype._generateLSKey = function(seedWord) {
  // override this
  this.lsKey = null;
};

LSModel.prototype.save = function() {
  if (this.lsKey)
    localStorage.setItem(this.lsKey, this.json());
    //localStorageUtils.saveObj(this.lsKey, this);
};

LSModel.prototype.remove = function() {
  if (this.lsKey)
    localStorageUtils.remove(this.lsKey);
};

LSModel.prototype.json = function() {
  return JSON.stringify(this);
}



/**
 * debugUtils singleton
 */
var debugUtils = (function() {
  var _config = { enable: true };
  
  return {
    enable: function(enableIt) {
      _config.enable = enableIt;
    },
    
    /**
     * Print text to log
     * @param {string} text
     */
    log: function(text) {
      if (!_config.enable)
        return;
      console.log(text);
    },
    
    /**
     * Print text to log
     * @param {string} text
     */
    logObj: function(obj) {
      if (!_config.enable)
        return;
      console.log(JSON.stringify(obj));
    }
  };
})();

