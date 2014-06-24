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
  var Timer          = require('famous/utilities/Timer');

  
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
    View.apply(this, arguments);
    // initializes colorQueue
    var pieceGenerator = new PieceGenerator();
    var flag = 0;


    //store columns and rows
    this.columns = this.options.dimensions[0];
    this.rows = this.options.dimensions[1];
    this.deletedPieces = [];


    // index variables;
    // currentIndex starts at center
    var currentIndex = this.getCenterIndex();
    var nextIndex;

    // creates blackBackground
    _createBackground.call(this);

    // size of viewport
    this.viewSize = this.getSize();

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
    this.state[currentIndex] = {
          mod: centerModifier,
          piece: centerPiece
        };
    // this.state[currentIndex] = centerNode;

    this.bgSurface.pipe(sync);

    sync.on('start', function(data){ // add same color piece here
      xStart = data.clientX;
      yStart = data.clientY;
    });

    sync.on('end', function(data){ // animate 
      xEnd = data.clientX;
      yEnd = data.clientY;
      var direction;

      // GET SWIPE DIRECTION
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
      // END GET SWIPE DIRECTION

      // gets new index (2, 4, 15, etc) based off current index, swipe direction, and #of columns
      var newIndex = this.getNewIndex(currentIndex, direction, this.columns);

      // if the newIndex does not have a piece already on it and it is in bounds
      // then we can add a new piece
      console.log(pieceGenerator.colorQueue);

      if(this.isInBounds(direction, currentIndex) && !this.state[newIndex]){    
     
        var lastColor = this.state[currentIndex].piece.getOption('backBgColor');
        
        var piece = null;
        currentIndex = newIndex;
        
        // create modifier
        if(this.deletedPieces.length === 0){
          piece = pieceGenerator.createNewPiece(pieceSize[0], lastColor, direction, true);
          console.log('piece: ', piece);

          var pieceModifier = new StateModifier({
            origin: [0,0],
            align: [0,0],
            size: pieceSize,
            transform: Transform.translate(piecePosition[0], piecePosition[1], 0)
          });

          // add piece to modifier and modifier to BoardView, then reflect()
         this.add(pieceModifier).add(piece);
          // this.state[currentIndex] = node;
        }else{
          console.log('sorry, you must reuse a piece');
          console.log('pieces to use', this.deletedPieces.length);
        
          var pieceObject = this.deletedPieces.pop();

          console.log('pieces remaining to use', this.deletedPieces.length);

          console.log('piece: ', pieceObject.piece);
          var pieceModifier = pieceObject.mod;
          console.log('pieceModifier: ', pieceModifier)
          var color = pieceGenerator.colorQueue.shift();
          
          piece = pieceObject.piece;
          piece.updateOptions({
            direction: direction,
            frontBgColor: lastColor,
            backBgColor: color
          });

          pieceGenerator.addColorToQueue();

          pieceModifier.setTransform(Transform.translate(piecePosition[0], piecePosition[1], 0));

          console.log('pieceAfter: ', piece);
        }

        this.state[currentIndex] = {
          mod: pieceModifier,
          piece: piece
        };

        piece.reflect();

        // delete all legal matches. if no matches, check if we are trapped
        piece.on('reflected', function(){
          this.deleteMatches.call(this, currentIndex);
          this.checkIfTrapped.call(this, currentIndex);
        }.bind(this));
          

        piecePosition = this.gridController.getXYCoords(currentIndex, pieceSize[0]);

      }
    }.bind(this)); // <---- END SYNC.ON('END')

  }// <---- END BOARDVIEW FUNCTION ----------------------------------------



    // ADD METHODS
