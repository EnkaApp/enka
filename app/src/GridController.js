
define(function(require, exports, module) {
  var columns;
  var rows;
  var state = [];


  var StateModifier = require('famous/modifiers/StateModifier');
  var Transform = require('famous/core/Transform');
  var RenderNode = require('famous/core/RenderNode');
  var PieceView     = require('./views/PieceView');

  function getY(index){
    for(var row = 0; row < rows; row++){
      if(index < columns){
        return row;
      }else if( (index >= (columns * row)) && index < ( columns * (row + 1) )){
        return row;
      } 
    }
  }

  function getX(index){
    return index % columns;
  }

  function GridController(dimensions) {
    if(!dimensions) dimensions = [];
    createGrid.call(this, dimensions);

  }

  function createGrid(dimensions){
    if(!dimensions) dimensions = [];
    columns = dimensions[0] || GridController.DEFAULT_OPTIONS.columns;
    rows = dimensions[1] || GridController.DEFAULT_OPTIONS.rows;
    var length = rows * columns;
    console.log(length);
    for(var i = 0; i < length; i++){
      state.push(null); 
    }
    
  }

  GridController.prototype.newPiece = function(size){
    var piece = new PieceView(size);
    return piece;
  }

  // GridController.prototype.placeStartPiece = function(dimensions, pieceSize){
  //   var length = dimensions[0] * dimensions[1];
  //   var middle = (length - 1) / 2;
  //   var midOrigin = GridController.prototype.getXYCoords(middle, pieceSize);
  //   // placeRenderNodeHere
  //   var piece = GridController.prototype.newPiece(pieceSize);

  //   console.log('midOrigin: ' + midOrigin[0] + ' ' + midOrigin[1]);
  //   var centerModifier = new StateModifier({
  //     // why does y need to be zero instead of midOrigin[1]?? // *******************************
  //     transform: Transform.translate(midOrigin[0], 0, 0) 
  //   });
  //   state[middle] = piece;
  //   this.add(centerModifier).add(piece);
  //   console.log('this: ', this);

  //   console.log('piece: ', piece);
  //   console.log('boardLength: ', length);
  //   console.log('middleIndex: ', middle);
  //   console.log('midOrigin: ', midOrigin);
  //   console.log(state);
  // }

  GridController.prototype.getPieceSize = function(viewSize){
    console.log('viewPortWidth: ', viewSize[0]);
    console.log('viewPortHeight: ', viewSize[1]);
    console.log('columns: ', columns)
    var pSize =  viewSize[0] / columns;
    console.log(pSize);
    return [pSize, pSize];
  };


  GridController.prototype.getXYCoords = function(index, pieceSize){
    // return xy coords
    var xyCoords = [];
    var coords = {
      x: getX(index),
      y: getY(index)
    }
    var size = pieceSize;
    xPix = getX(index) * size;
    yPix = getY(index) * size;
    xyCoords.push(xPix, yPix);

    console.log('index ' + index + ': (' + coords.x + ', ' + coords.y + ')');
    console.log('index ' + index + ': (' + xPix + ', ' + yPix + ')')
    console.log('xyCoords: ', xyCoords);

    return xyCoords;
  }

  GridController.prototype.isEmpty = function(index){
    return this._state === null;
  }

  GridController.prototype.findSameColorWithPath = function(index, piece){
    // return array of connected pieces of same color, not including piece
  }

  GridController.prototype.canMove = function(index){
    // returns bool
  }

  GridController.DEFAULT_OPTIONS = {
    rows: 7,
    columns: 5
  };

  module.exports = GridController;
});