// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview Top area
 *               - symbol input
 *               - 
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function SymbolInput(selector) {
  SInput.apply(this, ["text", selector, null]);
};
SymbolInput.prototype = new SInput();
SymbolInput.prototype.constructor = SymbolInput;

SymbolInput.prototype.handleEvent = function(event) {
  if (event.type == "keydown") {
    // handle ENTER, ARROW UP/DOWN
    track("here");
    return true;
  } else if (event.type == "keyup") {
    // validate input, and request symbol hints
    return true;
  }
  return false;
};


function TopArea() {
  SView.apply(this, ["top_area"]);
};
TopArea.prototype = new SView();
TopArea.prototype.constructor = TopArea;

TopArea.prototype.init = function() {
  var si = new SymbolInput("#symbol_input");
  this.addNode(si, "symbol_input");
};


