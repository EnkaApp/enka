/* globals define */
define(function(require, exports, module) {

  var Engine         = require('famous/core/Engine')
  var View           = require('famous/core/View');
  var Surface        = require('famous/core/Surface');
  var Transform      = require('famous/core/Transform');
  var StateModifier  = require('famous/modifiers/StateModifier');
  var EventHandler   = require('famous/core/EventHandler');
  var MouseSync      = require('famous/inputs/MouseSync');
  var TouchSync      = require('famous/inputs/TouchSync');
  var GenericSync    = require('famous/inputs/GenericSync');
  var Transitionable = require('famous/transitions/Transitionable');
  var GridController = require('../GridController');
  var PieceGenerator = require('../PieceGenerator');

  
  var xStart, yStart, xEnd, yEnd;

  GenericSync.register({
    'touch': TouchSync
  });

  var sync = new GenericSync({
    "mouse"  : {},
    "touch"  : {},
    // "scroll" : {scale : .5}
  });
   
  function _createBackground() {
    this.bgSurface = new Surface({
      size: [window.innerWidth, window.innerHeight],
      properties: {
        backgroundColor: 'black'
      }
    });

    this.add(this.bgSurface);
  }

  

  function BoardView() {

        // INITIAL SETUP
// ----------------------------------------------------------------------
    View.apply(this, arguments);
    // initializes colorQueue
    var pieceGenerator = new PieceGenerator();
    var flag = 0;

    //store columns and rows
    this.columns = this.options.dimensions[0];
    this.rows = this.options.dimensions[1];


    // index variables;
    // currentIndex starts at center
    var currentIndex = this.getCenterIndex();
    // console.log('startIndex (center): ', this.getCenterIndex())
    // var previousIndex;  (not in use)
    var nextIndex;

    // creates blackBackground
    _createBackground.call(this);

    // size of viewport
    this.viewSize = this.getSize();
    // console.log('viewPortSize: ', this.viewSize);

    //creates array of state, set to null
    //gives us access to this.gridControllerMethods
    this.gridController = new GridController({
      columns: this.columns,
      rows: this.rows,
      viewWidth: this.viewSize[0],
      viewHeight: this.viewSize[1]
    });

    this.state = this.gridController._state;






    // SETUP BOARD WITH FIRST PIECE IN CENTER
// ----------------------------------------------------------------------

    // sets piece size based off of view size
    var pieceSize = this.gridController.getPieceSize(this.viewSize);
    // console.log('pieceSize: ', pieceSize);

    // determines coordinates of piece on grid relative to (0, 0)
    // based on index and pieceSize
    var piecePosition = this.gridController.getXYCoords(currentIndex);

    // responsible for placing piece at center (after attaching piece)
    var centerModifier = new StateModifier({
      origin: [0,0],
      align: [0,0],
      size: pieceSize,
      transform: Transform.translate(piecePosition[0], piecePosition[1], 0)
    });

    // attach modifier to board
    var centerNode = this.add(centerModifier);

    // creates first Piece to put on board
    var centerPiece = pieceGenerator.createNewPiece(pieceSize[0]);
    
    // attach piece to centerModifier to drop piece in middle
    centerNode.add(centerPiece);
    this.state[currentIndex] = centerNode;

    // Engine.pipe(sync);
    this.bgSurface.pipe(sync);







        // EVENT LISTENERS
// ----------------------------------------------------------------------



    // BEGIN SYNC.ON(START)
// ----------------------------------------------------------------------

    sync.on('start', function(data){ // add same color piece here
      xStart = data.clientX;
      yStart = data.clientY;
    });
    // END SYNC.ON(START)
// ----------------------------------------------------------------------









// TEMP - toggle changes the color so the animation looks right
// var toggle = false;

    // BEGIN SYNC.ON(END)
// ----------------------------------------------------------------------
    sync.on('end', function(data){ // animate 
      xEnd = data.clientX;
      yEnd = data.clientY;
      var direction;

      











      // GET SWIPE DIRECTION
// ----------------------------------------------------------------------

      // swipe right
      if(xStart < xEnd && (xEnd - xStart > yEnd - yStart) && (xEnd - xStart > yStart - yEnd)){
        direction = 'right';
      }
      // swipe left
      if(xStart > xEnd && (xStart - xEnd > yEnd - yStart) && (xStart - xEnd > yStart - yEnd) ){
        direction = 'left';
      }
      // swipe down
      if(yStart < yEnd && (yEnd - yStart > xEnd - xStart) && (yEnd - yStart > xStart - xEnd)){
        direction = 'down';
      }
      // swipe up
      if(yStart > yEnd && (yStart - yEnd > xEnd - xStart) && (yStart - yEnd > xStart - xEnd) ){
        direction = 'up';
      }
// ----------------------------------------------------------------------
//      END GET SWIPE DIRECTION











      // gets new index (2, 4, 15, etc) based off current index, swipe direction, and #of columns
      var newIndex = this.getNewIndex(currentIndex, direction, this.columns);
      console.log('currentIndex: ', currentIndex);
      console.log('newIndex: ', newIndex);

      // if the newIndex does not have a piece already on it and it is in bounds
      // then we can add a new piece
      if(this.isInBounds(direction, currentIndex) && !this.state[newIndex]){
        flag++;
        if(flag === 3){
          this.deletePiece(17);
        }
        var lastColor = this.state[currentIndex]._child._object.back.properties.backgroundColor;
        
        
        var piece = pieceGenerator.createNewPiece(pieceSize[0], lastColor, direction);

        // console.log('newIndex: ', newIndex);
        // this.getColorFromIndex(currentIndex);
        currentIndex = newIndex;
        

        var pieceModifier = new StateModifier({
          origin: [0,0],
          align: [0,0],
          size: pieceSize,
          transform: Transform.translate(piecePosition[0], piecePosition[1], 0)
        });

        var node = this.add(pieceModifier)
        
        this.state[currentIndex] = node;
        node.add(piece);
        piece.reflect();

        piecePosition = this.gridController.getXYCoords(currentIndex, pieceSize[0]);

        this.checkIfHasMatch.call(this, newIndex, piece);
        console.log(this.state);
      }
      



    }.bind(this)); // <---- END SYNC.ON('END')********************************************

  }// <---- END BOARDVIEW FUNCTION
// *********************************************************************************











    // ADD METHODS
//-------------------------------------------------------------------------

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.prototype.getCenterIndex = function(){
    var length = this.options.dimensions[0] * this.options.dimensions[1];
    return (length - 1) / 2;
  }

  BoardView.prototype.checkIfHasMatch = function(index){
    // get the current index we would like to check neighbors for

    // perform check to see if this is the first node we placed (edge case)
    // console.log('child: ', this.state[index]._child);
    if(this.state[index].child === null){
      // is not edge case if inside this block
      // get color
    }


    // get color of piece located at this index
    // console.log(this.state[index]);
  }

  // BoardView.prototype.getColorFromIndex = function(index){
  //   console.log('index: ', index);
  //   // if not edge case
  //   console.log(this.state[index]);
  //   var color = this.state[index]._object.back.properties.backgroundColor;
  //   console.log('color: ', color);

  // }

  BoardView.prototype.checkIfTrapped = function(index){
    // check surrounding indices for either !null or false


  }

  BoardView.prototype.isInBounds = function(direction, currentIndex){
    var viewPortSize = this.viewSize;
    var cellSize = this.gridController.getPieceSize(viewPortSize);

    piecePosition = this.gridController.getXYCoords(currentIndex)
    var boardHeight = this.rows * cellSize[1];
    var yLowerBounds = boardHeight - cellSize[0];

    if(direction === 'left' && piecePosition[0] === 0){
      console.log('false');
      return false
    }
      
    if(direction === 'right' && piecePosition[0] === (viewPortSize[0] - cellSize[0])){
      console.log('false');
      return false
    }
      
    if(direction === 'up' && piecePosition[1] === 0){
      console.log('false');
      return false
    }
    if(direction === 'down' && piecePosition[1] === yLowerBounds){
      console.log('false');
      return false
    }
    return true;
  }

  BoardView.prototype.deletePiece = function(index){
    // this.state[index]._object._opacityState.state = .01

    this.state[index]._object._transformState.translate.state = [100, 100, 0];
    var centerMod = new StateModifier({
      origin: [0,0],
      align: [0,0],
      size: [64, 64],
      transform: Transform.translate(100, 100, 0)
    });
    this.state[index].set(centerMod)
  }

  BoardView.prototype.getNewIndex = function(currentIndex, direction){
    if(direction === 'left'){
      return currentIndex - 1;
    }
    if(direction === 'right'){
      return currentIndex + 1;
    }
    if(direction === 'up'){
      return currentIndex - this.columns;
    }
    if(direction === 'down'){
      return currentIndex + this.columns;
    }
  }

// ADD DEFAULT OPTIONS TO BOARVIEW AND AND BOARDVIEW TO EXPORTS
//-------------------------------------------------------------------------


  BoardView.DEFAULT_OPTIONS = {
    dimensions: [5, 7]
  };

  module.exports = BoardView;
});
