
define(function(require, exports, module) {
  
  function GridController() {
    this._state = [];
  }
  
  function createGrid(){

  }

  GridController.prototype.getCoords = function(index){
    // return xy coords
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
    columns: 5,
    rows: 5
  };

  module.exports = GridController;
});