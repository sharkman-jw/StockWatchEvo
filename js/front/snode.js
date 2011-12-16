// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class SNode (meaning: SuperNode or SWatchNode ...)
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

/**
 * class SNode
 * Use this class to bind a unique HTML element and update the element.
 * Each snode can be matched with a unique element.
 */
function SNode(selector, selfRefreshFunc) {
  // jQuery stuff
  this.jqo = null; // jQuery obj
  this.inDom = false;
  if (selector)
    this.bindJQuery(selector);
  
  this.selfRefreshFunc = selfRefreshFunc ? selfRefreshFunc : null;
  
  this.parent = null;
  this.childNodes = [];
};

/**
 * Validate jQuery binding: if the object is jQuery object and size is 1, 
 * it is valid.
 * @param {jQuery} jqo: optional
 * @return true as valid; otherwise false.
 */
SNode.prototype.validate = function(jqo) {
  if (!jqo)
    jqo = this.jqo;
  return jqo && (jqo instanceof jQuery) && (jqo.length == 1);
};

/**
 * Setup jQuery bindings.
 * @param {string | jQuery} input: css selector or jQuery object
 * @param {bool} notInDom: whether this jQuery object is currently in dom.
 *                         * This param is only used if input is jQuery object.
 * @return true, if input is successfully binded; otherwise false.
 */
SNode.prototype.bindJQuery = function(input, notInDom) {
  if (this.jqo || !input)
    return false; // skip if already binded or no input
  
  if (typeof(input) == 'string') { // css selector
    this.jqo = jQuery(input);
    this.inDom = true;
  } else if ((input instanceof jQuery)) { // jQuery object
    this.jqo = input;
    this.inDom = notInDom ? false : true;
  } else { // invalid input
    return false;
  }
  // validate
  if (this.validate())
    return true;
  // reset
  this.jqo = null;
  this.inDom = false;
  return false;
};

/**
 * Clear offsprings.
 */
SNode.prototype.empty = function() {
  if (this.jqo)
    this.jqo.empty();
  // This recursion here may not be necessary
  if (this.childNodes) {
    var n = this.childNodes.length;
    for (var i = 0; i < n; ++ i)
      this.childNodes[i].empty();
  }
  this.childNodes = [];
};

/**
 * Refresh view (sync HTML element with data)
 */
SNode.prototype.refresh = function() {
  if (this.jqo) {
    // refresh self
    if (this.selfRefreshFunc)
      this.selfRefreshFunc();
    else
      this._refreshSelf();
    if (this.childNodes) {
      var n = this.childNodes.length;
      for (var i = 0; i < n; ++ i)
        this.childNodes[i].refresh();
    }
  }
};

SNode.prototype._refreshSelf = function() {
  // Default as doing nothing.
  // Override this to do something special..
};

/**
 * Handel events.
 * @param {object} event object
 * @return return true if event was handled; otherwise false.
 */
SNode.prototype.handleEvent = function(event) {
  // Default as doing nothing.
  // Override this to do something special..
  return false;
};

/**
 * Append a child node.
 */
SNode.prototype.appendChild = function(child) {
  if (this.jqo && child && !child.parent
    && this.childNodes.indexOf(child) == -1) {
    this.childNodes.push(child);
    child.parent = this;
    if (!child.inDom) {
      this.jqo.append(child.jqo);
      child.inDom = true;
    }
  }
};

/**
 * Prepend a child node.
 */
SNode.prototype.prependChild = function(child) {
  if (this.jqo && child && !child.parent
    && this.childNodes.indexOf(child) == -1) {
    this.childNodes.splice(0, 0, child);
    child.parent = this;
    if (!child.inDom) {
      this.jqo.prepend(child.jqo);
      child.inDom = true;
    }
  }
};



/**
 *
 */
function SInput(type, selector, selfRefreshFunc) {
  SNode.apply(this, [selector, selfRefreshFunc]);
  this.type = type;
};
SInput.prototype = new SNode();
SInput.prototype.constructor = SInput;
