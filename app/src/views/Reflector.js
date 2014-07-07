/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: felix@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function(require, exports, module) {
  var Transform = require('famous/core/Transform');
  var Transitionable = require('famous/transitions/Transitionable');
  var OptionsManager = require('famous/core/OptionsManager');

  /**
   * Allows you to link two renderables as front and back sides that can be
   *  'reflected' back and forth along a chosen axis. Rendering optimizations are
   *  automatically handled.
   *
   * @class Reflector
   * @constructor
   * @param {Options} [options] An object of options.
   * @param {Transition} [options.transition=true] The transition executed when reflecting your Reflector instance.
   */
  function Reflector(options) {

    this.angle = new Transitionable(0);
    this.frontNode = undefined;
    this.backNode = undefined;
    this.reflected = false;

    this.options = Object.create(Reflector.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);

    if (this.options.direction === Reflector.DIRECTION_UP ||
        this.options.direction === Reflector.DIRECTION_DOWN) {

      this.axis = Reflector.AXIS_X;
    }

    if (this.options.direction === Reflector.DIRECTION_LEFT ||
        this.options.direction === Reflector.DIRECTION_RIGHT) {

      this.axis = Reflector.AXIS_Y;
    }
  }

  Reflector.AXIS_X = 0;
  Reflector.AXIS_Y = 1;

  Reflector.DIRECTION_UP = 0;
  Reflector.DIRECTION_DOWN = 1;
  Reflector.DIRECTION_LEFT = 2;
  Reflector.DIRECTION_RIGHT = 3;

  Reflector.DEFAULT_OPTIONS = {
    transition: true,
    direction: Reflector.DIRECTION_RIGHT
  };

  Reflector.prototype.updateOptions = function(options) {
    this.setOptions(options);

    if (this.options.direction === Reflector.DIRECTION_UP ||
        this.options.direction === Reflector.DIRECTION_DOWN) {

      this.axis = Reflector.AXIS_X;
    }

    if (this.options.direction === Reflector.DIRECTION_LEFT ||
        this.options.direction === Reflector.DIRECTION_RIGHT) {

      this.axis = Reflector.AXIS_Y;
    }
  };

  /**
   * Toggles the rotation between the front and back renderables
   *
   * @method reflect
   * @param {Object} [transition] Transition definition
   * @param {Function} [callback] Callback
   */
  Reflector.prototype.reflect = function reflect(transition, callback) {
    var angle = this.reflected ? 0 : Math.PI;

    this.setAngle(angle, transition, callback);
    this.reflected = !this.reflected;
  };

  Reflector.prototype.reset = function reset() {
    this.angle = new Transitionable(0);
    this.reflected = false;
    this.setAngle(0);
  };

  /**
   * Basic setter to the angle
   *
   * @method setAngle
   * @param {Number} angle
   * @param {Object} [transition] Transition definition
   * @param {Function} [callback] Callback
   */
  Reflector.prototype.setAngle = function setAngle(angle, transition, callback) {
    if (transition === undefined) transition = this.options.transition;
    if (this.angle.isActive()) this.angle.halt();
    this.angle.set(angle, transition, callback);
  };

  /**
   * Patches the Reflector instance's options with the passed-in ones.
   *
   * @method setOptions
   * @param {Options} options An object of configurable options for the Reflector instance.
   */
  Reflector.prototype.setOptions = function setOptions(options) {
    return this._optionsManager.setOptions(options);
  };

  /**
   * Adds the passed-in renderable to the view associated with the 'front' of the Reflector instance.
   *
   * @method setFront
   * @chainable
   * @param {Object} node The renderable you want to add to the front.
   */
  Reflector.prototype.setFront = function setFront(node) {
    this.frontNode = node;
  };

  /**
   * Adds the passed-in renderable to the view associated with the 'back' of the Reflector instance.
   *
   * @method setBack
   * @chainable
   * @param {Object} node The renderable you want to add to the back.
   */
  Reflector.prototype.setBack = function setBack(node) {
    this.backNode = node;
  };

  /**
   * Generate a render spec from the contents of this component.
   *
   * @private
   * @method render
   * @return {Number} Render spec for this component
   */
  Reflector.prototype.render = function render() {
    var angle = this.angle.get();
    var backTransform;
    var frontTransform;
    var result = [];

    if (this.axis === Reflector.AXIS_Y) {
      if (this.options.direction === Reflector.DIRECTION_LEFT) {
        angle = -angle;
      }

      frontTransform = Transform.rotateY(angle);

      // Any content on the back side will be backwards
      backTransform = Transform.rotateY(angle);
    }
    else {

      if (this.options.direction === Reflector.DIRECTION_DOWN) {
        angle = -angle;
      }

      frontTransform = Transform.rotateX(angle);

      // Any content on the back side will be backwards
      backTransform = Transform.rotateX(angle);
    }

    if (this.frontNode) {
      result.push({
        transform: frontTransform,
        target: this.frontNode.render()
      });
    }

    if (this.backNode) {
      result.push({
        transform: Transform.moveThen([0, 0, -0.1], backTransform),
        target: this.backNode.render()
      });
    }

    return result;
  };

  module.exports = Reflector;
});
