// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview Top area
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */
function DetailPanel() {
  SBag.apply(this, ["sb_detail_panel"]);
  this.stockData = null;
};
DetailPanel.prototype = new SBag();
DetailPanel.prototype.constructor = DetailPanel;

DetailPanel.prototype.init = function() {
  var sn = new SNode("detail_prc", "#detail_prc", {"dp": this});
  sn.bind("renderSelf", function() {
    var sd = this.attr("dp").stockData;
    this.jqo.text(sd ? sd.last : "");
  });
  this.add(sn);
  
  sn = new SNode("detail_status", "#detail_status", {"dp": this});
  sn.bind("renderSelf", function() {
    var sd = this.attr("dp").stockData;
    this.jqo.text(sd ? sd.tradingStatus : "");
  });
  this.add(sn);
  
  sn = new SNode("detail_c", "#detail_c", {"dp": this});
  sn.bind("renderSelf", function() {
    var sd = this.attr("dp").stockData;
    this.jqo.text(sd ? sd.change : "");
  });
  this.add(sn);
  
  sn = new SNode("detail_cp", "#detail_cp", {"dp": this});
  sn.bind("renderSelf", function() {
    var sd = this.attr("dp").stockData;
    this.jqo.text(sd ? sd.percentChange : "");
  });
  this.add(sn);
};

DetailPanel.prototype.setStockData = function(sd) {
  if (!sd)
    return;
  this.stockData = sd;
};


 

function TopArea() {
  SBag.apply(this, ["sb_top_area"]);
  
  this.headStockData = null;
};
TopArea.prototype = new SBag();
TopArea.prototype.constructor = TopArea;

TopArea.prototype.init = function() {
  this.add(this.createSymbolInput());
  var dp = new DetailPanel();
  dp.init();
  this.add(dp);
};

TopArea.prototype.createSymbolInput = function() {
  var si = new SNode("symbol_input", "#symbol_input");
  si.bind("onkeydown", function(event) {
    // handle ENTER, ARROW UP/DOWN
    //this.attr("typing", true);
    if (event.keyCode == 13) {
      var input = "";
      input = this.jqo.val().toUpperCase();
      jQuery.trim(input);
      if (input) {
        try {
          track("Request: " + input);
          popup.quote(input);
        } catch (err) {
          track("Fetch quote failed: " + input);
        }
      }
    }
    //track("process " + event.type + "@" + this.name);
  });
  si.bind("onkeyup", function(event) {
    // handle ENTER, ARROW UP/DOWN
    //track("process " + event.type + "@" + this.name);
  });
  return si;
};

TopArea.prototype.setStockData = function(sd) {
  this.headStockData = sd;
  this.get("sb_detail_panel").setStockData(sd);
};


