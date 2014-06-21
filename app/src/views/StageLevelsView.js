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

  // Stage Level layout definition...
  // Each top level array item (stage array) contains the definition
  // for the layout of the levels for that stage.
  //
  // Each stage array contains the grid positions of a level view
  // Additionally each level view will be displayed with animation
  // in the order that they are declared
  // 
  var stageLevelsLayoutDef = [
    // Stage 1... shape of an F
    [{
      grid: [3, 5],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [0,4],
        
        [1,0],
        [1,2],

        [2,0],
      ]
    }],

    // Stage 2... shape of an A
    [{
      grid: [3, 5],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [0,4],

        [1,0],
        [1,2],

        [2,0],
        [2,1],
        [2,2],
        [2,3],
        [2,4]
      ]
    }],

    // Stage 3... shape of an M
    [{
      grid: [5, 5],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [0,4],

        [1,0],
        [2,0],
        [3,0],

        [2,1],
        [2,2],

        [4,0],
        [4,1],
        [4,2],
        [4,3],
        [4,4]
      ]
    }],

    // Stage 4... shape of an O
    [{
      grid: [3, 5],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [0,4],

        [1,0],
        [1,4],

        [2,0],
        [2,1],
        [2,2],
        [2,3],
        [2,4]
      ]
    }],

    // Stage 5... shape of an . (period)
    [{
      grid: [2, 2],
      coords: [
        [0,0],
        [0,1],
        [1,0],
        [1,1],
      ]
    }],

    // Stage 6... shape of an U
    [{
      grid: [3, 5],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [0,4],

        [1,4],

        [2,0],
        [2,1],
        [2,2],
        [2,3],
        [2,4]
      ]
    }],

    // Stage 7... shape of an S
    [{
      grid: [3, 5],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,4],

        [1,0],
        [1,2],
        [1,4],

        [2,0],
        [2,2],
        [2,3],
        [2,4]
      ]
    }]
  ];

  var _createLightbox = function () {
    this.lightbox = new Lightbox();
    this.add(this.lightbox);
  };

  function _createLevel(gridCoords) {
    var size = this.gridController.getCellSize();
    var xy = this.gridController.getXYCoordsFromGridCoords(gridCoords);

    var level = new StageLevelView({
      width: size[0],
      height: size[1],
      x: xy[0],
      y: xy[1],
    });

    this._levels.push(level);
    this.node.add(level);
  }

  function _createLevels() {
    var layoutDef = stageLevelsLayoutDef[this.options.stage - 1][0];
    var grid = layoutDef.grid;
    var coords = layoutDef.coords;

    console.log(layoutDef);
    
    // Create the layout grid
    this.gridController = new GridController({
      rows: grid[1],
      columns: grid[0],
      viewWidth: this.options.width,
      viewHeight: this.options.height,
    });

    for (var i = 0; i < coords.length; i++) {
      var coord = coords[i];
      
      _createLevel.call(this, coord);
    }
  }

  function StageLevelsView() {
    View.apply(this, arguments);

    this._levels = [];

    // _createLightbox.call(this);
    this.rootModifier = new StateModifier({
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.node = this.add(this.rootModifier);
  }

  StageLevelsView.prototype = Object.create(View.prototype);
  StageLevelsView.prototype.constructor = StageLevelsView;

  StageLevelsView.DEFAULT_OPTIONS = {
    stage: 3,
    width: window.innerWidth - 40,
    height: window.innerHeight - 100,
  };

  StageLevelsView.prototype.showLevels = function() {
    console.log('showLevels', this._levels);
    if (this._levels.length === 0) {
      _createLevels.call(this);
    }

    for (var i = 0; i < this._levels.length; i++) {
      // this.lightbox.show(this._levels[i]);
      this._levels[i].show();
    }
  };

  StageLevelsView.prototype.hideLevels = function() {
    for (var i = 0; i < this._levels.length; i++) {
      // this.lightbox.hide(this._levels[i]);
      this._levels[i].hide();
    }
  };

  module.exports = StageLevelsView;
});
