define(function(require, exports, module) {
  var OptionsManager  = require('famous/core/OptionsManager');
  var StateModifier   = require('famous/modifiers/StateModifier');
  var Transform       = require('famous/core/Transform');
  var EventHandler    = require('famous/core/EventHandler');
  var RenderNode      = require('famous/core/RenderNode');


  // ## Import Views
  var PieceView = require('views/PieceView');

  var colorArray = ['blue', 'green', 'red'];

  // initializes this.colorQueue with 3 colors
  function PieceController(options) {

    if(PieceController._instance){
      return PieceController._instance;
    }

    this._deletedPieces = [];
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
    
    PieceController._instance = this;
  }

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
    var backColor = this.getNextColorFromQueue();

    console.info('Using Existing Piece');

    // The only time this._lastColor is falsy is when we are
    // placeing the first piece on the board
    if (!this._lastColor) this._lastColor = backColor;
    
    // Create the piece before reassigning last color
    piece.updateOptions({
      direction: direction,
      frontBgColor: this._lastColor,
      backBgColor: backColor
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

    // console.info('Creating New Piece');

    if(!direction) direction = 'left';

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
      direction: direction
    };

    piece = new PieceView(options);

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
    if(this._deletedPieces.length === 0){
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

  PieceController.prototype.getNextColorFromQueue = function(shift){
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

  PieceController.prototype.addColorToQueue = function(){
    var color = _getRandomColor(0, colorArray.length - 1);
    this.colorQueue.push(color);

    this._eventOutput.emit('piece:colorsUpdated');
    this._eventOutput.emit('piece:colorAdded');
  };

  // ## Utility Functions
  function _getRandomColor (min, max){
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return colorArray[num];
  }

  module.exports = PieceController;
});
