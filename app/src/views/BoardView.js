/* globals define */

/**
 * BoardView is basically a grid layout with a bunch of surfaces
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var GridLayout    = require('famous/views/GridLayout');

  var boardDimensions = [5,7];

  function _createBackground() {
    var bgSurface = new Surface({
      properties: {
        backgroundColor: 'black'
      }
    });

    this.add(bgSurface);
  }


  function _createSurfaces() {
    var size = boardDimensions[0] * boardDimensions[1];
    var surfaces = [];
    var x = 0;
    var y = 0;

    function getX(index){
      var columns = boardDimensions[0];
      var rows = boardDimensions[1];
      var x = index;
      for(var row = 0; row < rows; row++){ // x = 5, row = 1, columns = 5, rows = 7
        if(x < columns){
          console.log(row);
          return row;
        }else if( (x >= (columns * row)) && x < ( columns * (row + 1) )){
          console.log(row);
          return row;
        }
        
      }
   
    }


    for(var i = 0; i < size; i++){


      surfaces.push(new Surface({
        content: 'x: ' + getX(i),
        size: undefined,
        properties: {
          color: 'black',
          backgroundColor: 'hsl(100, 100%, 100%)',
          textAlign: 'center'
        }

      }));
    }

    return surfaces;
  }

  function _createGrid(dimensions) {
    var grid = new GridLayout({
      dimensions: dimensions
    });

    var surfaces = _createSurfaces();
    grid.sequenceFrom(surfaces);
    this.add(grid);


  }

  function BoardView() {
    View.apply(this, arguments);

    // add background
    _createBackground.call(this);
    // add grid
    _createGrid.call(this, boardDimensions);
  }

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.DEFAULT_OPTIONS = {};

  module.exports = BoardView;
});
