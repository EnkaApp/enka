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

  // ## Stage Configuration
  var StageConfig = require('StageConfig');

  // ## Layout
  var GridLayout = require('famous/views/GridLayout');

  // ## Controllers
  var GameController = require('controllers/GameController');

  // ## Views
  var Lightbox = require('famous/views/Lightbox');
  var LevelView = require('views/LevelView');
  var ZoomingGridView = require('views/ZoomingGridView');

  // ## Event Handlers/Listeners    
  function _setListeners() {

    function levelSelect(data) {
      this._eventOutput.emit('level:select');
    }

    function play(data) {
      console.log('level:play', data);
      this._eventOutput.emit('nav:loadGame', data);
    }

    function stageSelect(e) {
      this._eventOutput.emit('stage:select', {
        stage: this.options.stage,
        node: this,
        event: e
      });
    }

    this.bg.on('click', stageSelect.bind(this));
    this._eventInput.on('level:select', levelSelect.bind(this));
    this._eventInput.on('level:play', play.bind(this));

    // Make sure that scroll/swipe events are passed downstream
    this.grid.pipe(this._eventInput);
    this.bg.pipe(this._eventInput);
    this._eventInput.pipe(this._eventOutput);

    this._gameController._eventOutput.on('game:unlockNextLevel', function() {
      var levelObj = this._gameController.getLatestLevel();

      _unlockNextLevel.call(this, levelObj.stage, levelObj.level);
    }.bind(this));
  }

  function _unlockNextLevel(stage, level) {
    if (this.options.stage === stage) {
      var levelView = this.levels[level-1];
      levelView.unlock();
    }
  }

  function LevelsView() {
    View.apply(this, arguments);

    this.config = new StageConfig(this.options.stage);
    this._gameController = new GameController();

    this.rootMod = new StateModifier({
      size: [undefined, this.options.currentHeight],
      transform: Transform.translate(0, 0, 50)
    });

    this.node = this.add(this.rootMod);

    _createBackground.call(this);
    _createStageIcon.call(this);
    _createGrid.call(this);

    _setListeners.call(this);
  }

  LevelsView.prototype = Object.create(View.prototype);
  LevelsView.prototype.constructor = LevelsView;

  LevelsView.DEFAULT_OPTIONS = {
    stage: 1,
    height: 100,
    currentHeight: 100,
    expandedHeight: 600,
    grid: [5,5],
  };

  LevelsView.prototype.expand = function(data) {
    this._active = true;

    // add class to background
    this.bg.addClass('active');

    // shift the icon up
    this.iconMod.setTransform(
      Transform.translate(0, -(this.options.expandedHeight/2 - 50), 0),
      {curve: 'linear', duration: 300}
    );

    _animateSize.call(this, {
      start: this.options.height,
      end: this.options.expandedHeight,
      axis: 'y'
    }, function () {
      this.showLevels();
    }.bind(this));
  };

  LevelsView.prototype.contract = function(callback) {
    this._active = false;

    this.bg.removeClass('active');

    // shift the icon back
    this.iconMod.setTransform(
      Transform.translate(0, 0, 0),
      {curve: 'linear', duration: 300}
    );

    this.hideLevels(function() {
      _animateSize.call(this, {
        start: this.options.expandedHeight,
        end: this.options.height,
        duration: 500,
        axis: 'y'
      }, function () {
        if (callback) callback.call(this);
      }.bind(this));
    }.bind(this));
  };

  LevelsView.prototype.showLevels = function() {
    this.grid.showCells();
  };

  LevelsView.prototype.hideLevels = function(callback) {
    this.grid.hideCells(null, 50, callback);
  };

  function _createBackground() {
    this.bg = new Surface({
      size: [undefined, undefined],
      content: this.options.content
    });

    this.bgMod = new StateModifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.bg.setClasses(['stage-bg', 'stage-'+this.options.stage]);

    this.node.add(this.bgMod).add(this.bg);
  }

  function _createStageIcon() {
    var icon = this.config.getIcon();

    this.icon = new ImageSurface({
      content: icon.url,
      properties: {
        pointerEvents: 'none'
      }
    });

    this.iconMod = new StateModifier({
      size: icon.size || [50, 50],
      align: [0.5, 0.5],
      origin: [0.5, 0.5],
      opacity: 0.85
    });

    this.node.add(this.iconMod).add(this.icon);
  }

  function _createCells() {
    var cells = [];
    var cellCount = this.options.grid[0] * this.options.grid[1];

    for (var i = 0; i < cellCount; i++) {
      
      var options = {
        index: i,
        level: i+1,
        colors: 3,
        stage: this.options.stage,
      };

      var cell = new LevelView(options);

      cell.pipe(this.grid._eventInput);
      cells.push(cell);
    }

    return cells;
  }

  function _createGrid() {
    this.grid = new ZoomingGridView({
      grid: [4,5],
      gutterSize: [20,20],
      cellSize: [250,250],
      scale: [0.3, 0.3, 1],
      openEvent: 'level:select',
      closeEvent: 'level:close'
    });

    // Create the cells
    var cells = _createCells.call(this);
    this.levels = cells;

    this.gridMod = new StateModifier({
      transform: Transform.translate(0,40,0)
    });

    // Initialize the grid with the cells
    this.grid.createGrid(cells);
    this.node.add(this.gridMod).add(this.grid);
  }

  /**
   * Animates the size of the this view
   */
  function _animateSize(options, callback) {
    var transition = {
      duration: options.duration || 300,
      curve: Easing.inOutQuad
    };

    var start = options.start || 0;
    var end = options.end || 0;
    var axis = options.axis && options.axis.toLowerCase() || 'y';

    var transitionable = new Transitionable(start);

    var prerender = function() {
      var size = [];
      var pixels = transitionable.get();

      if (axis === 'x') {
        size = [pixels, undefined];
      } else if (axis === 'y') {
        size = [undefined, pixels];
      } else {
        size = [pixels, pixels];
      }

      this.rootMod.setSize(size);
    }.bind(this);

    var complete = function(){
      Engine.removeListener('prerender', prerender);
      
      // Update the currentHeight of the view
      this.options.currentHeight = end;
      
      if (callback) callback();
    }.bind(this);

    Engine.on('prerender', prerender);

    transitionable.set(end, transition, complete);
  }


  // ## Utility Functions

  /**
   * Calculates the grid [col, row] coordinates based from the
   * index of the level
   */
  function _indexToGridCoord(index) {
    var grid = this.options.grid;
    var cols = grid[0];
    var rows = grid[1];

    var row = Math.floor(index / cols) + 1;
    var col = index % cols + 1;

    return [col, row];
  }

  /**
   * Calculate the translation along the X axis that is needed
   * to center the level view
   */
  function _getXTranslation(coord, grid) {
    var cols = grid[0];
    var width = this.options.cellSize[0];
    var half = cols * width / 2;
    var offset = (coord[0] - 1) * width;
    
    var x = half - offset - (width / 2);

    return x;
  }

  /**
   * Calculate the translation along the Y axis that is needed
   * to center the level view
   */
  function _getYTranslation(coord, grid) {
    var rows = grid[1];
    var height = this.options.cellSize[1];
    var half = rows * height / 2;
    var offset = (coord[1] - 1) * height;
    
    var y = half - offset - (height / 2);

    return y;
  }

  module.exports = LevelsView;
});
