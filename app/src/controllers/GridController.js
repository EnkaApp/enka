define(function(require, exports, module) {
  var StateModifier   = require('famous/modifiers/StateModifier');
  var Transform       = require('famous/core/Transform');
  var Surface         = require('famous/core/Surface');
  var OptionsManager  = require('famous/core/OptionsManager');

  // ## Controllers
  var Controller = require('controllers/Controller');

  function GridController() {
    Controller.apply(this, arguments);
  }

  GridController.prototype = Object.create(Controller.prototype);
  GridController.prototype.constructor = GridController;

  GridController.DEFAULT_OPTIONS = {
    rows: 7,
    columns: 5,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight
  };

  // Deprectated
  // Use getCellSize instead
  GridController.prototype.getPieceSize = function(viewSize) {
    this.options.viewWidth = viewSize[0];
    this.options.viewHeight = viewSize[1];
    return this.getCellSize();
  };

  GridController.prototype.getCellSize = function() {
    var size;
    var columns = this.options.columns;
    var viewWidth = this.options.viewWidth;
    var wSize =  Math.floor(viewWidth / columns);

    var rows = this.options.rows;
    var viewHeight = this.options.viewHeight;
    var hSize =  Math.floor(viewHeight / rows);

    if (wSize < hSize) {
      size = [wSize, wSize];
    } else {
      size = [hSize, hSize];
    }

    this._cellSize = size;

    return size;
  };

  GridController.prototype.getBoardSize = function() {
    var cellSize = this.getCellSize();
    var width = cellSize[0] * this.options.columns;
    var height = cellSize[0] * this.options.rows;

    return [width, height];
  };

  GridController.prototype.getXYCoordsFromGridCoords = function(coords) {
    var size = this._cellSize;
    var x = coords[0] * size[0];
    var y = coords[1] * size[1];

    return [x, y];
  };

  /*
   * Same as getXYCoords but without the deprected pieceSize parameter
   *
   * @param {int} index Index form which to calculate the grid coordinates
   */
  GridController.prototype.getXYCoordsFromIndex = function(index) {
    return this.getXYCoords(index);
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
      size = [pieceSize, pieceSize];
    } else {
      size = this._cellSize;
    }

    xPix = _getX.call(this, index) * size[0];
    yPix = _getY.call(this, index) * size[1];
    xyCoords.push(xPix, yPix);

    return xyCoords;
  };

  GridController.prototype.isEmpty = function(index) {
    return this._state === null;
  };

  // ## Private Helpers

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

  module.exports = GridController;
});