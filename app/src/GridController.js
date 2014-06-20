
define(function(require, exports, module) {
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform     = require('famous/core/Transform');
  var RenderNode    = require('famous/core/RenderNode');
  var OptionsManager = require('famous/core/OptionsManager');
  
  // ## View
  var PieceView     = require('./views/PieceView'); // deprecated

  function _getY(index) {
    var columns = this.options.columns;
    var rows = this.options.rows;

    for (var row = 0; row < rows; row++) {
      if (index < columns) {
        return row;
      } else if ((index >= (columns * row)) && index < ( columns * (row + 1))) {
        return row;
      }
    }
  }

  function _getX(index) {
    var columns = this.options.columns;

    return index % columns;
  }

  function _createGrid() {
    var length = this.options.rows * this.options.columns;

    for (var i = 0; i < length; i++) {
      this._state.push(null);
    }
  }

  function GridController(options) {
    this._state = [];
    this._dimensions = [];

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);

    this._dimensions = [this.options.rows, this.options.columns];
    this._cellSize = this.getCellSize();

    _createGrid.call(this);
  }

  GridController.DEFAULT_OPTIONS = {
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
  GridController.prototype.getOptions = function getOptions() {
      return this._optionsManager.value();
  };

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  GridController.prototype.setOptions = function setOptions(options) {
      this._optionsManager.patch(options);
  };

  // Deprectated
  // Moved to PieceGenerator
  GridController.prototype.newPiece = function(options) {
    var piece = new PieceView(options);
    return piece;
  };

  // Deprectated
  // Use getCellSize instead
  GridController.prototype.getPieceSize = function(viewSize) {
    this.options.viewWidth = viewSize[0];
    this.options.viewHeight = viewSize[1];
    return this.getCellSize();
  };

  // 
  GridController.prototype.getCellSize = function() {
    var columns = this.options.columns;
    var viewWidth = this.options.viewWidth;
    var size =  viewWidth / columns;

    return [size, size];
  };

  GridController.prototype.getXYCoordsFromGridCoords = function(coords) {
    var size = this._cellSize;
    var x = coords[0] * size[0];
    var y = coords[1] * size[1];

    return [x, y];
  };

  /**
   * @param {number} index
   * @param {number} pieceSize DEPRECATED
   */
  GridController.prototype.getXYCoords = function(index, pieceSize) {
    var size;

    // return xy coords
    var xyCoords = [];
    var coords = {
      x: _getX.call(this, index),
      y: _getY.call(this, index)
    };

    if (pieceSize) {
      size = pieceSize;
    } else {
      size = this._cellSize;
    }

    xPix = _getX.call(this, index) * size;
    yPix = _getY.call(this, index) * size;
    xyCoords.push(xPix, yPix);

    console.log('coordinates@index ' + index + ': ' + '(' + coords.x + ', ' + coords.y + ')');
    console.log('pixelPosition@index ' + index + ': (' + xPix + ', ' + yPix + ')');
    console.log('xyCoords: ', xyCoords);

    return xyCoords;
  };

  GridController.prototype.isEmpty = function(index) {
    return this._state === null;
  };

  module.exports = GridController;
});