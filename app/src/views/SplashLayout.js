/*
 * DEPRECATED - UNUSED
 */

define(function(require, exports, module) {
  var Entity = require('famous/core/Entity');
  var RenderNode = require('famous/core/RenderNode');
  var Transform = require('famous/core/Transform');
  var OptionsManager = require('famous/core/OptionsManager');

  var utils = require('utils');

  var width = utils.getViewportWidth();

  function SplashLayout(options) {

    this.options = Object.create(SplashLayout.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);

    // What does this do?
    this._entityId = Entity.register(this);

    this.branding = new RenderNode();
  }

  SplashLayout.DEFAULT_OPTIONS = {
    brandingSize: [width/5 * 3, width/5 * 3],
  };

  /**
   * Generate a render spec from the contents of this component.
   *
   * @private
   * @method render
   * @return {Object} Render spec for this component
   */
  SplashLayout.prototype.render = function render() {
    return this._entityId;
  };

  /**
   * Patches the SplashLayout instance's options with the passed-in ones.
   *
   * @method setOptions
   * @param {Options} options An object of configurable options for the SplashLayout instance.
   */
  SplashLayout.prototype.setOptions = function setOptions(options) {
      return this._optionsManager.setOptions(options);
  };

  /**
   * Apply changes from this component to the corresponding document element.
   * This includes changes to classes, styles, size, content, opacity, origin,
   * and matrix transforms.
   *
   * @private
   * @method commit
   * @param {Context} context commit context
   */
  SplashLayout.prototype.commit = function commit(context) {
    var transform = context.transform;
    var origin = context.origin;
    var size = context.size;
    var opacity = context.opacity;

    var brandingSize = this.options.brandingSize;

    var result = [
      {
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        transform: Transform.translate(0, 0, 0),
        size: brandingSize,
        target: this.branding.render()
      }
    ];

    return {
      transform: transform,
      opacity: opacity,
      size: size,
      target: result
    };
  };

  module.exports = SplashLayout;
});