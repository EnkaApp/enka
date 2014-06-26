define(function(require, exports, module) {
  var OptionsManager  = require('famous/core/OptionsManager');
  var StateModifier   = require('famous/modifiers/StateModifier');
  var Transform       = require('famous/core/Transform');
  var EventHandler    = require('famous/core/EventHandler');
  var RenderNode      = require('famous/core/RenderNode');


  // ## Import Views
  var PieceView = require('./views/PieceView');

  var colorArray = ['blue', 'green', 'red'];
  var deletedPieces = [];

  // initializes this.colorQueue with 3 colors
  function PieceGenerator(options) {

    if(PieceGenerator._instance){
      return PieceGenerator._instance;
    }

    this._eventOutput = new EventHandler();
    this._eventInput = new EventHandler();

    this._lastColor = '';
    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    this.colorQueue = [];

    if (options) this.setOptions(options);

    for(var i = 0; i < 3; i++){
      this.addColorToQueue();
    }
    
    PieceGenerator._instance = this;
  }

  PieceGenerator._instance = null;

  PieceGenerator.DEFAULT_OPTIONS = {
    rows: 7,
    columns: 5,
    colors: 3,
    pieceSize: 64
  };

  PieceGenerator.prototype.setOptions = function(options){
    this._optionsManager.patch(options);
  };

  function _useExistingPiece(direction) {
    var node = deletedPieces.pop();
    var piece = node._piece;
    var backColor = this.getNextColorFromQueue();

    console.info('Using Existing Piece');
    
    // Create the piece before reassigning last color
    piece.updateOptions({
      direction: direction,
      frontBgColor: this._lastColor,
      backBgColor: backColor
    });

    // Save the last used back color
    this._lastColor = backColor;

    this.addColorToQueue();

    return node;
  }

	function _createNewPiece(direction) {

    console.info('Creating New Piece');

    if(!direction) direction = 'left';

    var node = new RenderNode();

    // Create the modifier here
    var modifier = new StateModifier({
      origin: [0, 0],
      align: [0, 0],
      size: [this.options.pieceSize, this.options.pieceSize],
    });

    // save a reference to the modifier
    node._mod = modifier;
    
    var backColor = this.getNextColorFromQueue();
    this.addColorToQueue();

    // The only time this._lastColor is falsy is when we are
    // placeing the first piece on the board
    if (!this._lastColor) this._lastColor = backColor;

    var options = {
      width: this.options.pieceSize,
      height: this.options.pieceSize,
      frontBgColor: this._lastColor,
      backBgColor: backColor,
      direction: direction
    };

    piece = new PieceView(options);

    // save a reference to the piece
    node._piece = piece;

    // add modifier and piece to node
    node.add(node._mod).add(node._piece);

    // Save the last used back color
    this._lastColor = backColor;

    return node;
  }

  PieceGenerator.prototype.getPiece = function(direction, position) {
    var node = null;

    // If deletedPieces.length === 0, create a new piece
    if(deletedPieces.length === 0){
      node = _createNewPiece.call(this, direction);
    }

    // otherwise use an existing piece
    else {
      node = _useExistingPiece.call(this, direction);
    }

    return node;
  };

  PieceGenerator.prototype.addDeletedPiece = function(node) {
    deletedPieces.push(node);
  };

  PieceGenerator.prototype.getNextColorFromQueue = function(){
    var color = this.colorQueue.shift();

    this._eventOutput.emit('colorsUpdated');
    this._eventOutput.emit('piece:colorRemoved');

    return color;
  };

  PieceGenerator.prototype.addColorToQueue = function(){
    var color = _getRandomColor(0, colorArray.length - 1);
    this.colorQueue.push(color);

    this._eventOutput.emit('colorsUpdated');
    this._eventOutput.emit('piece:colorAdded');
  };

  // ## Utility Functions
  function _getRandomColor (min, max){
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return colorArray[num];
  }

  module.exports = PieceGenerator;
});
