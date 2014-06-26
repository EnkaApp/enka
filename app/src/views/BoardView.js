/* globals define */
define(function(require, exports, module) {

  var Engine         = require('famous/core/Engine');
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
  var BoardGenerator = require('./BoardGenerator');
  var OptionsManager = require('famous/core/OptionsManager');

  var xStart, yStart, xEnd, yEnd;

  GenericSync.register({
    'touch': TouchSync
  });

  var sync = new GenericSync({
    "mouse"  : {},
    "touch"  : {},
    // "scroll" : {scale : .5}
  });

  function _stateInit() {
    var length = this.options.rows * this.options.columns;
    
    this._state = [];
    for (var i = 0; i < length; i++) {
      this._state.push(null);
    }
  }

  function _getPieceAtIndex(index) {
    return this._state[index]._piece;
  }

  function _getModifierAtIndex(index) {
    return this._state[index]._modifier;
  }
   
  function BoardView(options) {
    View.apply(this, arguments);
    
    var turns = 0;

    // Setup the options manager
    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);

    this._currentIndex = this.options.startIndex;

    this.gridController = new GridController({
      columns: this.options.columns,
      rows: this.options.rows,
      viewWidth: this.options.viewWidth,
      viewHeight: this.options.viewHeight
    });

    this.pieceGenerator = new PieceGenerator({
      columns: this.options.columns,
      rows: this.options.rows,
      viewWidth: this.options.viewWidth,
      viewHeight: this.options.viewHeight
    });

    _createBackground.call(this);

    this.viewSize = this.getSize();

    // Initialize data structure to store the board state
    _stateInit.call(this);

    // sets piece size based off of view size
    this._pieceSize = this.gridController.getCellSize();

    // creates first Piece to put on board
    var firstPiece = this.pieceGenerator.getPiece();
    this.placePiece(firstPiece);

    this._state[this._currentIndex] = firstPiece;

    // this.bgSurface.pipe(sync);

    // sync.on('start', function(data){ 
    //   xStart = data.clientX;
    //   yStart = data.clientY;
    // });


    // sync.on('end', function(data){

    //   xEnd = data.clientX;
    //   yEnd = data.clientY;

    //   console.log('index: ', this._currentIndex);

      
    //   var direction = this.getSwipeDirection(xStart, yStart, xEnd, yEnd);
    //   // gets new index (2, 4, 15, etc) based off current index, swipe this.direction, and #of columns
    //   var index = this._currentIndex;
    //   var newIndex = this.getNewIndex(index, direction);
      

    //   if(direction){
    //     turns++;
    //     if(this.isInBounds(direction, this._currentIndex) && !this._state[newIndex]){  

    //       // generate new Piece
    //       // var lastColor = this._state[this._currentIndex].piece.getOption('backBgColor');
          
    //       var piece = null;
    //       this._currentIndex = newIndex;
          
    //       // this.pieceGenerator.placePiece.call(this, this.direction, position);

    //       var piece = this.pieceGenerator.getPiece(direction);
    //       this.placePiece(piece);

    //       console.log('upcoming pieces: ', this.pieceGenerator.colorQueue);

    //       // this._state[this._currentIndex] = {
    //       //   mod: pieceModifier,
    //       //   piece: piece
    //       // };
    //       this._state[this._currentIndex] = piece;

    //       piece._piece.reflect();

    //       // delete all legal matches. if no matches, check if we are trapped
    //       piece._piece.on('reflected', function(){
    //         this.deleteMatches.call(this, this._currentIndex);
    //         this.checkIfTrapped.call(this, this._currentIndex);
    //       }.bind(this));
            
    //       // position = this.gridController.getXYCoords(this._currentIndex, pieceSize[0]);
    //     }
    //   }
    // }.bind(this)); // <---- END SYNC.ON('END')

  }// <---- END BOARDVIEW FUNCTION ----------------------------------------



    // ADD METHODS
//-------------------------------------------------------------------------

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.prototype.placePiece = function(piece) {
    var pos = this._lastPiecePosition = this.gridController.getXYCoords(this._currentIndex, this._pieceSize[0]);
    
    console.info('Placing piece at', pos);
    
    piece._mod.setTransform(
      Transform.translate(pos[0], pos[1], 0)
    );

    this.add(piece);
  };

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
    
          if(matches[i][1] === true && !alreadyChecked[newIndexToCheck]){
            alreadyChecked[newIndexToCheck] = true;
            connections++;
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
  }; // end deleteMatches

  BoardView.prototype.checkIfAnyNeighborHasMatch = function(index) {
    var matches = [];
    directions = {
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
  };

  BoardView.prototype.checkIfDirectionHasMatch = function(index, direction){
    var isMatchAtIndex = [];
    var matchColor = this.getColorFromIndex(index);

    // check neighbor in specified this.direction for match
    var neighborIndex = this.getNewIndex(index, direction);

    // check if neighbor is null
    if(this._state[neighborIndex] && this.isInBounds(direction, index)){
      isMatch = this.getColorFromIndex(neighborIndex) === matchColor;
      isMatchAtIndex.push(neighborIndex, isMatch);
      return isMatchAtIndex;
    }else {
      isMatch = false;
      isMatchAtIndex.push(neighborIndex, isMatch);
      return isMatchAtIndex;
    }
  };

  BoardView.prototype.getColorFromIndex = function(index){
    if(this._state[index]){
      var color = _getPieceAtIndex.call(this, index).getOption('backBgColor');

      return color;
    }
  };

  BoardView.prototype.checkIfTrapped = function(index){
    var trueFlag = 0;
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
        canMove.push(this._state[indexToCheck] === null);
      }
    }

    for(var i = 0; i < canMove.length; i++){
      if(canMove[i]){
        trueFlag++;
      }
    }

    if(!trueFlag){
      console.log('Game Over');
    }
  };

  BoardView.prototype.isInBounds = function(direction){
    var viewPortSize = this.viewSize;
    var pieceSize = this._pieceSize;
    var boardHeight = this.options.rows * pieceSize[1];
    var yLowerBounds = boardHeight - pieceSize[0];

    if(direction === 'left' && this._lastPiecePosition[0] === 0){
      return false;
    }
    if(direction === 'right' && this._lastPiecePosition[0] === (viewPortSize[0] - pieceSize[0])){
      return false;
    }
    if(direction === 'up' && this._lastPiecePosition[1] === 0){
      return false;
    }
    if(direction === 'down' && this._lastPiecePosition[1] === yLowerBounds){
      return false;
    }

    return true;
  };

  BoardView.prototype.deletePiece = function(index){
    this.pieceGenerator.addDeletedPiece(this._state[index]);
    _getModifierAtIndex.call(this, index).setTransform(Transform.translate(2000, 2000, 0));
    this._state[index] = null;
  };

  BoardView.prototype.getNewIndex = function(index, direction){
    if(direction === 'left'){
      return index - 1;
    }
    if(direction === 'right'){
      return index + 1;
    }
    if(direction === 'up'){
      return index - this.options.columns;
    }
    if(direction === 'down'){
      return index + this.options.columns;
    }
  };

  BoardView.prototype.getSwipeDirection = function(xStart, yStart, xEnd, yEnd){
    var direction = '';

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

    return direction;
  };

  function _createBackground(){
    this.bgSurface = new Surface({
      properties: {
        backgroundColor: 'black'
      }
    });

    var mod = new StateModifier({
      size: this.gridController.getBoardSize(),
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.add(mod).add(this.bgSurface);
  }

  BoardView.DEFAULT_OPTIONS = {
    startIndex: 0,
    rows: 7,
    columns: 5,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight
  };

  module.exports = BoardView;
});
