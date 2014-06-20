
define(function(require, exports, module) {
  var columns;
  var rows;

  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform     = require('famous/core/Transform');
  var RenderNode    = require('famous/core/RenderNode');
  var PieceView     = require('./views/PieceView');

  function getY(index) {
    for (var row = 0; row < rows; row++) {
      if (index < columns) {
        return row;
      } else if ((index >= (columns * row)) && index < ( columns * (row + 1))) {
        return row;
      }
    }
  }

  function getX(index) {
    return index % columns;
  }

  function GridController(dimensions) {
    if (!dimensions) dimensions = [];
    this._state = [];
    createGrid.call(this, dimensions);

  }

  function createGrid(dimensions) {
    if (!dimensions) dimensions = [];
    columns = dimensions[0] || GridController.DEFAULT_OPTIONS.columns;
    rows = dimensions[1] || GridController.DEFAULT_OPTIONS.rows;
    var length = rows * columns;
    for (var i = 0; i < length; i++) {
      this._state.push(null);
    }

  }

  // Deprectated
  // Moved to PieceGenerator
  GridController.prototype.newPiece = function(options) {
    var piece = new PieceView(options);
    return piece;
  };

  // Deprectated
  // Use getCellSize instead
  GridController.prototype.getPieceSize = function(viewSize) {
    return this.getCellSize(viewSize);
  };

  GridController.prototype.getCellSize = function(viewSize) {
    var pSize =  viewSize[0] / columns;
    return [pSize, pSize];
  };

  GridController.prototype.getXYCoords = function(index, pieceSize) {
    // return xy coords
    var xyCoords = [];
    var coords = {
      x: getX(index),
      y: getY(index)
    };

    var size = pieceSize;
    xPix = getX(index) * size;
    yPix = getY(index) * size;
    xyCoords.push(xPix, yPix);

    console.log('coordinates@index ' + index + ': ' + '(' + coords.x + ', ' + coords.y + ')');
    console.log('pixelPosition@index ' + index + ': (' + xPix + ', ' + yPix + ')');
    console.log('xyCoords: ', xyCoords);

    return xyCoords;
  };

  GridController.prototype.isEmpty = function(index) {
    return this._state === null;
  };

  GridController.DEFAULT_OPTIONS = {
    rows: 7,
    columns: 5
  };

  module.exports = GridController;
});