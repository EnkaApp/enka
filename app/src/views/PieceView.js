/* global:define */

/**
 * Piece represents a single game piece
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var RenderNode = require('famous/core/RenderNode');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  // var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier = require('famous/core/Modifier');

  // Testing
  var Reflector = require('views/Reflector');

  // ## Custom Modifier Classes
  // var ReflectionModifier = require('../modifiers/ReflectionModifier');

  // ## Constants

  var DIRECTIONS = {
    right: Reflector.DIRECTION_RIGHT,
    left: Reflector.DIRECTION_LEFT,
    up: Reflector.DIRECTION_UP,
    down: Reflector.DIRECTION_DOWN,
  };

  // ## Modifiers

  function _initReflectionModifier() {

    var origin, align;
      
    if (this.options.direction === 'up') {
      origin = [0.5, 0];
      align = [0.5, 0];
    } else if (this.options.direction === 'down') {
      origin = [0.5, 1];
      align = [0.5, 1];
    } else if (this.options.direction === 'left') {
      origin = [0, 0.5];
      align = [0, 0.5];
    } else if (this.options.direction === 'right') {
      origin = [1, 0.5];
      align = [1, 0.5];
    }

    if (!this.reflectionMod) {
      this.reflectionMod = new Modifier({
        origin: origin,
        align: align
      });
    } else {
      this.reflectionMod.setOrigin(origin);
      this.reflectionMod.setAlign(align);
    }

    // return this.add(modifier);
  }

  // ## Surfaces
  function _createBack() {
    var back = new Surface({
      content: '',
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      properties: {
        backgroundColor: this.options.backBgColor,
        webkitBackfaceVisibility: 'visible',
        pointerEvents: 'none'
      }
    });

    // @TODO add color label class
    back.setClasses(['piece', 'piece-back', this.options.backBgColor]);


    return back;
  }

  function _createFront() {
    // console.log(size)
    var front = new Surface({
      content: '',
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      properties: {
        backgroundColor: this.options.frontBgColor,
        webkitBackfaceVisibility: 'visible',
        pointerEvents: 'none'
      }
    });

    // @TODO add color label class
    front.setClasses(['piece', 'piece-front', this.options.frontBgColor]);

    return front;
  }

  function PieceView() {

    View.apply(this, arguments);

    this.back = _createBack.call(this);
    this.front = _createFront.call(this);

    this.reflector = new Reflector({
      direction: DIRECTIONS[this.options.direction]
    });
  
    this.reflector.setFront(this.front);
    this.reflector.setBack(this.back);

    _initReflectionModifier.call(this);
    this.add(this.reflectionMod).add(this.reflector);               
  }

  PieceView.prototype = Object.create(View.prototype);
  PieceView.prototype.constructor = PieceView;

  PieceView.DEFAULT_OPTIONS = {
    width: 100,
    height: 100,
    frontBgColor: 'blue',
    backBgColor: 'red',
    direction: 'left',
    obstacle: false
  };

  PieceView.prototype.getOption = function(key) {
    return this.options[key];
  };

  PieceView.prototype.updateOptions = function(options) {
    this.reset();


    console.log('update with new options', options);

    // update the options
    this.setOptions(options);

    console.log('new back color', this.options.backBgColor);
    console.log('new front color', this.options.frontBgColor);

    // reiniatialize the back, front, reflectionModifier, and reflector
    //
    // @TODO when changin to classes for colors we will need to 
    // update this because we won't be using backgroundColor
    this.back.setProperties({
      backgroundColor: this.options.backBgColor
    });

    this.front.setProperties({
      backgroundColor: this.options.frontBgColor
    });

    _initReflectionModifier.call(this);
    
    this.reflector.updateOptions({
      direction: DIRECTIONS[this.options.direction]
    });

    this.reflector.setFront(this.front);
    this.reflector.setBack(this.back);
  };

  PieceView.prototype.reset = function() {
    this.reflector.reset();
  };

  PieceView.prototype.reflect = function() {
    // var toggle = false;
    // var angle = toggle ? 0 : Math.PI;
    // var angle = Math.PI;
    // this.reflector.setAngle(angle, {curve : 'linear', duration : 500}, function(){
    //   this._eventOutput.emit('reflected');
    // }.bind(this));

    console.log('reflect piece');
    
    this.reflector.reflect({curve : 'linear', duration : 500}, function(){
      this._eventOutput.emit('reflected');
    }.bind(this));
    // toggle = !toggle;
  };

  module.exports = PieceView;
});
