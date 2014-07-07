/*
 * Controller should not be used directly. It should be extended by subclasses.
 */

define(function(require, exports, methods) {
  var EventHandler = require('famous/core/EventHandler');
  var OptionsManager = require('famous/core/OptionsManager');

  function Controller(options) {
    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS || Controller.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);
  }

  Controller.DEFAULT_OPTIONS = {}; // no defaults

  /*
   * Set internal options.
   *
   * @method setOptions
   * @param {Object} options
   */
  Controller.prototype.setOptions = function(options) {
    this._optionsManager.patch(options);
  };

  /*
   * Look up options value by key
   * @method getOptions
   *
   * @param {string} key key
   * @return {Object} associated object
   */
  Controller.prototype.getOptions = function getOptions() {
    return this._optionsManager.value();
  };

  Controller.prototype.getOption = function(key) {
    return this.options[key];
  };

  methods.exports = Controller;
});
