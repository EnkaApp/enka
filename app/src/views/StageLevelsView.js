/* globals define */

/**
 * This is the level selection view that is shown after selecting a stage
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Lightbox      = require('famous/views/Lightbox');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Controllers
  var GridController = require('GridController');

  // ## Views
  var StageLevelView = require('views/StageLevelView');

  function _createLevel(index, gridCoords) {
    // var size = this.gridController.getCellSize();
    var size = this.options.cellSize;
    var xy = this.gridController.getXYCoordsFromGridCoords(gridCoords);
    var color = (index % 3) + 1;

    var level = new StageLevelView({
      current: false,
      level: index+1,
      stage: this.options.stage,
      color: color,
      width: size[0],
      height: size[1],
      x: xy[0],
      y: xy[1],
    });

    this._levels.push(level);
    this.node.add(level);
  }

  function _createLevels() {

    var count = this.options.coords.length;

    // Create the layout grid
    this.gridController = new GridController({
      rows: this.options.rows,
      columns: this.options.cols,
      viewWidth: this._width,
      viewHeight: this._height,
    });

    for (var i = 0; i < count; i++) {
      var coord = this.options.coords[i];
      
      _createLevel.call(this, i, coord);
    }
  }

  function StageLevelsView() {
    View.apply(this, arguments);

    this._levels = [];
    this._width = this.options.cols * this.options.cellSize[1];
    this._height = this.options.rows * this.options.cellSize[0];

    // console.log(this.options.rows);
    // console.log(this.options.cols);

    // _createLightbox.call(this);
    this.rootModifier = new StateModifier({
      size: [this._width, this._height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.node = this.add(this.rootModifier);
  }

  StageLevelsView.prototype = Object.create(View.prototype);
  StageLevelsView.prototype.constructor = StageLevelsView;

  StageLevelsView.DEFAULT_OPTIONS = {
    stage: 1,
    rows: 5,
    cols: 5,
    cellSize: [50, 50],
    coords: [],
    warp: null
  };

  StageLevelsView.prototype.showLevels = function() {
    if (this._levels.length === 0) {
      _createLevels.call(this);
    }

    for (var i = 0; i < this._levels.length; i++) {
      this._levels[i].show();
    }
  };

  StageLevelsView.prototype.hideLevels = function() {
    for (var i = 0; i < this._levels.length; i++) {
      this._levels[i].hide();
    }
  };

  module.exports = StageLevelsView;
});
