/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function BaseView() {
    View.apply(this, arguments);
  }

  BaseView.prototype = Object.create(View.prototype);
  BaseView.prototype.constructor = BaseView;

  BaseView.DEFAULT_OPTIONS = {};

  module.exports = BaseView;
});
