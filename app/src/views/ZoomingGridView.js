define(function (require, exports, module) {
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Modifier      = require('famous/core/Modifier');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');
  var Timer         = require('famous/utilities/Timer');
  var GridLayout    = require('famous/views/GridLayout');
  var Transitionable = require('famous/transitions/Transitionable');
  var SpringTransition = require('famous/transitions/SpringTransition');

  Transitionable.registerMethod('spring', SpringTransition);

  var transition = {
    curve: 'easeOut',
    duration: 500
  };

  // Button Intro Transition
  var spring = {
    method: 'spring',
    period: 1000,
    dampingRatio: 0.5
  };

  function _setListeners() {
    this._eventInput.on(this.options.openEvent, function(data) {
      this.openCell(data);
    }.bind(this));

    this._eventInput.on(this.options.closeEvent, function() {
      this.closeCell();
    }.bind(this));

    // Pipe all events downstream
    this._eventInput.pipe(this._eventOutput);
  }

  var ZoomingGrid = function () {
    View.apply(this, arguments);

    this._scale = Transform.scale(
      this.options.scale[0],
      this.options.scale[1],
      this.options.scale[2]
    );

    var width = this.options.cellSize[0] * this.options.grid[0];
    var height = this.options.cellSize[1] * this.options.grid[1];

    this.rootMod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      size: [width, height],
      transform: this._scale
    });

    this.cells = [];
    this.node = this.add(this.rootMod);

    _setListeners.call(this);
  };

  ZoomingGrid.prototype = Object.create(View.prototype);
  ZoomingGrid.prototype.constructor = ZoomingGrid;

  ZoomingGrid.DEFAULT_OPTIONS = {
    cellSize: [300 ,400],
    grid: [4, 7],
    gutterSize: [0, 0],
    scale: [0.1, 0.1, 1],
    openEvent: 'cell:select',
    closeEvent: 'cell:close',
  };

  ZoomingGrid.prototype.openCell = function(data) {
    var coord = _indexToGridCoord.call(this, data.index, this.options.grid);
    var x = _getXTranslation.call(this, coord, this.options.grid);
    var y = _getYTranslation.call(this, coord, this.options.grid);

    this.gridMod.setTransform(Transform.translate(x, y, 1), transition);
    this.rootMod.setTransform(Transform.scale(1, 1, 1), transition);
  };

  ZoomingGrid.prototype.closeCell = function() {
    this.rootMod.setTransform(this._scale, transition);
    this.gridMod.setTransform(Transform.translate(0, 0, 0), transition);
  };

  ZoomingGrid.prototype.showCells = function(transition, delay, callback) {
    this.visible = false;
    this.gridMod.setTransform(Transform.translate(0, 0, 1));
    _animateCells.call(this, transition, delay, callback);
  };

  ZoomingGrid.prototype.hideCells = function(transition, delay, callback) {
    this.visible = true;
    this.gridMod.setTransform(Transform.translate(0, 0, -100));
    _animateCells.call(this, transition, delay, callback);
  };

  ZoomingGrid.prototype.createGrid = function(cells) {
    this.cells = cells || [];

    for (var i = this.cells.length - 1; i >= 0; i--) {
      this.cells[i].pipe(this._eventInput);
    }

    _createGrid.call(this);
  };

  function _createGrid() {
    this.grid = new GridLayout({
      dimensions: this.options.grid,
      gutterSize: this.options.gutterSize
    });

    this.gridMod = new StateModifier();

    this.grid.sequenceFrom(this.cells);

    this.node.add(this.gridMod).add(this.grid);
  }

  function _animateCells(transition, delay, callback) {
    var cells = this.cells;
    
    var ease = {
      duration: 300,
      curve: Easing.inOutQuad
    };

    transition = transition !== undefined ? transition : ease;
    delay = delay || delay === 0 ? delay : 100;

    var animate = function() {

      if (this.visible) {
        this.rootMod.halt();
        this.hide();
      } else {
        this.rootMod.halt();
        this.show();
      }

      this.visible = !this.visible;
    };

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      Timer.setTimeout(animate.bind(cell), delay * i);
    }

    // Execute callback when the animation has completed
    Timer.setTimeout(function () {
      if (callback) callback();
    }, cells.length * delay);
    
  }

  // ## Utility Functions

  function _indexToGridCoord(index) {
    var grid = this.options.grid;
    var cols = grid[0];
    var rows = grid[1];

    var row = Math.floor(index / cols) + 1;
    var col = index % cols + 1;

    return [col, row];
  }

  function _getXTranslation(coord, grid) {
    var cols = grid[0];
    var width = this.options.cellSize[0];
    var half = cols * width / 2;
    var offset = (coord[0] - 1) * width;
    
    var x = half - offset - (width / 2);

    return x;
  }

  function _getYTranslation(coord, grid) {
    var rows = grid[1];
    var height = this.options.cellSize[1];
    var half = rows * height / 2;
    var offset = (coord[1] - 1) * height;
    
    var y = half - offset - (height / 2);

    return y;
  }

  module.exports = ZoomingGrid;
});