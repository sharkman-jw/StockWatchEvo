// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview Class SView and SBag
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

/**
 * Class SBag: a collection of SNodes and (sub) SBags.
 */
function SBag() {
  this.hashedNodes = {};
  this.nodes = [];
  //this.hashedSubbags = {};
  //this.subbags = []
};

SBag.prototype.empty = function() {
  this.hashedNodes = {};
  this.nodes = [];
  //this.hashedSubbags = {};
  //this.subbags = []
};

SBag.prototype.clear = SBag.prototype.empty;

/**
 * Get a contained node or sub bag.
 */
SBag.prototype.get = function(key) {
  // search in hashed nodes for a matched node
  if (this.hashedNodes.hasOwnProperty(key))
    return this.hashedNodes[key];
  /*// search in hashed bags for a matched bag
  if (this.hashedSubbags.hasOwnProperty(key))
    return this.hashedSubbags[key];
  // digg into sub bags
  else {
    var target = null;
    for (each in this.hashedSubbags) {
      target = this.hashedSubbags[each].get(key);
      if (target)
        return target;
    }
    var n = this.subbags.length;
    for (var i = 0; i < n; ++ i) {
      target = this.subbags[i].get(key);
      if (target)
        return target;
    }
  }*/
  return null;
};

/**
 * Add a node or subbag.
 */
SBag.prototype.add = function(input, key) {
  if (!input)
    return false;
   
  if (input instanceof SNode) {
    if (key) {
      if (!this.get(key)) { // make sure key's not taken
        this.hashedNodes[key] = input;
        return true;
      }
    } else if (this.nodes.indexOf(input) == -1) {
      this.nodes.push(input);
    }
  }/* else if (input instanceof SBag) {
    if (key) {
      if (!this.get(key)) { // make sure key's not taken
        this.hashedSubbags[key] = input;
        return true;
      }
    } else if (this.subbags.indexOf(input) == -1) {
      this.subbags.push(input);
    }
  }*/
  return false;
};

SBag.prototype.refresh = function() {
  for (each in this.hashedNodes) {
    this.hashedNodes[each].refresh();
  }
  var n = this.nodes.length;
  var i = 0;
  for (i = 0; i < n; ++ i) {
    this.nodes[i].refresh();
  }
  /*for (each in this.hashedSubbags) {
    this.hashedSubbags[each].refresh();
  }
  n = this.subbags.length;
  for (i = 0; i < n; ++ i) {
    this.subbags[i].refresh();
  }*/
};



function SView(name) {
  this.name = name;
  this.bag = new SBag();
  this.handlers = {}; // view handlers
  this.parentView = null;
  this.subviews = {};
};

SView.prototype.init = function() {
};

/**
 * Register a handler.
 * @param {string} key
 * @param {function} handler: a function object
 */
SView.prototype.addHandler = function(handler, key) {
  if (key)
    this.handlers[key] = handler;
};

/**
 * Add an SNode.
 */
SView.prototype.addNode = function(snode, key) {
  return this.bag.add(snode, key);
};

/**
 * Add a sub view.
 */
SView.prototype.addSubview = function(subview) {
  if ((subview instanceof SView) &&
    !this.subviews.hasOwnProperty(subview.name)) {
    this.subviews[subview.name] = subview;
    subview.parentView = this;
    return true;
  }
  return false;
};

/**
 * Refresh view: including contained nodes and sub views.
 * @note Override this if needed.
 */
SView.prototype.refresh = function() {
  this.bag.refresh(); // refresh nodes
  for (each in this.subviews) {
    this.subviews[each].refresh();
  }
};

/**
 * Handle view event.
 * @note Override this if needed.
 */
SView.prototype.handleViewEvent = function(event, key) {
  if (this.handlers.hasOwnProperty(key)) {
    this.handlers[key].apply(this, [event]);
    return true;
  }
  return false;
};

SView.prototype.processCall = function(handlerKey, params) {
  if (this.handlers.hasOwnProperty(handlerKey)) {
    this.handlers[handlerKey].apply(this, params);
    return true;
  }
  return false;
};

/**
 * @param {string} target: could be element id/name, or event handler's key
 * @return true if event is processed; otherwise false.
 */
SView.prototype.processEvent = function(event, target) {
  if (event) {
    debugUtils.log("Event [" + event.type +
      "] on [" + target + "@" + this.name + "]");
  }
  // find target node to process this event
  var node = this.bag.get(target);
  if (node && node.handleEvent(event)) {
    debugUtils.log("Event processed.");
    return true;
  }
  // find a view event handler to process this
  if (this.handleViewEvent(event, target)) {
    debugUtils.log("Event processed.");
    return true;
  }
  // pass event to sub views
  for (each in this.subviews) {
    if (this.subviews[each].processEvent(event, target)) {
      debugUtils.log("Event processed.");
      return true;
    }
  }
  debugUtils.log("Event not handled.");
};