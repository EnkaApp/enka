/* globals define */

/**
 * This is the level selection view
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function LevelsView() {
    View.apply(this, arguments);
  }

  LevelsView.prototype = Object.create(View.prototype);
  LevelsView.prototype.constructor = LevelsView;

  LevelsView.DEFAULT_OPTIONS = {};

  module.exports = LevelsView;
});
