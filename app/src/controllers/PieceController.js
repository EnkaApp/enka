define(function(require, exports, module) {
  var StateModifier   = require('famous/modifiers/StateModifier');
  var RenderNode      = require('famous/core/RenderNode');

  // ## Controllers
  var Controller = require('controllers/Controller');
  var GameController = require('controllers/GameController');

  // ## Import Views
  var PieceView = require('views/PieceView');

  function PieceController(options) {

    if (PieceController._instance) {
      return PieceController._instance;
    }

    Controller.apply(this, arguments);

    this.colorQueue = [];
    this._deletedPieces = [];
    this._lastColor = '';
    this._gameController = new GameController();

    // initializes this.colorQueue with 3 colors
    for (var i = 0; i < 3; i++) {
      this.addColorToQueue();
    }

    PieceController._instance = this;
  }

  PieceController.prototype = Object.create(Controller.prototype);
  PieceController.prototype.constructor = PieceController;

  PieceController._instance = null;

  PieceController.DEFAULT_OPTIONS = {
    rows: 7,
    columns: 5,
    colors: 3,
    pieceSize: [64, 64]
  };

  PieceController.prototype.setOptions = function(options) {
    this._optionsManager.patch(options);
  };

  /*
   * Should only be used when a new game is starting
   */
  PieceController.prototype.resetLastColor = function() {
    this._lastColor = '';
  };

  function _useExistingPiece(direction) {
    var node = this._deletedPieces.pop();
    var piece = node._piece;
    var mod = node._mod;
    var level = this._gameController.getCurrentLevel();
    var backColor = this.getNextColorFromQueue();

    // console.info('Using Existing Piece');

    // The only time this._lastColor is falsy is when we are
    // placeing the first piece on the board
    if (!this._lastColor) this._lastColor = backColor;

    // Create the piece before reassigning last color
    piece.updateOptions({
      direction: direction,
      frontBgColor: this._lastColor,
      backBgColor: backColor,
      level: level.level,
      stage: level.stage
    });

    // Update the opacity and piece size
    mod.setOpacity(0.999);
    mod.setSize(this.options.pieceSize);

    // Save the last used back color. This will be used as the
    // front color of the next played piece
    this._lastColor = backColor;

    this.addColorToQueue();

    return node;
  }

	function _createNewPiece(direction) {

    var level = this._gameController.getCurrentLevel();

    if (!direction) direction = 'left';

    // Default to left for no particular reason
    var node = new RenderNode();

    // Create the modifier
    var modifier = new StateModifier({
      origin: [0, 0],
      align: [0, 0],
      size: this.options.pieceSize,
      opacity: 0.999
    });

    // save a reference to the modifier so we can access it easily later
    node._mod = modifier;

    var backColor = this.getNextColorFromQueue();
    this.addColorToQueue();

    // The only time this._lastColor is falsy is when we are
    // placeing the first piece on the board
    if (!this._lastColor) this._lastColor = backColor;

    var options = {
      width: this.options.pieceSize[0],
      height: this.options.pieceSize[1],
      frontBgColor: this._lastColor,
      backBgColor: backColor,
      direction: direction,
      level: level.level,
      stage: level.stage
    };

    var piece = new PieceView(options);

    // save a reference to the piece so we can access it easily later
    node._piece = piece;

    // add modifier and piece to node
    node.add(node._mod).add(node._piece);

    // Save the last used back color. This will be used as the
    // front color of the next played piece
    this._lastColor = backColor;

    return node;
  }

  PieceController.prototype.getPiece = function(direction, position) {
    var node = null;

    // If this._deletedPieces.length === 0, create a new piece
    if (this._deletedPieces.length === 0) {
      node = _createNewPiece.call(this, direction);
    }

    // otherwise use an existing piece
    else {
      node = _useExistingPiece.call(this, direction);
    }

    return node;
  };

  PieceController.prototype.addDeletedPiece = function(node) {
    this._deletedPieces.push(node);
  };

  PieceController.prototype.getNextColorFromQueue = function(shift) {
    var color;

    shift = shift !== undefined ? shift : true;

    if (shift) {
      color = this.colorQueue.shift();
      this._eventOutput.emit('piece:colorRemoved');
    } else {
      color = this.colorQueue[0];
    }

    return color;
  };

  PieceController.prototype.addColorToQueue = function() {
    var colorNum = _getRandomIntInRange(1, this.options.colors);
    this.colorQueue.push('color-' + colorNum);

    this._eventOutput.emit('piece:colorsUpdated');
    this._eventOutput.emit('piece:colorAdded');
  };

  // ## Utility Functions

  function _getRandomIntInRange(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
  }

  module.exports = PieceController;
});
