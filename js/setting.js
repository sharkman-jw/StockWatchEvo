// Copyright 2011 Joshua Wang, MIT License

/**
 * @fileoverview 
 * - Setting classes
 * - SettingsManager singleton
 * @author sharkman.jw@gmail.com (Joshua Wang)
 */

function Setting(keyword, defaultVal) {
  this.type = '';
  this.key = Setting.createKeyFromSettingKeyWord(keyword);
  this.defaultVal = defaultVal;
  this.value = defaultVal;
};

Setting.createKeyFromSettingKeyWord = function(keyword) {
  if (keyword)
    return '_' + keyword.replace(/\s/g, '_').toLowerCase();
  return '';
};

Setting.prototype.save = function() {
  localStorageUtils.saveObj(this.key, this);
};

Setting.prototype.remove = function() {
  localStorage.removeItem(this.key);
};

Setting.prototype.setValue = function(value) {
  this.value = value;
  this.save();
};

Setting.prototype.getValue = function() {
  return this.value;
};



function BooleanSetting(keyword, defaultVal) {
  Setting.apply(this, [keyword, defaultVal]);
  this.setValue(defaultVal);
  this.type = 'bool';
};
BooleanSetting.prototype = new Setting();
BooleanSetting.prototype.constructor = BooleanSetting;

BooleanSetting.prototype.setValue = function(value) {
  this.value = value ? 1 : 0;
  this.save();
};

BooleanSetting.prototype.getValue = function() {
  return this.value ? true : false;
};



function OptionSetting(keyword, options, defaultVal) {
  Setting.apply(this, [keyword, defaultVal]);
  this.type = 'option';
  this.options = options;
  this.optionsDisps = [];
  if (this.validateValue(defaultVal)) {
    this.valueIndex = this.options.indexOf(defaultVal);
  } else {
    this.defaultVal = this.options.length < 1 ? null : this.options[0];
    this.value = this.defaultVal;
    this.valueIndex = this.options.length < 1 ? -1 : 0;
  }
};
OptionSetting.prototype = new Setting();
OptionSetting.prototype.constructor = OptionSetting;

OptionSetting.prototype.setValue = function(value) {
  if (this.validateValue(value)) {
    this.value = value;
    this.valueIndex = this.options.indexOf(value);
    this.save();
  }
};

OptionSetting.prototype.setValueByIndex = function(index) {
  if (index >= 0 && index < this.options.length) {
    this.value = this.options[index];
    this.valueIndex = index;
    this.save();
  }
};

OptionSetting.prototype.getValueAtIndex = function(index) {
  if (index >= 0 && index < this.options.length)
    return this.options[index];
  return null;
};

OptionSetting.prototype.validateValue = function(value) {
  if (value == undefined)
    value = this.value;
  return this.options.indexOf(value) != -1;
};

OptionSetting.prototype.setOptionsDisplays = function(displays) {
  if (displays.length != this.options.length)
    return;
  this.optionsDisps = displays;
  this.save();
};

OptionSetting.prototype.getOptionsDisplays = function() {
  if (this.optionsDisps && this.optionsDisps.length > 0 &&
    this.optionsDisps.length == this.options.length) {
    return this.optionsDisps;
  }
  return this.options; // default
};



/**
 * Class SettingsManager
 */
var settingsManager = (function() {
  var _retrieveSetting = function(keyword) {
    var obj = localStorageUtils.getObj(
      Setting.createKeyFromSettingKeyWord(keyword), null);
    if (obj) {
      if (obj.type == 'option')
        obj.__proto__ = OptionSetting.prototype;
      else if (obj.type == 'bool')
        obj.__proto__ = BooleanSetting.prototype;
      else
        obj.__proto__ = Setting.prototype;
    }
    return obj;
  };
  
  return {
    getSetting: _retrieveSetting,
    
    /**
     * Create a regular setting.
     * @param {string} keyword
     * @param {any} defaultVal
     * @param {bool} override: override current setting if it exists
     */
    createSetting: function(keyword, defaultVal, override) {
      var setting = _retrieveSetting(keyword);
      if (!setting || override) {
        if (setting)
          setting.remove();
        setting = new Setting(keyword, defaultVal);
        setting.save();
      }
      return setting;
    },
    
    /**
     * Create a boolean setting.
     * @param {string} keyword
     * @param {bool} defaultVal
     * @param {bool} override: override current setting if it exists
     */
    createBooleanSetting: function(keyword, defaultVal, override) {
      var setting = _retrieveSetting(keyword);
      if (!setting || override) {
        if (setting)
          setting.remove();
        setting = new BooleanSetting(keyword, defaultVal);
        setting.save();
      }
      return setting;
    },
    
    /**
     * Create an option setting.
     * @param {string} keyword
     * @param {array} options
     * @param {any} defaultVal
     * @param {bool} override: override current setting if it exists
     */
    createOptionSetting: function(keyword, options, defaultVal, override) {
      var setting = _retrieveSetting(keyword);
      if (!setting || override) {
        if (setting)
          setting.remove();
        setting = new OptionSetting(keyword, options, defaultVal);
        setting.save();
      }
      return setting;
    }
  };
})();

