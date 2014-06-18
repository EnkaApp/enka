/* globals define */

/**
 * This is the level selection view that is shown after selecting a stage
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function StageLevelsView() {
    View.apply(this, arguments);
  }

  StageLevelsView.prototype = Object.create(View.prototype);
  StageLevelsView.prototype.constructor = StageLevelsView;

  StageLevelsView.DEFAULT_OPTIONS = {};

  module.exports = StageLevelsView;
});
