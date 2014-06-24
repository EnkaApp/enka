
define(function(require, exports, module) {
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform     = require('famous/core/Transform');
  var RenderNode    = require('famous/core/RenderNode');
  var OptionsManager = require('famous/core/OptionsManager');

  var boardView = null;

  // coords: [gridSize: [2, 4],
  // startCoords: [2, 4]
  // obstacles: [3, 5]


  function BoardGenerator(options) {
    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);
  }

  BoardGenerator.DEFAULT_OPTIONS = {
    rows: 7,
    columns: 5,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight
  };

  /**
   * Look up options value by key
   * @method getOptions
   *
   * @param {string} key key
   * @return {Object} associated object
   */
  BoardGenerator.prototype.getOptions = function getOptions() {
    return this._optionsManager.value();
  };

  BoardGenerator.prototype.getNewBoard = function(){
    // TODO UPDATE OPTIONS
    if(!boardView){
      boardView = new BoardView(this.options);
    } else{
      boardView.setOptions(this.options);
    }  
  }

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  BoardGenerator.prototype.setOptions = function setOptions(options) {
    this._optionsManager.patch(options);
  };
 

  module.exports = BoardGenerator;
});