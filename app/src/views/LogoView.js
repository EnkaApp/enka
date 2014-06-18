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
  var EventHandler  = require('famous/core/EventHandler');

  // var eventHandler = new EventHandler();
  var LetterView = require('views/LetterView');

  function _createLogoBg() {
    this.bg = new Surface({
      size: [0, this.options.height],
      properties: {
        pointerEvents: 'none'
      }
    });

    this.bg.setClasses(['bg-logo']);

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
    var letterF = new LetterView('F');
    
    var fModifier = new StateModifier({
      size: [80, 125],
      origin: [0.5, 0.5]
    });

    this.add(fModifier).add(letterF);
  }

  function LogoView() {
    View.apply(this, arguments);

    _createLogoBg.call(this);
    this.showLogo();

    // Uncomment for testing logo background
    // var open = true;
    // Engine.on('click', function() {
    //   _toggleBg.call(this, open);
    //   open = !open;
    // }.bind(this));
  }

  LogoView.prototype = Object.create(View.prototype);
  LogoView.prototype.constructor = LogoView;

  LogoView.DEFAULT_OPTIONS = {
    width: 190,
    height: 190
  };

  LogoView.prototype.showLogo = function() {
    this.showBackground(this.showBrand.bind(this));
  };

  LogoView.prototype.showBackground = function(callback) {
    _toggleBg.call(this, true, callback);
  };

  LogoView.prototype.showBrand = function() {
    _createLogoBrand.call(this);
  };

  LogoView.prototype.hideBackground = function() {
    _toggleBg.call(this, false);
  };

  LogoView.resetLogo = function() {

  };

  module.exports = LogoView;
});
