/* globals define */

/**
 * BoardView is basically a grid layout with a bunch of surfaces
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function _createBackground() {
    var bgSurface = new Surface({
      properties: {
        backgroundColor: 'black'
      }
    });

    this.add(bgSurface);
  }

  function BoardView() {
    View.apply(this, arguments);

    _createBackground.call(this);
  }

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.DEFAULT_OPTIONS = {};

  module.exports = BoardView;
});
