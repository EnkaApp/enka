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

    this.rootMod = new StateModifier({
      origin: [0, 0],
      align: [0, 0]
    });
    
    this.node = this.add(this.rootMod);

    // Setup the layout
    this.layout = new SplashLayout();

    _createLogo.call(this);

    this.node.add(this.layout);

    this.add(this.node);
  }

  SplashView.prototype = Object.create(View.prototype);
  SplashView.prototype.constructor = SplashView;

  SplashView.DEFAULT_OPTIONS = {};

  SplashView.prototype.show = function() {
    this.logo.showLogo();
  };

  // ## Private Helpers

  function _createLogo() {
    this.logo = new LogoView();

    this.layout.branding.add(this.logo);
  }

  module.exports = SplashView;
});
