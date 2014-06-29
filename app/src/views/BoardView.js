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
  var Timer          = require('famous/utilities/Timer');
  var OptionsManager = require('famous/core/OptionsManager');

  var PieceGenerator = require('PieceGenerator');

  // ## Controllers
  var GridController = require('controllers/GridController');
  var GameController = require('controllers/GameController');

  var xStart, yStart, xEnd, yEnd;


  GenericSync.register({
    'touch': TouchSync
  });

  var sync = new GenericSync({
    'mouse'  : {},
    'touch'  : {},
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
    return this._state[index]._mod;
  }

  function _setListeners() {
    // Pipe PieceGenerator events out
    this.pieceGenerator._eventOutput.pipe(this._eventOutput);

    // Setup swipe events
    // this.bgSurface.pipe(sync);
    this.backing.pipe(sync);

    sync.on('start', function(data) {
      xStart = data.clientX;
      yStart = data.clientY;
    });

    sync.on('end', function(data){
      xEnd = data.clientX;
      yEnd = data.clientY;
      // var wtf = 0;
      
      var direction = this.getSwipeDirection(xStart, yStart, xEnd, yEnd);
      
      // gets new index (2, 4, 15, etc) based off current index and swipe direction
      // console.log('currentIndex: ', newIndex);
      // console.log('lastIndex: ', this._currentIndex);
      // Checking direction prevents clicks from causing pieces to be placed
      if(direction){
        
        this._turns++;
        this._controller._eventInput.emit('game:turn++');

        this._turns++;
        // console.log('lastIndex: ', this._currentIndex);
        var newIndex = this.getNewIndex(this._currentIndex, direction);
        // console.log('newIndex: ', newIndex);
        if(this.isInBounds(direction) && !this._state[newIndex]) {
          // console.log('after swiping ' + direction + ' the new index is ' + newIndex)
          // generate new Piece
          var piece = this.pieceGenerator.getPiece(direction);
          this.placePiece(piece, newIndex);

          // console.log('upcoming pieces: ', this.pieceGenerator.colorQueue);
          
          this._state[newIndex] = piece;

          piece._piece.reflect();

          // delete all legal matches. if no matches, check if we are trapped
          var onReflected = function(){
            // wtf++;
            // if(wtf > 1) debugger;
            this.deleteMatches(newIndex);
            this.checkIfTrapped(newIndex);
          };
          Timer.setTimeout(onReflected.bind(this), 500);
          // ## eventing was sending multiple events per swipe
          // Timer.setTimeout is a workaround for this.

          // console.log('state after: ', this._state);
          // console.log('turns: ', this._turns);
          // console.log('turns: ', this._turns);

        }
      }
    }.bind(this)); // <---- END SYNC.ON('END')
  }
   
  function BoardView(options) {
    View.apply(this, arguments);
    
    this._turns = 0;

    this._controller = new GameController();

    // Setup the options manager
    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);

    this._currentIndex = this.options.startIndex;

    // this._model = new GameModel();
    this._controller = new GameController();

    this.gridController = new GridController({
      columns: this.options.columns,
      rows: this.options.rows,
      viewWidth: this.options.viewWidth,
      viewHeight: this.options.viewHeight
    });

    // sets piece size based off of view size
    this._pieceSize = this.gridController.getCellSize();

    this.pieceGenerator = new PieceGenerator({
      rows: this.options.rows,
      columns: this.options.columns,
      pieceSize: this._pieceSize
    });

    this.rootMod = new StateModifier({
      size: this.gridController.getBoardSize(),
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.node = this.add(this.rootMod);

    _createBackground.call(this);
    _createOverlay.call(this);

    this.viewSize = this.getSize();

    // Initialize data structure to store the board state
    _stateInit.call(this);

    // creates first Piece to put on board
    var firstPiece = this.pieceGenerator.getPiece();
    this.placePiece(firstPiece, this._currentIndex);

    this._state[this._currentIndex] = firstPiece;

    _setListeners.call(this);

  }// <---- END BOARDVIEW FUNCTION ----------------------------------------

  BoardView.DEFAULT_OPTIONS = {
    startIndex: 12,
    rows: 8,
    columns: 3,
    viewWidth: window.innerWidth,
    viewHeight: window.innerHeight
  };

  // ADD METHODS
  //-------------------------------------------------------------------------

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  /*
   * Updates BoardView from current Stage Configurations
   */
  BoardView.prototype.update = function() {
    this.setOptions({
      rows: this._controller.getRows(),
      cols: this._controller.getCols(),
      startIndex: this._controller.getStartIndex()
    });

    // reset and rebuild the board

    // place the first piece
  };

  BoardView.prototype.placePiece = function(piece, newIndex) {
    var pos = this.gridController.getXYCoords(this._currentIndex);
    
    console.info('Placing piece at', this._lastPiecePosition);
    
    piece._mod.setTransform(
      Transform.translate(pos[0], pos[1], 0)
    );

    // Update the current index to the index of the piece we just placed
    // and save the newly placed piece to the board state
    this._currentIndex = newIndex;
    this._lastPiecePosition = this.gridController.getXYCoords(newIndex);
    console.log('after adding piece: ');
    console.log('this._currentIndex: ', this._currentIndex);
    console.log('this._lastPiecePosition', this._lastPiecePosition);
    console.log('piece placed: ', piece);
    this.node.add(piece);
  };

  BoardView.prototype.deleteMatches = function(index){
    console.log('\ninside deleteMatches');
    var matched = [];
    var connections = 0;
    var initialIndex = index;
    console.log('initialIndex: ', initialIndex);

    matched[index] = true;
    seekAndDestroy.call(this, index);

    function seekAndDestroy(index) {
      var matches = this.checkIfAnyNeighborHasMatch(index);
      // console.log('The following indices have matches: ', matches);

      for(var i = 0; i < matches.length; i++){
        // matches has matches of all neighbors
        if(matches[i]){
          var newIndexToCheck = matches[i][0];
          if(matches[i][1] === true && !matched[newIndexToCheck]){
            matched[newIndexToCheck] = true;
            // console.log('matched for deletion: ', matched)
            connections++;
            // console.log('connections: ', connections);
            seekAndDestroy.call(this, newIndexToCheck);
          }
        }
      }
    }
    if(connections > 1){

      for(var i = 0; i < matched.length; i++){
        if(matched[i] && i !== initialIndex){
          // console.log('deleting ', i);
          this.deletePiece(i);
        }
      }
    }
  }; // end deleteMatches

  BoardView.prototype.checkIfAnyNeighborHasMatch = function(index) {
    var matches = [];
    var directions = {
      left: this.checkIfDirectionHasMatch(index, 'left'),
      right: this.checkIfDirectionHasMatch(index, 'right'),
      up: this.checkIfDirectionHasMatch(index, 'up'),
      down: this.checkIfDirectionHasMatch(index, 'down')
    };
    // console.log('checking if any neighbor has match: ');
    // console.log('starts with 4 checks for neighbor is in bounds...');
    // console.log('-----------------------------------');
    for(var direction in directions){
      if(this.isInBounds(direction)){
        if(directions[direction])
          matches.push(directions[direction]);
      }
    }

    return matches;
  };

  BoardView.prototype.checkIfDirectionHasMatch = function(index, direction){
    var isMatchAtIndex = [];
    var matchColor = this.getColorFromIndex(index); // color to match to
    // check neighbor in specified this.direction for matches
    var neighborIndex = this.getNewIndex(index, direction);

    // check if neighbor is null
    // if(this._state[neighborIndex] && this.isInBounds(direction)){
    var inBounds  = this.isInBounds(direction, index);
    var neighborExists = this._state[neighborIndex];
    console.log();
    if (neighborExists && inBounds ) {
      var neighborColor = this.getColorFromIndex(neighborIndex);
      // console.log('i am index ' + index + ' and i am checking my neighbor at index ' + neighborIndex);
      // console.log('attempting to match my color ' + matchColor + ' with neighbor color ' + neighborColor);
      isMatch = neighborColor === matchColor;
      isMatchAtIndex.push(neighborIndex, isMatch);
      return isMatchAtIndex;
    } else {

      isMatch = false;
      isMatchAtIndex.push(neighborIndex, isMatch);

      return isMatchAtIndex;
    }
  };

  BoardView.prototype.getColorFromIndex = function(index) {
    if(this._state[index]){
      var color = _getPieceAtIndex.call(this, index).getOption('backBgColor');
      return color;
    }
  };

  BoardView.prototype.checkIfTrapped = function(index){
    var trueFlag = 0;
    var canMove = [];
    // console.log('checkingIfTrapped: ');
    // console.log('-----------------------------------');

    var directions = {
      left: this.isInBounds('left'),
      right: this.isInBounds('right'),
      up: this.isInBounds('up'),
      down: this.isInBounds('down')
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
      // debugger;
      console.log('Game Over');
    }
  };

  BoardView.prototype.isInBounds = function(direction, index) {
    var newIndexCoords;

    if(!index) {
      newIndexCoords = this._lastPiecePosition;
    }else{
      newIndexCoords = this.gridController.getXYCoords(index);
    }

    var res = true;
    var viewPortSize = this.viewSize;
    var pieceSize = this._pieceSize;
    var boardWidth = this.options.columns * pieceSize[0];
    var boardHeight = this.options.rows * pieceSize[1];
    var newXPosition = newIndexCoords[0] + pieceSize[0];
    var newYPosition = newIndexCoords[1] + pieceSize[1];

    if(direction === 'left' && newIndexCoords[0] === 0){
      res = false;
    // console.log('left is out of bounds: ');

    }
    if(direction === 'right' && newXPosition === boardWidth){
      res = false;
    // console.log('right is out of bounds: ');

    }
    if(direction === 'up' && newIndexCoords[1] === 0){
      res = false;
    // console.log('up is out of bounds : ');

    }
    if(direction === 'down' && newYPosition === boardHeight){
      res = false;
    // console.log('down is out of bounds: ', res);

    }
    // console.log('\nisInBounds info: ');
    // console.log('position being checked: (just moved from) ', this._lastPiecePosition);
    // console.log('direction checked: ', direction);
    // console.log('right position checked: (newXPosition) ', newXPosition);
    // console.log('down position checked: (newYPosition) ', newYPosition);
    // console.log('left check: this._lastPiecePosition[0] === ', 0);
    // console.log('up check: this._lastPiecePosition[1] === ', 0);
    // console.log('right check: newXPosition === ', boardWidth);
    // console.log('down check: newYposition === ', boardHeight);
    // console.log('direction ' + direction +  ' is in bounds? ', res);
    // console.log('\n');
    return res;
  };

  BoardView.prototype.deletePiece = function(index) {
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

  BoardView.prototype.show = function() {
    this.dimmer.setOpacity(0.001, {
      curve: 'linear',
      duration: 300
    }, function() {
      this.dimmer.setTransform(Transform.translate(0, 0, -10));
    }.bind(this));
  };

  BoardView.prototype.dim = function() {
    this.dimmer.setTransform(Transform.translate(0, 0, 5));
    this.dimmer.setOpacity(0.7, {
      curve: 'linear',
      duration: 300
    });
  };

  // ## Private Helpers

  function _createOverlay() {
    this.overlay = new Surface({
      properties: {
        backgroundColor: '#e5e5e5'
      }
    });

    this.dimmer = new StateModifier({
      opacity: 0.001,
      transform: Transform.translate(0, 0, -10)
    });

    this.add(this.dimmer).add(this.overlay);
  }

  function _createBackground() {
    this.backing = new Surface({
      properties: {
        classes: ['gameboard-backing'],
        backgroundColor: '#f5f5f5',
      }
    });

    this.boardSurface = new Surface({
      properties: {
        classes: ['gameboard'],
        backgroundColor: 'white',
        pointerEvents: 'none'
      }
    });

    this.add(this.backing);
    this.node.add(this.boardSurface);
  }

  module.exports = BoardView;
});