//-------------------------------------------------------------------------

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.prototype.getCenterIndex = function(){
    var length = this.options.dimensions[0] * this.options.dimensions[1];
    return (length - 1) / 2;
  }

  BoardView.prototype.deleteMatches = function(index){
    var alreadyChecked = [];
    var connections = 0;
    var initialIndex = index;
    alreadyChecked[index] = true; 

    seekAndDestroy.call(this, index);

    function seekAndDestroy(index){
      var matches = this.checkIfAnyNeighborHasMatch(index);
      for(var i = 0; i < matches.length; i++){
        if(matches[i]){
          var newIndexToCheck = matches[i][0];
          // console.log(matches[i]);
          if(matches[i][1] === true && !alreadyChecked[newIndexToCheck]){
            alreadyChecked[newIndexToCheck] = true;
            connections++;
            // positionsToCheck.push(newIndexToCheck);
            seekAndDestroy.call(this, newIndexToCheck);
          }  
        }
      }
    } 

    if(connections > 1){
      for(var i = 0; i < alreadyChecked.length; i++){
        if(alreadyChecked[i] && i !== initialIndex){
          this.deletePiece(i);
        }
      }
    }
  } // end deleteMatches

  BoardView.prototype.checkIfAnyNeighborHasMatch = function(index) {
    var matches = [];
    var directions = {
      left : this.checkIfDirectionHasMatch(index, 'left'),
      right : this.checkIfDirectionHasMatch(index, 'right'),
      up : this.checkIfDirectionHasMatch(index, 'up'),
      down : this.checkIfDirectionHasMatch(index, 'down')
    };
    for(var direction in directions){
      if(this.isInBounds(index, direction)){
        matches.push(directions[direction]); 
      }
    }
    return matches;
  }

  BoardView.prototype.checkIfDirectionHasMatch = function(index, direction){
    var isMatchAtIndex = [];
    var matchColor = this.getColorFromIndex(index);

    // check neighbor in specified direction for match
    var neighborIndex = this.getNewIndex(index, direction);
    // check if neighbor is null
    if(this.state[neighborIndex] && this.isInBounds(direction, index)){
      isMatch = this.getColorFromIndex(neighborIndex) === matchColor
      isMatchAtIndex.push(neighborIndex, isMatch)
      return isMatchAtIndex;
    }else {
      isMatch = false;
      isMatchAtIndex.push(neighborIndex, isMatch)
      return isMatchAtIndex;
    }
  }

  BoardView.prototype.getColorFromIndex = function(index){
    if(this.state[index]){
      // console.log('this.state[index]: ', this.state[index]);
      var color = this.state[index].piece.getOption('backBgColor');
      return color;
    }
  }

  BoardView.prototype.checkIfTrapped = function(index){
    var canMove = [];
    var directions = {
      left : this.isInBounds('left', index),
      right : this.isInBounds('right', index),
      up : this.isInBounds('up', index),
      down : this.isInBounds('down', index)
    };
    for(var direction in directions){
      var indexToCheck = this.getNewIndex(index, direction);
      if(directions[direction]){
        canMove.push(this.state[indexToCheck] === null);
      }
    }

    var trueFlag = 0;
    for(var i = 0; i < canMove.length; i++){
      if(canMove[i]){
        trueFlag++;
      }
    }
    if(!trueFlag){
      console.log('Game Over');
    }
  }

  BoardView.prototype.isInBounds = function(direction, currentIndex){
    var viewPortSize = this.viewSize;
    var cellSize = this.gridController.getPieceSize(viewPortSize);

    piecePosition = this.gridController.getXYCoords(currentIndex)
    var boardHeight = this.rows * cellSize[1];
    var yLowerBounds = boardHeight - cellSize[0];

    if(direction === 'left' && piecePosition[0] === 0){
      return false
    }
    if(direction === 'right' && piecePosition[0] === (viewPortSize[0] - cellSize[0])){
      return false
    } 
    if(direction === 'up' && piecePosition[1] === 0){
      return false
    }
    if(direction === 'down' && piecePosition[1] === yLowerBounds){
      return false
    }
    return true;
  }

  BoardView.prototype.deletePiece = function(index){
    this.deletedPieces.push(this.state[index]);
    this.state[index].mod.setTransform(Transform.translate(2000, 2000, 0));
    this.state[index] = null;
    console.log('add deletedPieces: ', this.deletedPieces.length);
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
