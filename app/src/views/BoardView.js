/* globals define */
 var boardDimensions = [5, 7];
 var surfaces = [];
 var xStart, yStart, xEnd, yEnd;  
/**
 * BoardView is basically a grid layout with a bunch of views
 */
define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine')
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var GridLayout    = require('famous/views/GridLayout');
  var EventHandler  = require('famous/core/EventHandler');
  var MouseSync     = require('famous/inputs/MouseSync');
  var TouchSync     = require('famous/inputs/TouchSync');
  var GenericSync   = require('famous/inputs/GenericSync');
  var Transitionable = require('famous/transitions/Transitionable');
  

  GenericSync.register({
    'touch': TouchSync
  });

  var sync = new GenericSync({
    "mouse"  : {},
    "touch"  : {},
    "scroll" : {scale : .5}
  });
   
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

    for(var i = 0; i < size; i++){
      // var x = getX(i);
      // var y = getY(i);
      surfaces.push(new Surface({
        content: '' + i,
        size: [undefined, undefined],
        properties: {
          color: 'black',
          backgroundColor: 'hsl(100, 100%, 50%)',
          textAlign: 'center',
          pointerEvents: 'none'
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

  function pieceView(){
    View.apply(this, arguments);
  }

  function BoardView() {
    View.apply(this, arguments);

    _createBackground.call(this);
    _createGrid.call(this, boardDimensions); 
    Engine.pipe(sync);

    sync.on('start', function(data){
      xStart = data.clientX;
      yStart = data.clientY;
    });

    sync.on('end', function(data){
      
      xEnd = data.clientX;
      yEnd = data.clientY;

      // swipe right
      if(xStart < xEnd && (xEnd - xStart > yEnd - yStart) && (xEnd - xStart > yStart - yEnd)){
        console.log('right');
        return 'right';
      }
      // swipe left
      if(xStart > xEnd && (xStart - xEnd > yEnd - yStart) && (xStart - xEnd > yStart - yEnd) ){
        console.log('left');
        return 'left';
      }
      // swipe down
      if(yStart < yEnd && (yEnd - yStart > xEnd - xStart) && (yEnd - yStart > xStart - xEnd)){
        console.log('down');
        return 'down';
      }
      // swipe up
      if(yStart > yEnd && (yStart - yEnd > xEnd - xStart) && (yStart - yEnd > xStart - xEnd) ){
        console.log('up');
        return 'up';
      }
    });
    
  }

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.DEFAULT_OPTIONS = {
  };

  module.exports = BoardView;
});
