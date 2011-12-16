// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class SymbolList
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

/**
 * Class SymbolList: a list of unique symbols
 */
function SymbolList(name, limit) {
  LSModel.apply(this, [name]);
  
  this.symbols = [];
  this.name = name;
  this.limit = (limit && limit > 0) ? limit : SymbolList.defaultLimit;
  this.visible = true;
  this.enable = true;
};

// inherit from LSModel
SymbolList.prototype = new LSModel();
SymbolList.prototype.constructor = SymbolList;

SymbolList.defaultLimit = 20;

/**
 * Retrieve symbol list from local storage by name.
 * @param {string} name: symbol list name
 * @return {obj} retrieved symbol list object
 * @note Static method.
 */
SymbolList.retrieve = function(name) {
  return localStorageUtils.getObj(SymbolList._composeLSKey(name), null,
    SymbolList.prototype);
};

/**
 * Retrieve symbol list from local storage by key.
 * @param {string} key: symbol list key
 * @return {obj} retrieved symbol list object
 * @note Static method.
 */
SymbolList.retrieveByLSKey = function(lsKey) {
  return localStorageUtils.getObj(lsKey, null, SymbolList.prototype);
};

/**
 * Create list key by name
 * @param {string} listName
 * @return {string} list key
 * @note Static method.
 */
SymbolList._composeLSKey = function(listName) {
  return listName ? ('sl_' + listName.replace(/\s/g, '_').toLowerCase()) : null;
};

SymbolList.prototype._generateLSKey = function(listName) {
  this.lsKey = SymbolList._composeLSKey(listName ? listName : this.listName);
};

/**
 * Set the limit of symbol list.
 * @param {number} limit
 */
SymbolList.prototype.setLimit = function(limit) {
  if (limit > 0 && this.limit != limit) {
    var n = this.symbols.length - limit;
    if (n > 0) {
      this.symbols.splice(limit, n);
    }
    this.limit = limit;
  }
};

/**
 * Add a symbol.
 * @param {string} symbol
 * @param {bool} shiftOldestIfFull: get rid of the first symbol (to make room
 *                                  for the new one) if the list is full.
 * @return {bool} true if added; otherwise false
 */
SymbolList.prototype.add = function(symbol, shiftOldestIfFull) {
  var i = this.symbols.indexOf(symbol);
  if (i != -1)
    return true; // already in the list
  
  if (this.symbols.length >= this.limit) {
    if (shiftOldestIfFull) {
      while (this.symbols.length >= this.limit)
        this.symbols.shift();
    } else {
      return false; // couldn't add because reached limit
    }
  }
  
  this.symbols.push(symbol);
  return true;
};

/**
 * Delete a symbol from the list.
 * @param {string} symbol
 * @return {bool} true if a symbol is deleted; false if the symbol is not found
 */
SymbolList.prototype.del = function(symbol) {
  var i = this.symbols.indexOf(symbol);
  if (i != -1) {
    this.symbols.splice(i, 1);
    return true;
  }
  return false;
};

/**
 * Move up a symbol.
 * @param {string} symbol
 * @param {number} n: number of positions to move
 * @return {bool} true if moved or already in front; false if symbol not found
 */
SymbolList.prototype.moveSymbolUp = function(symbol, n) {
  if (n < 0) // move down
    return this.moveSymbolDown(symbol, -n);
  
  var i = this.symbols.indexOf(symbol);
  if (i == -1) // symbol not found
    return false;
  if (n > i) // trying to move too much
    n = i; // just move to front then
  
  if (n == 1) { // just swap
    this.symbols[i] = this.symbols[i - 1];
    this.symbols[i - 1] = symbol;
  } else if (n) {
    this.symbols.splice(i, 1);
    this.symbols.splice(i - n, 0, symbol);
  }
  
  return true;
};

/**
 * Move down a symbol.
 * @param {string} symbol
 * @param {number} n: number of positions to move
 */
