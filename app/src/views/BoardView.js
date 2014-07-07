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

  // ## Controllers
  var GridController = require('controllers/GridController');
  var GameController = require('controllers/GameController');
  var PieceController = require('controllers/PieceController');

  // ## Shared Variables
  var lastPiece = null;

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
    var xStart, yStart, xEnd, yEnd;

    // Win Event
    this._controller.on('game:won', function() {
      _clearBoard.call(this, false, false, function() {
        this._eventOutput.emit('game:won', {
          piece: lastPiece
        });
      }.bind(this));
    }.bind(this));

    // Lose Event
    this._controller.on('game:lost', function() {
      this._eventOutput.emit('game:lost', {
        piece: lastPiece,
      });
    }.bind(this));

    this._controller.on('game:reset', function() {
      _clearBoard.call(this, true, true);
    }.bind(this));

    // Pipe PieceController events out
    this._pieceGenerator._eventOutput.pipe(this._eventOutput);

    // Setup swipe events
    this.backing.pipe(sync);

    sync.on('start', function(data) {
      xStart = data.clientX;
      yStart = data.clientY;
    });

    sync.on('end', function(data){
      xEnd = data.clientX;
      yEnd = data.clientY;
      
      var direction = _getSwipeDirection.call(this, xStart, yStart, xEnd, yEnd);
      
      if (direction) {
        
        this._turns++;
        this._controller.addTurn();
        
        // gets new index (2, 4, 15, etc) based off current index and swipe direction  
        var newIndex = _getNewIndex.call(this, this._currentIndex, direction);
        
        if(this.isInBounds(direction) && !this._state[newIndex]) {
          
          // generate new Piece
          var piece = this._pieceGenerator.getPiece(direction);
          this.placePiece(piece, newIndex);
          
          this._state[newIndex] = piece;

          piece._piece.reflect();

          // delete all legal matches. if no matches, check if we are trapped
          var onReflected = function(){

            // We need to check if the piece is trapped after deleteMatches has
            // executed otherwise it will mistakingly check pieces that are in queue
            // to be deleted but have not yet been deleted
            this.deleteMatches(newIndex, function() {
              _checkIfTrapped.call(this, newIndex);

              // Display the possible moves for the next piece
              var colorClass = this._pieceGenerator.getNextColorFromQueue(false);
              _showPossibleMoves.call(this, this._currentIndex, colorClass);

            }.bind(this));
          };

          // @NOTE 
          // Previously the piece.on('reflected') event was being used to trigger
          // the onReflected function; however this was causing problems because the
          // 'reflected' event was being emitted multiple times instead of the expected
          // one time. Timer.setTimeout is a workaround for this.
          //
          // @TODO Figure out what is wrong with the piece.on('reflected') event
          Timer.setTimeout(onReflected.bind(this), 500);
        }
      }
    }.bind(this)); // <---- END SYNC.ON('END')
  }

  /*
   * Initializes the board.
   * This should be executed each time the board options change
   */
  function _init() {
    this._turns = 0;

    this._currentIndex = this.options.startIndex;

    this._gridController.setOptions({
      columns: this.options.columns,
      rows: this.options.rows,
      viewWidth: this.options.viewWidth,
      viewHeight: this.options.viewHeight
    });

    // sets piece size based off of view size
    this._pieceSize = this._gridController.getCellSize();

    // Adjust the board background pattern
    this.boardSurface.setProperties({
      backgroundSize: (this._pieceSize[0] * 2) + 'px ' + (this._pieceSize[1] * 2) + 'px'
    });

    // create the surfaces used to highlight the players next move
    _createPositionHighlights.call(this, this._pieceSize);

    // The pieceGenerator is a singleton instance and is created by 
    // the header first so we need to explicitly set the options
    // otherwise the piece size and other calculations will be wrong
    this._pieceGenerator = new PieceController();
    this._pieceGenerator.setOptions({
      rows: this.options.rows,
      columns: this.options.columns,
      pieceSize: this._pieceSize
    });

    // Make sure pieceGenerator is reset
    this._pieceGenerator.resetLastColor();

    this.rootMod.setSize(this._gridController.getBoardSize());

    // Initialize data structure to store the board state
    _stateInit.call(this);

    // creates first Piece to put on board
    var firstPiece = this._pieceGenerator.getPiece();
    this.placePiece(firstPiece, this._currentIndex);

    // Display the possible moves for the next piece
    var colorClass = this._pieceGenerator.getNextColorFromQueue(false);
    _showPossibleMoves.call(this, this._currentIndex, colorClass);

    this._state[this._currentIndex] = firstPiece;
  }
   
  function BoardView() {
    View.apply(this, arguments);

    this._controller = new GameController();
    this._gridController = new GridController();

    this.rootMod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.translate(0, 0, 1)
    });

    this.node = this.add(this.rootMod);

    _createBacking.call(this);
    _createOverlay.call(this);

    _init.call(this);

    _setListeners.call(this);

  }// <---- END BOARDVIEW FUNCTION ----------------------------------------

  BoardView.DEFAULT_OPTIONS = {
    startIndex: 12,
    rows: 8,
    columns: 5,
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
      columns: this._controller.getCols(),
      startIndex: this._controller.getStartIndex()
    });

    // clear the board
    this.clear();

    // reinitialize the board
    _init.call(this);
  };

  BoardView.prototype.clear = function() {
    for (var i = this._state.length - 1; i >= 0; i--) {
      var piece = this._state[i];
      if (piece) {
        this.deletePiece(i, true);
      }
    }
  };

  BoardView.prototype.placePiece = function(piece, newIndex) {
    var pos = this._gridController.getXYCoordsFromIndex(this._currentIndex);
    
    piece._mod.setTransform(
      Transform.translate(pos[0], pos[1], 180)
    );

    // Update the current index to the index of the piece we just placed
    // and save the newly placed piece to the board state
    this._currentIndex = newIndex;
    this._lastPiecePosition = this._gridController.getXYCoordsFromIndex(newIndex);
    this.node.add(piece);

    lastPiece = piece;
  };

  BoardView.prototype.deleteMatches = function(index, callback){
    var matched = [];
    var connections = 0;
    var initialIndex = index;

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
            connections++;
            seekAndDestroy.call(this, newIndexToCheck);
          }
        }
      }
    }

    if(connections > 1){
      var pieces = [];
      for(var i = 0; i < matched.length; i++){
        if(matched[i] && i !== initialIndex){
          pieces.push(i);
        }
      }

      this.deletePieces(pieces, false, function() {
        this._controller.doWinCheck();
        if (callback) callback();
      });
    } else {
      if (callback) callback();
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

    for(var direction in directions){
      // starts with 4 checks to see if the neighbor position is in bounds
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
    var neighborIndex = _getNewIndex.call(this, index, direction);

    var inBounds  = this.isInBounds(direction, index);
    var neighborExists = this._state[neighborIndex];
    
    if (neighborExists && inBounds ) {
      var neighborColor = this.getColorFromIndex(neighborIndex);
      
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

  BoardView.prototype.isInBounds = function(direction, index) {
    var newIndexCoords;

    if(!index) {
      newIndexCoords = this._lastPiecePosition;
    }else{
      newIndexCoords = this._gridController.getXYCoordsFromIndex(index);
    }

    var res = true;
    var pieceSize = this._pieceSize;
    var boardWidth = this.options.columns * pieceSize[0];
    var boardHeight = this.options.rows * pieceSize[1];
    var newXPosition = newIndexCoords[0] + pieceSize[0];
    var newYPosition = newIndexCoords[1] + pieceSize[1];

    if(direction === 'left' && newIndexCoords[0] === 0){
      res = false;
    }

    if(direction === 'right' && newXPosition === boardWidth){
      res = false;
    }

    if(direction === 'up' && newIndexCoords[1] === 0){
      res = false;
    }

    if(direction === 'down' && newYPosition === boardHeight){
      res = false;
    }

    return res;
  };

  BoardView.prototype.deletePieces = function(pieces, clearing, callback) {

    for (var i = pieces.length - 1; i >= 0; i--) {
      var index = pieces[i];
      Timer.setTimeout(this.deletePiece.bind(this, index, clearing), 100 * i);
    }

    // What until after all pieces have been cleared to firest the callback
    if (callback) {
      Timer.setTimeout(function() {
        callback.call(this);
      }.bind(this), pieces.length * 100);
    }
  };

  BoardView.prototype.deletePiece = function(index, clearing) {

    if (!clearing) {
      this._controller.addDestroyed();
    }

    this._pieceGenerator.addDeletedPiece(this._state[index]);

    var mod = _getModifierAtIndex.call(this, index);
    
    var callback = function() {
      mod.setTransform(Transform.translate(2000, 2000, 0));
      mod.setOpacity(0.999);
    };

    mod.setOpacity(0.001, {
      curve: 'easeOut',
      duration: 500
    }, callback);

    this._state[index] = null;
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
    this.dimmer.setTransform(Transform.translate(0, 0, 200));
    this.dimmer.setOpacity(0.7, {
      curve: 'linear',
      duration: 300
    });
  };

  // ## View/Surface Constructors

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

  function _createBacking() {
    this.backing = new Surface({
      classes: ['gameboard-backing'],
    });

    this.boardSurface = new Surface({
      classes: ['gameboard', 'gameboard-board'],
      properties: {
        pointerEvents: 'none',
        zIndex: 5
      }
    });

    var backingMod = new StateModifier({
      transform: Transform.translate(0, 0, 170)
    });

    var boardMod = new StateModifier({
      transform: Transform.translate(0, 0, 175)
    });

    this.add(backingMod).add(this.backing);
    this.node.add(boardMod).add(this.boardSurface);
  }

  /*
   * Surfaces overlaid over the board where moves can be made.
   * These are to be reused after each piece is placed.
   */
  function _createPositionHighlights(size) {
    var surface, surfaces;

    if (this._highlights && this._highlights.length) surfaces = this._highlights;
    else surfaces = [];

    // create surfaces if they have not been created yet
    if (!surfaces.length) {
      for (var i = 4; i >= 1; i--) {
        surface = new Surface({
          properties: {
            pointerEvents: 'none'
          }
        });

        var mod = new StateModifier({
          origin: [0, 0],
          align: [0, 0],
          opacity: 0.3,
          transform: Transform.translate(0, 0, 180)
        });

        var scaleMod = new StateModifier({
          origin: [0.5, 0.5],
          align: [0.5, 0.5]
        });

        // save for later reference
        surface._mod = mod;
        surface._scaleMod = scaleMod;
        surfaces.push(surface);

        // Add to the board
        this.node.add(surface._mod).add(surface._scaleMod).add(surface);
      }
    }
    
    for (var j = surfaces.length - 1; j >= 0; j--) {
      surface = surfaces[j];
      surface._mod.setSize(size);
      surface._scaleMod.setSize(size);
    }

    // Save the surfaces
    this._highlights = surfaces;
  }

  // ## Private Helpers

  function _clearBoard(removeLastPiece, initialize, callback) {

    removeLastPiece = removeLastPiece || false;
    initialize = initialize || false;

    // Delete all pieces except the winner
    var pieces = [];
    var lastPieceIndex;

    for (var i = 0; i < this._state.length; i++) {
      var piece = this._state[i];
      
      if (piece && piece === lastPiece) {
        lastPieceIndex = i;
        if(!removeLastPiece) continue;
      }

      if (piece) pieces.push(i);
    }

    this.deletePieces(pieces, true, function() {
      _hidePossibleMoves.call(this);

      if (initialize) _init.call(this);
      if (callback) callback();
    }.bind(this));
  }

  /*
   * Highlights the parts of the board where a move can be made
   *
   * @param {int} index Index of the last placed piece
   * @param {string} class Color class of the next piece to be placed
   */
   function _showPossibleMoves(index, colorClass) {

    function show() {
      var moves = _getPossibleMoves.call(this, index);

      for (var i = moves.length - 1; i >= 0; i--) {
        var moveIndex = moves[i];
        var surface = this._highlights[i];
        var xy = this._gridController.getXYCoordsFromIndex(moveIndex);
        var level = this._controller.getCurrentLevel();

        surface.setClasses([
          'gameboard-possible-move',
          'piece',
          'stage-' + level.stage,
          'level-' + level.level,
          colorClass
        ]);
        
        // surface.setProperties({backgroundColor: colorClass}); // TEMP... REMOVE

        surface._mod.setTransform(Transform.translate(xy[0], xy[1], 180));
        surface._scaleMod.setTransform(Transform.scale(1, 1, 1), {duration: 300});
      }
    }

    _hidePossibleMoves.call(this, show.bind(this));
   }

   function _hidePossibleMoves(callback) {
    var dur = 300;

    for (var i = this._highlights.length - 1; i >= 0; i--) {
      var surface = this._highlights[i];
      
      surface._scaleMod.setTransform(Transform.scale(0.001, 0.001, 180), {
        curve: 'linear',
        duration: dur
      });
    }

    if (callback) {
      Timer.setTimeout(callback, dur);
    }
   }

  /*
   * Checks to see if the user is trapped
   */
  function _checkIfTrapped(index) {
    var moves = _getPossibleMoves.call(this, index);

    if (moves.length === 0) this._controller.gameOver();
  }

  /*
   * Returns the moves (indices) available to the user
   *
   * @param {int} index The index to calculate the moves from
   */
  function _getPossibleMoves(index) {
    var moves = [];

    var directions = {
      left: this.isInBounds('left'),
      right: this.isInBounds('right'),
      up: this.isInBounds('up'),
      down: this.isInBounds('down')
    };

    for (var direction in directions) {
      if (directions[direction]) {
        var indexToCheck = _getNewIndex.call(this, index, direction);

        if (this._state[indexToCheck] === null) {
          moves.push(indexToCheck);
        }
      }
    }

    return moves;
  }

  /*
   * Calculates the index of the neighbor position relative to the current index
   */
  function _getNewIndex(index, direction) {
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
  }

  /*
   * Determines the direction of the swipe
   */
  function _getSwipeDirection(xStart, yStart, xEnd, yEnd) {
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
  }

  module.exports = BoardView;
});
