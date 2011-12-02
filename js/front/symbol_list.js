// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class SymbolList
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function SymbolList(name, listId, limit) {
  this.symbols = [];
  this.name = name;
  this.limit = limit;
  this.listId = listId;
  this.visible = true;
  this.enable = true;
}