SymbolList.prototype.moveSymbolDown = function(symbol, n) {
  if (n < 0) // move up
    return this.moveSymbolUp(symbol, -n);
  
  var i = this.symbols.indexOf(symbol);
  if (i == -1) // symbol not found
    return false;
  if (n > (this.size() - i - 1)) // trying to move too much
    n = this.size() - i - 1; // just move to end then
  
  if (n == 1) { // just swap
    this.symbols[i] = this.symbols[i + 1];
    this.symbols[i + 1] = symbol;
  } else if (n) {
    this.symbols.splice(i + n + 1, 0, symbol);
    this.symbols.splice(i, 1);
  }
  
  return true;
};

/**
 * Locate a symbol in the list.
 * @param {string} symbol.
 * @return {number} index of given symbol in the list.
 */
SymbolList.prototype.indexOf = function(symbol) {
  return this.symbols.indexOf(symbol);
};

/**
 * Check if a symbol is in the list.
 * @param {string} symbol.
 * @return {bool} true if list containing input symbol, otherwise false.
 */
SymbolList.prototype.contains = function(symbol) {
  return this.symbols.indexOf(symbol) != -1;
};

/**
 * Return size of the list.
 * @return {number} length of the list.
 */
SymbolList.prototype.size = function() {
  return this.symbols.length;
};

SymbolList.prototype.at = function(index) {
  return this.symbols[index];
};



/**
 * Class SymbolListManager
 */
function SymbolListManager() {
  LSModel.apply(this);
  this.lsKey = SymbolListManager._lsKey;
  this.lists = {}; // list names, not SymbolList objects
  this.count = 0;
};

// inherit from LSModel
SymbolListManager.prototype = new LSModel();
SymbolListManager.prototype.constructor = SymbolListManager;

SymbolListManager._lsKey = '_slm';

SymbolListManager.retrieve = function() {
  var slm = localStorageUtils.getObj(SymbolListManager._lsKey, null,
    SymbolListManager.prototype);
  if (!slm)
    return null;
  // retrieve list data
  for (each in slm.lists) {
    slm.lists[each] = slm.get(each);
  }
  return slm;
};

SymbolListManager.prototype.json = function(full) {
  if (full)
    return LSModel.prototype.json.call(this);
  // for saving purpose, we don't save details of each list,
  // only list names will be saved
  var data = this.lists;
  this.lists = {};
  for (each in data)
    this.lists[each] = '';
  var jsonStr = JSON.stringify(this);
  this.lists = data;
  return jsonStr;
};

SymbolListManager.prototype.contains = function(slObjOrName) {
  if (slObjOrName instanceof SymbolList)
    return this.lists.hasOwnProperty(slObjOrName.name);
  else
    return this.lists.hasOwnProperty(slObjOrName);
};

SymbolListManager.prototype.add = function(sl) {
  if (!this.contains(sl)) {
    this.lists[sl.name] = sl;
    this.count ++;
  }
};

SymbolListManager.prototype.del = function(slName, destoryList) {
  if (this.contains(slName)) {
    if (destoryList)
      this.lists[slName].remove();
    delete this.lists[slName];
    this.count --;
  }
};

SymbolListManager.prototype.get = function(slName) {
  if (this.contains(slName)) {
    var sl = SymbolList.retrieve(slName);
    if (!sl)
      return this.lists[slName];
    return sl;
  }
  return null;
};

SymbolListManager.prototype.reloadFromLS = function() {
  var slDataItems = localStorageUtils.getByPattern(/^sl_(.+)$/);
  var sl = null;
  this.clear();
  for (each in slDataItems) {
    sl = SymbolList.retrieveByLSKey(each);
    if (sl.hasOwnProperty('symbols') && sl.hasOwnProperty('name')) {
      this.add(sl);
    }
  }
}; 

SymbolListManager.prototype.getSymbols = function() {
  var sl = null;
  var hash = {};
  var lst = [];
  var i = 0;
  var n = 0;
  var sym = null;
  for (slName in this.lists) {
    sl = this.get(slName);
    n = sl.size();
    for (i = 0; i < n; ++ i) {
      sym = sl.symbols[i];
      if (!hash.hasOwnProperty(sym)) {
        hash[sym] = '';
        lst.push(sym);
      }
    }
  }
  return lst;
};

SymbolListManager.prototype.clear = function() {
  this.lists = {};
  this.count = 0;
};

SymbolListManager.prototype.size = function() {
  return this.count;
};
