/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface  = require('famous/surfaces/ImageSurface');
  var Timer         = require('famous/utilities/Timer');

  // ## Layouts
  var SplashLayout = require('views/SplashLayout');

  // ## Views
  var LogoView = require('views/LogoView');

  function SplashView() {
    View.apply(this, arguments);

    this._modifiers = [];

    this.rootMod = new StateModifier();
    this.node = this.add(this.rootMod);

    // Setup the layout
    this.layout = new SplashLayout();

    _createBacking.call(this);
    _createFirstPatternOverlay.call(this);
    _createSecondPatternOverlay.call(this);
    _createLogo.call(this);

    this.node.add(this.layout);

    this.add(this.node);
  }

  SplashView.prototype = Object.create(View.prototype);
  SplashView.prototype.constructor = SplashView;

  SplashView.DEFAULT_OPTIONS = {};

  SplashView.prototype.show = function(transition, delay, callback) {
    var ease = {
      curve: 'easeIn',
      duration: 300
    };

    transition = transition || ease;
    delay = delay || delay === 0 ? delay : 300;

    // Animate the background in
    for (var i = 0; i < this._modifiers.length; i++) {
      var mod = this._modifiers[i];

      Timer.setTimeout(function(mod) {
        mod.setOpacity(0.999, transition);
      }.bind(this, mod), i * delay);
    }

    // Execute callback after the animations have completed
    Timer.setTimeout(function() {
      this.logo.showLogo();
      if (callback) callback();
    }.bind(this), delay * (this._modifiers.length - 1));
  };

  SplashView.prototype.hide = function(transition, delay, callback) {
    var ease = {
      curve: 'easeIn',
      duration: 0
    };

    transition = transition || ease;
    delay = delay || delay === 0 ? delay : 0;

    // Animate the background out
    for (var i = 0; i < this._modifiers.length; i++) {
      var mod = this._modifiers[i];

      Timer.setTimeout(function(mod) {
        mod.setOpacity(0.001, transition, function() {
          if (callback) callback();
        });
      }.bind(this, mod), i * delay);
    }
  };

  // ## Private Helpers

  function _createLogo() {
    this.logo = new LogoView();

    this.layout.branding.add(this.logo);
  }

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

  module.exports = SplashView;
});
