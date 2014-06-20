/* globals define */

/**
 * This is the level selection view that is shown after selecting a stage
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Controllers
  var GridController = require('GridController');

  // Stage Level layout definition...
  // Each top level array item (stage array) contains the definition
  // for the layout of the levels for that stage.
  //
  // Each stage array contains the grid positions of a level view
  // Additionally each level view will be displayed with animation
  // in the order that they are declared
  // 
  var stageLevelsLayoutDef = [
    // Stage 1
    [
      [0,0],
      [0,1],
      [0,3],
      [2,2],
    ],

    // Stage 2
    [
    ]
  ];

  function _createLevel(gridCoords) {
    var size = this.gridController.getCellSize();
    var xyCoords = this.gridController.getXYCoords();

    var level = new Surface({
      size: size,
      properties: {
        backgroundColor: 'black'
      }
    });

    return level;
  }

  function _createLevels() {
    var level = _createLevel.call(this);
  }

  function StageLevelsView() {
    View.apply(this, arguments);

    this.gridController = new GridController([5,5]);
  }

  StageLevelsView.prototype = Object.create(View.prototype);
  StageLevelsView.prototype.constructor = StageLevelsView;

  StageLevelsView.DEFAULT_OPTIONS = {};

  module.exports = StageLevelsView;
});
