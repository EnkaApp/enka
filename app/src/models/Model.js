/**
 * Model should not be used directly. It should be extended by subclasses.
 */

define(function(require, exports, methods) {
  var EventHandler = require('famous/core/EventHandler');
  var OptionsManager = require('famous/core/OptionsManager');

  var db = require('localforage');

  function Model(options) {

    this._db = db;
    
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS || Model.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);
  }

  Model.DEFAULT_OPTIONS = {}; // no defaults

  /**
   * Set internal options.
   *
   * @method setOptions
   * @param {Object} options
   */
  Model.prototype.setOptions = function(options) {
    this._optionsManager.patch(options);
  };

  /**
   * Look up options value by key
   * @method getOptions
   *
   * @param {string} key key
   * @return {Object} associated object
   */
  Model.prototype.getOptions = function getOptions() {
    return this._optionsManager.value();
  };

  Model.prototype.getOption = function(key) {
    return this.options[key];
  };

  methods.exports = Model;
});