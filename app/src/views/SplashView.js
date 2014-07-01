/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ImageSurface  = require('famous/surfaces/ImageSurface');

  // ## Layouts
  var SplashLayout = require('views/SplashLayout');

  // ## Views

  function SplashView() {
    View.apply(this, arguments);

    this.rootMod = new StateModifier();
    this.layout = new SplashLayout();

    _createBacking.call(this);
    _createFirstPatternOverlay.call(this);
    _createSecondPatternOverlay.call(this);
    _createLogo.call(this);

    this.node = this.add(this.rootMod);
    this.node.add(this.layout);
  }

  SplashView.prototype = Object.create(View.prototype);
  SplashView.prototype.constructor = SplashView;

  SplashView.DEFAULT_OPTIONS = {};

  // ## Private Helpers

  function _createLogo() {
    this.logo = new LogoView();

    this.layout.branding.add(logo);
  }

  function _createBacking() {
    var backing = new Surface({
      classes: ['splashscreen', 'splashscreen-backing']
    });

    this.node.add(backing);
  }

  function _createFirstPatternOverlay() {
    var firstPattern = new Surface({
      classes: ['pattern', 'pattern-1']
    });

    var mod = new StateModifier({
      opacity: 0.001
    });

    this.modifiers.push(mod);

    this.node.add(mod).add(firstPattern);
  }

  function _createSecondPatternOverlay() {
    var secondPattern = new Surface({
      classes: ['pattern', 'pattern-2']
    });

    var mod = new StateModifier({
      opacity: 0.001
    });

    this.modifiers.push(mod);

    this.node.add(mod).add(secondPattern);
  }

  module.exports = SplashView;
});
