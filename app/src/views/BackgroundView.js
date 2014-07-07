/* globals define */

/*
 * Shared Background for the Home and Splash Screen
 */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Timer         = require('famous/utilities/Timer');

  function BackgroundView() {
    View.apply(this, arguments);

    this._modifiers = [];

    var rootModifier = new StateModifier({
      origin: [0, 0],
      align: [0, 0]
    });

    this.node = this.add(rootModifier);

    _createBacking.call(this);
    _createFirstPatternOverlay.call(this);
    _createSecondPatternOverlay.call(this);
  }

  BackgroundView.prototype = Object.create(View.prototype);
  BackgroundView.prototype.constructor = BackgroundView;

  BackgroundView.DEFAULT_OPTIONS = {};

  BackgroundView.prototype.show = function(transition, delay, callback) {
    var ease = {
      curve: 'easeIn',
      duration: 300
    };

    transition = transition || ease;
    delay = delay || delay === 0 ? delay : 300;

    function setMod(mod) {
      mod.setOpacity(0.999, transition);
    }

    // Animate the background in
    for (var i = 0; i < this._modifiers.length; i++) {
      var mod = this._modifiers[i];

      Timer.setTimeout(setMod.bind(this, mod), i * delay);
    }

    // Execute callback after the animations have completed
    Timer.setTimeout(function() {
      if (callback) callback();
    }.bind(this), delay * (this._modifiers.length - 1));
  };

  BackgroundView.prototype.hide = function(transition, delay, callback) {
    var ease = {
      curve: 'easeIn',
      duration: 0
    };

    transition = transition || ease;
    delay = delay || delay === 0 ? delay : 0;

    function setMod(mod) {
      mod.setOpacity(0.001, transition);
    }

    // Animate the background out
    for (var i = 0; i < this._modifiers.length; i++) {
      var mod = this._modifiers[i];

      Timer.setTimeout(setMod.bind(this, mod), i * delay);
    }

    // Execute callback after the animations have completed
    Timer.setTimeout(function() {
      if (callback) callback();
    }.bind(this), delay * (this._modifiers.length - 1));
  };

  // Shared Between the Splash page and the Home page
  function _createBacking() {
    var backing = new Surface({
      classes: ['splash', 'splash-backing'],
      properties: {
        zIndex: 1
      }
    });

    var mod = new StateModifier({
      opacity: 0.001
    });

    this._modifiers.push(mod);

    this.node.add(mod).add(backing);
  }

  // Shared Between the Splash page and the Home page
  function _createFirstPatternOverlay() {
    var firstPattern = new Surface({
      classes: ['splash', 'splash-pattern', 'splash-pattern-1'],
      properties: {
        zIndex: 2
      }
    });

    var mod = new StateModifier({
      opacity: 0.001
    });

    this._modifiers.push(mod);

    this.node.add(mod).add(firstPattern);
  }

  // Shared Between the Splash page and the Home page
  function _createSecondPatternOverlay() {
    var secondPattern = new Surface({
      classes: ['splash', 'splash-pattern', 'splash-pattern-2'],
      properties: {
        zIndex: 3
      }
    });

    var mod = new StateModifier({
      opacity: 0.001
    });

    this._modifiers.push(mod);

    this.node.add(mod).add(secondPattern);
  }

  module.exports = BackgroundView;
});
