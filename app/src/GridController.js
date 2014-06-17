
define(function(require, exports, module) {
  var rows;
  var columns;

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
    this._state = [];
    createGrid.call(this, dimensions);
  }
  function createGrid(dimensions){
    if(!dimensions) dimensions = [];
    rows = dimensions[0] || GridController.DEFAULT_OPTIONS.rows;
    columns = dimensions[1] || GridController.DEFAULT_OPTIONS.columns;
    var length = rows * columns;
    for(var i = 0; i < length; i++){
      this._state.push(null);
    }
  }
  GridController.prototype.getPieceSize = function(dimensions){
    return window.innerWidth / columns;
  };
  GridController.prototype.getCoords = function(index){
    // return xy coords
    var coords = {
      x: getX(index),
      y: getY(index)
    }
    var size = this.getPieceSize();
    xPix = getX(index) * size;
    yPix = getY(index) * size;


    console.log('index ' + index + ': (' + coords.x + ', ' + coords.y + ')');
    console.log('index ' + index + ': (' + xPix + ', ' + yPix + ')')

  }
  GridController.prototype.isEmpty = function(index){
    return boolean 
  }
  GridController.prototype.updateState = function(index, piece){
    // pushes piece to index
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