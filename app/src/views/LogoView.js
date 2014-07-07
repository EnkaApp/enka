/* globals define */

define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier      = require('famous/core/Modifier');
  var Easing        = require('famous/transitions/Easing');
  var Transitionable = require('famous/transitions/Transitionable');
  var ImageSurface  = require('famous/surfaces/ImageSurface');

  // var eventHandler = new EventHandler();
  var LetterView = require('views/LetterView');

  var utils = require('utils');

  // ## Shared
  var W = utils.getViewportWidth();
  var maxWidth = 480;
  var maxHeight = 480;

  function LogoView() {
    View.apply(this, arguments);

    this._width = this.options.width > maxWidth ?  maxWidth : this.options.width;
    this._height = this.options.height > maxHeight ? maxHeight : this.options.height;

    this.rootModifier = new StateModifier({
      size: [this._width, this._height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.node = this.add(this.rootModifier);

    _createLogoBg.call(this);
    _createLogoBrand.call(this);
    _createFamousIcon.call(this);
  }

  LogoView.prototype = Object.create(View.prototype);
  LogoView.prototype.constructor = LogoView;

  LogoView.DEFAULT_OPTIONS = {
    width: W / 5 * 3, //192 on a 320 pixel viewport
    height: W / 5 * 3, //192 on a 320 pixel viewport
    brand: 'pyramid'
  };

  LogoView.prototype.showLogo = function() {
    this.showBackground(function() {
      this.showBrand.call(this, function() {
        if (this.famousIcon) {
          this.showFamousIcon.call(this);
        }
      }.bind(this));
    }.bind(this));
  };

  LogoView.prototype.showBackground = function(callback) {
    _toggleBg.call(this, true, callback);
  };

  LogoView.prototype.showBrand = function(callback) {
    this.brandView.show(callback);
  };

  LogoView.prototype.showFamousIcon = function() {
    this.famousIcon._mod.setOpacity(0.999, {
      curve: 'linear',
      duration: 600
    });
  };

  LogoView.prototype.hideBackground = function() {
    _toggleBg.call(this, false);
  };

  LogoView.resetLogo = function() {

  };

  // ## Private Helpers

  function _createFamousIcon() {
    this.famousIcon = new ImageSurface({
      size: [35, 35],
      content: 'images/famous-logo.png',
      classes: ['backfaceVisibility']
    });

    var initialTime = Date.now();
    var posMod = new StateModifier({
      size: [35, 35],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      opacity: 0.001,
      transform: Transform.translate(0, -55, 50)
    });

    var centerSpinMod = new Modifier({
      origin: [0.5, 0.5],
      transform : function() {
        return Transform.rotateY(0.002 * (Date.now() - initialTime));
      }
    });

    this.famousIcon._mod = posMod;
    this.node.add(posMod).add(centerSpinMod).add(this.famousIcon);
  }

  function _createLogoBg() {
    this.bg = new Surface({
      size: [0, this._height],
      classes: ['logo', 'logo-bg'],
      properties: {
        pointerEvents: 'none',
        zIndex: 5
      }
    });

    this.bgModifier = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.translate(0, 0, 0)
    });

    this.add(this.bgModifier).add(this.bg);
  }

  function _createLogoBrand() {
    var brand = new LetterView({
      letter: this.options.brand
    });

    var mod = new StateModifier({
      size: [170, 125],
      origin: [0.5, 0.5]
    });

    this.brandView = brand;
    this.node.add(mod).add(brand);
  }

  // Animate the background open/close
  function _toggleBg(open, callback) {

    var transition = {duration: 400, curve: Easing.inOutQuad };

    var start = open ? 0 : this._width;
    var end = open ? this._width : 0;

    var transitionable = new Transitionable(start);

    function prerender() {
      this.bg.setOptions({
        size: [transitionable.get(), this._height]
      });
    }

    function complete() {
      Engine.removeListener('prerender', prerender.bind(this));
      if (callback) {
        callback();
      }
    }

    Engine.on('prerender', prerender.bind(this));

    transitionable.set(end, transition, complete.bind(this));
  }

  module.exports = LogoView;
});
