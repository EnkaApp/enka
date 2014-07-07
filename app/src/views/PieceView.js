/* global:define */

/**
 * Piece represents a single game piece
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## App Dependencies
  var Reflector = require('views/Reflector');

  // ## Constants
  var BACK_CLASSES = ['piece', 'piece-back'];
  var FRONT_CLASSES = ['piece', 'piece-front'];
  var DIRECTIONS = {
    right: Reflector.DIRECTION_RIGHT,
    left: Reflector.DIRECTION_LEFT,
    up: Reflector.DIRECTION_UP,
    down: Reflector.DIRECTION_DOWN
  };

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
    frontBgColor: 'color-1',
    backBgColor: 'color-2',
    direction: 'left',
    obstacle: false,
    level: 1,
    stage: 1
  };

  PieceView.prototype.getOption = function(key) {
    return this.options[key];
  };

  PieceView.prototype.updateOptions = function(options) {
    this.reset();

    // update the options
    this.setOptions(options);

    // reiniatialize the back, front, reflectionModifier, and reflector
    this.back.setClasses(_getBackClasses.call(this));

    this.front.setClasses(_getFrontClasses.call(this));

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
    this.reflector.reflect({curve : 'linear', duration : 500}, function() {
      this._eventOutput.emit('reflected');
    }.bind(this));
  };

   // ## Private Helpers

  function _getBackClasses() {
    return BACK_CLASSES.concat(
      this.options.backBgColor,
      'stage-'+this.options.stage,
      'level-'+this.options.level
    );
  }

  function _getFrontClasses() {
    return FRONT_CLASSES.concat(
      this.options.frontBgColor,
      'stage-'+this.options.stage,
      'level-'+this.options.level
    );
  }

   // ## Modifiers

  function _initReflectionModifier() {
    var align;
    var origin;

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
      this.reflectionMod = new StateModifier({
        origin: origin,
        align: align
      });
    }
    else {
      this.reflectionMod.setOrigin(origin);
      this.reflectionMod.setAlign(align);
    }
  }

  // ## Surfaces
  function _createBack() {
    var back = new Surface({
      content: '',
      classes: _getBackClasses.call(this),
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      properties: {
        webkitBackfaceVisibility: 'visible',
        pointerEvents: 'none'
      }
    });

    return back;
  }

  function _createFront() {
    var front = new Surface({
      content: '',
      classes: _getFrontClasses.call(this),
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      properties: {
        webkitBackfaceVisibility: 'visible',
        pointerEvents: 'none'
      }
    });

    return front;
  }

  module.exports = PieceView;
});
