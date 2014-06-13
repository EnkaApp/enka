/* globals define */

/**
 * This is the Homepage/Game start View
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function HomeView() {
    View.apply(this, arguments);
  }

  HomeView.prototype = Object.create(View.prototype);
  HomeView.prototype.constructor = HomeView;

  HomeView.DEFAULT_OPTIONS = {};

  module.exports = HomeView;
});
