// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview class SObject
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function SObject(attributes) {
  this.attributes = {}; // runtime configurable attributes
  this.handlers = {}; // runtime configurable methods
  this.name = null;
  if (attributes)
    this._setAttr(attributes);
};

SObject.prototype._setAttr = function(attributes) {
  if (attributes.hasOwnProperty("name")) {
    this.name = attributes["name"] ? attributes["name"] : null;
    delete attributes["name"];
  }
  for (each in attributes) {
    this.attributes[each] = attributes[each];
  }
};

SObject.prototype.attr = function(para1, para2) {
  if (!para1)
    return;
  if (para2 === undefined) { // .attr(attrName) or .attr(attrHash)
    if (typeof(para1) == "string") { //.attr(attrName)
      return this.attributes[para1];
    } else { // .attr(attrHash)
      this._setAttr(para1);
    }
  } else { // .attr(attrName, attrValue)
    this.attributes[para1] = para2;
  }
};

SObject.prototype.bind = function(key, handler) {
  this.handlers[key] = handler;
};

SObject.prototype.hasHandler = function(key) {
  return this.handlers.hasOwnProperty(key);
};

/**
 * Trigger/invoke a binded handler.
 * @param {string} key
 * @param ... Provide as many parameters as needed, they will be passed to
 *            the handler.
 * @return Invoked handler's return value.
 */
SObject.prototype.trigger = function(key/*, para1, para2, ...*/) {
  if (this.handlers.hasOwnProperty(key)) {
    var params = [];
    var n = arguments.length;
    for (var i = 1; i < n; ++ i)
      params.push(arguments[i]);
    return this.handlers[key].apply(this, params);
  }
};
SObject.prototype.invoke = SObject.prototype.trigger;



/**
 * Class SNode
 * Use this class to bind a unique HTML element and update the element.
 * Each snode can be matched with a unique element.
 *
 * Constructor
 * @param {string} name: optional
 * @param {string} selector: css selector use to bind jQuery object; optional
 * @param {object} attributes: additional attributes to add; optional
 */
function SNode(name, selector, attributes) {
  attributes = attributes ? attributes : {};
  if (name)
    attributes["name"] = name;
  SObject.apply(this, [attributes]);
  
  // jQuery binding
  this.jqo = null; // jQuery obj
  this.inDom = false;
  if (selector)
    this.bindJQuery(selector);
  
  this.parent = null;
  this.childNodes = [];
  
  //this.bind("render", SNode.prototype.render);
};
SNode.prototype = new SObject();
SNode.prototype.constructor = SNode;

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
 * Render view (sync HTML element with data)
 */
SNode.prototype.render = function() {
  if (this.jqo) {
    // render self
    if (this.hasHandler("renderSelf")) 
      this.invoke("renderSelf"); // runtime configured procedure
    else 
      this.renderSelf(); // prototype defined procedure
    // render offsprings
    if (this.childNodes) {
      var n = this.childNodes.length;
      for (var i = 0; i < n; ++ i)
        this.childNodes[i].render();
    }
  }
};

SNode.prototype.renderSelf = function() {
  // Default as doing nothing.
  // Override this to do something special..
};

/**
 * Handel events.
 * @param {object} event object
 * @return return true if event was handled; otherwise false.
 */
SNode.prototype.processEvent = function(event) {
  var key = "on" + event.type;
  if (this.hasHandler(key)) {
    this.trigger(key, event);
    return true;
  }
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
      child.inDom = this.inDom;
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
      child.inDom = this.inDom;
    }
  }
};



/**
 * Class SBag: a collection of SNodes and (sub) SBags.
 */
function SBag(name) {
  SObject.apply(this, [{"name": name}]);
  this.hashedNodes = {};
  this.nodes = [];
  this.subbags = {};
};
SBag.prototype = new SObject();
SBag.prototype.constructor = SBag;

SBag.prototype.empty = function() {
  this.hashedNodes = {};
  this.nodes = [];
  this.subbags = {};
};
SBag.prototype.clear = SBag.prototype.empty;

/**
 * Get a contained node or sub bag.
 */
SBag.prototype.get = function(name) {
  // search in hashed nodes for a matched node
  if (this.hashedNodes.hasOwnProperty(name))
    return this.hashedNodes[name];
  // search in hashed bags for a matched bag
  if (this.subbags.hasOwnProperty(name))
    return this.subbags[name];
  // digg into sub bags
  else {
    var target = null;
    for (each in this.subbags) {
      target = this.subbags[each].get(name);
      if (target)
        return target;
    }
  }
  return null;
};

/**
 * Add a node or subbag.
 */
SBag.prototype.add = function(input) {
  if (!input)
    return false;
    
  if (input instanceof SNode) {
    if (input.name) {
      if (!this.get(input.name)) { // make sure key's not taken
        this.hashedNodes[input.name] = input;
        return true;
      }
    } else { // anonymous node
      if (this.nodes.indexOf(input) == -1) {
        this.nodes.push(input);
        return true;
      }
    }
  } else if (input instanceof SBag) {
    if (input.name && !this.get(input.name)) {
      this.subbags[input.name] = input;
      return true;
    }
  }
  return false;
};

SBag.prototype.render = function() {
  for (each in this.hashedNodes) {
    this.hashedNodes[each].render();
  }
  var n = this.nodes.length;
  var i = 0;
  for (i = 0; i < n; ++ i) {
    this.nodes[i].render();
  }
  for (each in this.subbags) {
    this.subbags[each].render();
  }
};

/**
 * Handel events.
 * @param {object} event object
 * @param {string} targetName: component name (optional)
 * @return return true if event was handled; otherwise false.
 */
SBag.prototype.processEvent = function(event, targetName) {
  if (event) {
    debugUtils.log("Event [" + event.type +
      "] on [" + targetName + "@" + this.name + "]");
  }
  
  // find a component to process the event
  if (targetName) { 
    // search in offsprings, including all levels
    var target = this.get(targetName);
    if (target) {
      if (target.processEvent(event)) {
        debugUtils.log("Event handled by: " + target.name);
        return true;
      }
    }
  } 
  // find a handler in "this" to process the event
  var key = "on" + event.type;
  if (this.hasHandler(key)) {
    this.trigger(key, event);
    debugUtils.log("Event handled by: " + this.name);
    return true;
  }

  debugUtils.log("Event not handled.");
  return false;
};

