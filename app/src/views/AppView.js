/**
 * This is the top level view. It contains the HomeView, LevelView, GameView
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // Views
  var GameView = require('./GameView');

  function _createGameView() {
    this.gameView = new GameView();
    this.gameModifier = new StateModifier();

    this.add(this.gameModifier).add(this.gameView);
  }

  function AppView() {
    View.apply(this, arguments);

    _createGameView.call(this);
  }

  AppView.prototype = Object.create(View.prototype);
  AppView.prototype.constructor = AppView;

  AppView.DEFAULT_OPTIONS = {};

  module.exports = AppView;
});
