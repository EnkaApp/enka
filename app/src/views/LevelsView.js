/* globals define */

define(function(require, exports, module) {
  var Engine          = require('famous/core/Engine');
  var View            = require('famous/core/View');
  var Surface         = require('famous/core/Surface');
  var Transform       = require('famous/core/Transform');
  var StateModifier   = require('famous/modifiers/StateModifier');
  var Modifier        = require('famous/core/Modifier');
  var Easing          = require('famous/transitions/Easing');
  var Transitionable  = require('famous/transitions/Transitionable');
  var Timer           = require('famous/utilities/Timer');
  var ImageSurface    = require('famous/surfaces/ImageSurface');
  var RenderNode      = require('famous/core/RenderNode');

  // ## Utils
  var utils = require('utils');

  // ## Stage Configuration
  var StageConfig = require('StageConfig');

  // ## Layout
  var GridLayout = require('famous/views/GridLayout');

  // ## Controllers
  var GameController = require('controllers/GameController');

  // ## Views
  var LevelView = require('views/LevelView');
  var ZoomingGridView = require('views/ZoomingGridView');

  // ## Templates
  var tplBtn = require('hbs!templates/btn');

  // ## Shared
  var W = utils.getViewportWidth();
  var H = utils.getViewportHeight();
  var LEVEL_CLOSE_DURATION = 700;

  // ## Event Handlers/Listeners    
  function _setListeners() {

    function levelSelect(data) {
      this.openLevel = data.node;
      this.hideCloseBtn();

      this._backing.addClass('level-open');

      // Timer is being used to execute this after the animation has completed
      Timer.setTimeout(function() {
        this._eventOutput.emit('level:select', data);
      }.bind(this), LEVEL_CLOSE_DURATION - 200);
    }

    function levelClose(data) {
      this.openLevel = null;
      this.showCloseBtn();

      // Timer is being used to execute this after the animation has completed
      Timer.setTimeout(function() {
        this._backing.removeClass('level-open');
        this._eventOutput.emit('level:close', data);
      }.bind(this), LEVEL_CLOSE_DURATION - 200);
    }

    function play(data) {
      this.closeOpenedLevels();
      this.showCloseBtn();

      // Timer is being used to execute this after the close levels animation has completed
      Timer.setTimeout(function() {
        this._backing.removeClass('level-open');
        this._eventOutput.emit('nav:loadGame', data);
      }.bind(this), LEVEL_CLOSE_DURATION - 200);
    }

    this._closeButton.on('click', function() {

      // Hide the levels
      this.hide(null, 0, function() {

        // Close the stage
        this._eventOutput.emit('stage:close', {
          stage: this.options.stage
        });
      }.bind(this));
    }.bind(this));

    this._eventInput.on('level:select', levelSelect.bind(this));
    this._eventInput.on('level:close', levelClose.bind(this));
    this._eventInput.on('level:play', play.bind(this));

    // Make sure that scroll/swipe events are passed downstream
    this.grid.pipe(this._eventInput);
    this._eventInput.pipe(this._eventOutput);

    this._gameController._eventOutput.on('game:unlockNextLevel', function() {
      var levelObj = this._gameController.getLatestLevel();

      _unlockNextLevel.call(this, levelObj.stage, levelObj.level);
    }.bind(this));
  }

  function LevelsView() {
    View.apply(this, arguments);

    this._active = false;
    this.openLevel = null;
    this.config = new StageConfig(this.options.stage);
    this._gameController = new GameController();

    this.rootMod = new StateModifier({
      size: [undefined, this.options.expandedHeight],
      transform: Transform.translate(0, 0, 1),
    });

    this.node = this.add(this.rootMod);

    _createBacking.call(this);
    _createGrid.call(this);
    _createCloseBtn.call(this);

    _setListeners.call(this);
  }

  LevelsView.prototype = Object.create(View.prototype);
  LevelsView.prototype.constructor = LevelsView;

  LevelsView.DEFAULT_OPTIONS = {
    stage: 1,
    bgColor: '',
    // height: 100,
    // currentHeight: 100,
    expandedHeight: 600,
    grid: [5,5],
  };

  LevelsView.prototype.show = function(transition, delay, callback) {
    this._active = true;

    this._backing._mod.setTransform(Transform.identity);
    this._backing._mod.setOpacity(0.999, {duration: 300});
    this._backing.addClass('stage-levels-bg--active');
    
    this.grid.showCells(transition, delay, function() {
      this.showCloseBtn();
      if (callback) callback();
    }.bind(this));
  };

  LevelsView.prototype.hide = function(transition, delay, callback) {

    this._active = false;
    this._backing.removeClass('stage-levels-bg--active');
    this._backing._mod.setOpacity(0.001, {duration: 300});

    this.grid.hideCells(transition, delay, function() {
      this._backing._mod.setTransform(Transform.translate(0, 0, -100));
      this.hideCloseBtn();
      if (callback) callback();
    }.bind(this));
  };

  LevelsView.prototype.showCloseBtn = function() {
    var dur = 600;
    var transform = Transform.translate(0, 0, 1);

    this._closeButton._mod.setOpacity(0.999, {
      curve: 'easeIn',
      duration: dur
    });

    this._closeButton._mod.setTransform(transform, {
      curve: 'easeIn',
      duration: dur
    });
  };

  LevelsView.prototype.hideCloseBtn = function() {
    var btnSize = this._closeButton.getSize();
    var transform = Transform.translate(0, btnSize[1], 1);

    this._closeButton._mod.setOpacity(0.001, {
      curve: 'linear',
      duration: 100
    });

    this._closeButton._mod.setTransform(transform, {
      curve: 'linear',
      duration: 100
    });
  };
  
  LevelsView.prototype.closeOpenedLevels = function() {
    if (this.openLevel) {
      this.openLevel.flip();
      this.grid.closeCell();
      this.openLevel = null;
    }
  };

  // ## Private Helpers

  function _unlockNextLevel(stage, level) {
    if (this.options.stage === stage) {
      var levelView = this.levels[level-1];
      levelView.unlock();
    }
  }

  /*
   * Backing will be used to prevent any event from getting to the scrollview
   */
  function _createBacking() {
    this._backing = new Surface({
      size: [undefined, undefined],
      classes: [
        'stage-' + this.options.stage,
        'stage-levels',
        'stage-levels-bg',
      ]
    });

    var mod = new StateModifier({
      size: [undefined, undefined],
      opacity: 0.001
    });

    this._backing._mod = mod;

    this.node.add(mod).add(this._backing);
  }

  function _createCloseBtn() {
    var content = tplBtn({
      label: 'Browse Stages',
      classes: 'btn-browse'
    });

    this._closeButton = new Surface({
      content: content,
      classes: [
        'stage-levels',
        'stage-' + this.options.stage,
      ]
    });

    var mod = new StateModifier({
      size: [undefined, 50],
      origin: [0.5, 1],
      align: [0.5, 1],
      transform: Transform.translate(0, 50, 1)
    });

    this._closeButton._mod = mod;

    this.node.add(mod).add(this._closeButton);
  }

  function _createGrid() {

    var gridSize = [4,5];
    var gutterSize = [20,20];
    var cellSize = [250,250];

    var scale = _getScale.call(this, gridSize, cellSize, gutterSize, 70, 44);

    this.grid = new ZoomingGridView({
      grid: gridSize,
      gutterSize: gutterSize,
      cellSize: cellSize,
      scale: scale,
      openEvent: 'level:select',
      closeEvent: 'level:close'
    });

    // Create the cells
    var cells = _createCells.call(this);
    this.levels = cells;

    this.gridMod = new StateModifier({
      align: [0.5, 0],
      origin: [0.5, 0],
      transform: Transform.translate(0,0,1)
    });

    // Initialize the grid with the cells
    this.grid.createGrid(cells);
    this.node.add(this.gridMod).add(this.grid);
  }

  /*
   * Calculates scale based on the viewport height / width
   *
   * @param {number} buttonHeight - Height of the close button. Should also include any top or bottom margin.
   */
  function _getScale(gridSize, cellSize, gutter, buttonHeight, headerHeight) {
    var h = H - headerHeight - buttonHeight;
    var cols = gridSize[0];
    var rows = gridSize[1];

    // Calculate the scale based off the height
    var gridHeight = rows * cellSize[1] + (rows + 2) * gutter[1];
    var scaleByHeight = h/gridHeight;

    // Calculate the scale based off the width
    var gridWidth = cols *  cellSize[0] + (rows + 2) * gutter[0];
    var scaleByWidth = W/gridWidth;

    if (scaleByWidth < scaleByHeight) scale = scaleByWidth;
    else scale = scaleByHeight;
    
    return [scale, scale, 1];
  }

  function _createCells(grid) {
    var cells = [];
    var cellCount = this.options.grid[0] * this.options.grid[1];

    for (var i = 0; i < cellCount; i++) {
      
      var options = {
        index: i,
        level: i+1,
        colors: 3,
        duration: LEVEL_CLOSE_DURATION,
        stage: this.options.stage,
      };

      var cell = new LevelView(options);

      cells.push(cell);
    }

    return cells;
  }

  module.exports = LevelsView;
});
