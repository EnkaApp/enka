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

  function _addReflectionModifier() {

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

    var modifier = new Modifier({
      origin: origin,
      align: align
    });

    return this.add(modifier);
  }

  // ## Surfaces
  function _createBack() {
    var back = new Surface({
      content: 'back',
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      properties: {
        backgroundColor: this.options.backBgColor,
        webkitBackfaceVisibility: 'visible'
      }
    });

    return back;
  }

  function _createFront() {
    // console.log(size)
    var front = new Surface({
      content: 'front',
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      properties: {
        backgroundColor: this.options.frontBgColor,
        webkitBackfaceVisibility: 'visible'
      }
    });

    return front;
  }


  // Add Event Handlers
  // function _addEventHandlers() { 
  //   this.front.on('click', this.reflect.bind(this));
  //   this.back.on('click', this.reflect.bind(this));
  // }

  function PieceView() {

    View.apply(this, arguments);

    this.reflector = new Reflector({
      direction: DIRECTIONS[this.options.direction]
    });
    this.back = _createBack.call(this);
    this.front = _createFront.call(this);
    
    this.reflector.setFront(this.front);
    this.reflector.setBack(this.back);

    var node = _addReflectionModifier.call(this); 
    node.add(this.reflector);

    // _addEventHandlers.call(this);                 
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

  PieceView.prototype.reflect = function () {
    // var toggle = false;
    // var angle = toggle ? 0 : Math.PI;
    var angle = Math.PI;
    this.reflector.setAngle(angle, {curve : 'linear', duration : 500});
    // toggle = !toggle;
  };

  module.exports = PieceView;
});
