/* globals define */

/**
 * This is the stages stripe (menu item) view
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function StageView() {
    View.apply(this, arguments);
  }

  StageView.prototype = Object.create(View.prototype);
  StageView.prototype.constructor = StageView;

  StageView.DEFAULT_OPTIONS = {};

  module.exports = StageView;
});
