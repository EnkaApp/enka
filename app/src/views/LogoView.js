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
  var width = utils.getViewportWidth();

  function LogoView() {
    View.apply(this, arguments);

    _createLogoBg.call(this);
    _createLogoBrand.call(this);
    _createFamousIcon.call(this);
  }

  LogoView.prototype = Object.create(View.prototype);
  LogoView.prototype.constructor = LogoView;

  LogoView.DEFAULT_OPTIONS = {
    width: width / 5 * 3, //192
    height: width / 5 * 3, //192
  };

  LogoView.prototype.showLogo = function() {
    this.showBackground(function() {
      this.showBrand.call(this, function() {
        this.showFamousIcon.call(this);
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
      origin: [0.5, 0],
      align: [0.5, 0],
      opacity: 0.001,
      transform: Transform.translate(0, 40, 50)
    });

    var centerSpinMod = new Modifier({
      origin: [0.5, 0.5],
      transform : function() {
        return Transform.rotateY(0.002 * (Date.now() - initialTime));
      }
    });

    this.famousIcon._mod = posMod;

    this.add(posMod).add(centerSpinMod).add(this.famousIcon);
  }

  function _createLogoBg() {
    this.bg = new Surface({
      size: [0, this.options.height],
      classes: ['logo', 'logo-bg'],
      properties: {
        pointerEvents: 'none',
        zIndex: 5
      }
    });

    this.bgModifier = new Modifier({
      origin: [0.5, 0],
      transform: Transform.translate(0, 0, 0)
    });

    this.add(this.bgModifier).add(this.bg);
  }

  function _toggleBg(open, callback) {

    var transition = {duration: 400, curve: Easing.inOutQuad };

    var start = open ? 0 : this.options.width;
    var end = open ? this.options.width : 0;

    var transitionable = new Transitionable(start);

    var prerender = function(){
      this.bg.setOptions({
        size: [transitionable.get(), this.options.height]
      });
    }.bind(this);

    var complete = function(){
      Engine.removeListener('prerender', prerender);
      if (callback) callback();
    };

    Engine.on('prerender', prerender);

    transitionable.set(end, transition, complete);
  }

  function _createLogoBrand() {
    // var letterF = new LetterView('F');
    
    // var fModifier = new StateModifier({
    //   size: [80, 125],
    //   origin: [0.5, 0.5]
    // });

    // this.add(fModifier).add(letterF);

    var pyramid = new LetterView('pyramid');
    var mod = new StateModifier({
      size: [170, 125],
      origin: [0.5, 0.5]
    });

    this.brandView = pyramid;
    this.add(mod).add(pyramid);
  }

  module.exports = LogoView;
});
