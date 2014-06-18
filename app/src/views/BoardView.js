/* globals define */
 var xStart, yStart, xEnd, yEnd;  
 var boardDimensions = [5, 7];

define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine')
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var EventHandler  = require('famous/core/EventHandler');
  var MouseSync     = require('famous/inputs/MouseSync');
  var TouchSync     = require('famous/inputs/TouchSync');
  var GenericSync   = require('famous/inputs/GenericSync');
  var Transitionable = require('famous/transitions/Transitionable');
  var GridController = require('../GridController');

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
      size: [window.innerWidth, window.innerHeight],
      properties: {
        backgroundColor: 'black'
      }
    });

    this.add(bgSurface);
  }

  

  function BoardView() {
    View.apply(this, arguments);

    _createBackground.call(this);
    var viewSize = this.getSize();
    var gridController = new GridController(boardDimensions);

    var pieceSize = gridController.getPieceSize(viewSize);
    var piecePosition = gridController.getXYCoords(17, pieceSize[0]);
    console.log('piecePosition: ', piecePosition);

    var pieceModifier = new StateModifier({
      origin: [0,0],
      align: [0,0],
      size: pieceSize,
      transform: Transform.translate(piecePosition[0], piecePosition[1], 0)
    });


    var piece = new Surface({
      size: [pieceSize[0], pieceSize[1]],
      properties: {
        backgroundColor: 'blue'
      }
    });

    var node = this.add(pieceModifier);
    node.add(piece);


    // var piece = gridController.newPiece({
    //   width: pieceSize[0],
    //   height: pieceSize[1]
    // });
    // node.add(piece);




    Engine.pipe(sync);

    sync.on('start', function(data){ // add same color piece here
      xStart = data.clientX;
      yStart = data.clientY;
      console.log(xStart + ' ' + yStart);
    });

    sync.on('end', function(data){ // animate 
      xEnd = data.clientX;
      yEnd = data.clientY;
      var direction;

      // swipe right
      if(xStart < xEnd && (xEnd - xStart > yEnd - yStart) && (xEnd - xStart > yStart - yEnd)){
        console.log('right');
        direction = 'right';
      }
      // swipe left
      if(xStart > xEnd && (xStart - xEnd > yEnd - yStart) && (xStart - xEnd > yStart - yEnd) ){
        console.log('left');
        direction = 'left';
      }
      // swipe down
      if(yStart < yEnd && (yEnd - yStart > xEnd - xStart) && (yEnd - yStart > xStart - xEnd)){
        console.log('down');
        direction = 'down';
      }
      // swipe up
      if(yStart > yEnd && (yStart - yEnd > xEnd - xStart) && (yStart - yEnd > xStart - xEnd) ){
        console.log('up');
        direction = 'up';
      }
      // get piece to swipe based on direction
      var piece = gridController.newPiece({
        width: pieceSize[0],
        height: pieceSize[1],
        frontBgColor: 'green',
        backBgColor: 'red',
        direction: direction
      });
      console.log(piece);
      node.add(piece);
      piece.reflect();

    });

  }

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.DEFAULT_OPTIONS = {
  };

  module.exports = BoardView;
});
