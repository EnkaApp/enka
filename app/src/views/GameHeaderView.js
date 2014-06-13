/* globals define */

/**
 * GameHeaderView contains all the metagame stuff, i.e. the next pieces
 * display and the current score, lives, etc
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function GameHeaderView() {
    View.apply(this, arguments);
  }

  GameHeaderView.prototype = Object.create(View.prototype);
  GameHeaderView.prototype.constructor = GameHeaderView;

  GameHeaderView.DEFAULT_OPTIONS = {};

  module.exports = GameHeaderView;
});
