

define(function(require, exports, module) {
  var Entity = require('famous/core/Entity');
  var RenderNode = require('famous/core/RenderNode');
  var Transform = require('famous/core/Transform');
  var OptionsManager = require('famous/core/OptionsManager');

  function HomeLayout(options) {

    this.options = Object.create(HomeLayout.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (options) this.setOptions(options);

    // What does this do?
    this._entityId = Entity.register(this);

    this.branding = new RenderNode();
    this.menu = new RenderNode();
  }

  HomeLayout.DEFAULT_OPTIONS = {
    brandingSize: [195, 195],
    brandingTopMargin: 60,
    menuSize: [190, true],
    menuBottomMargin: 60,
  };

  /**
   * Generate a render spec from the contents of this component.
   *
   * @private
   * @method render
   * @return {Object} Render spec for this component
   */
  HomeLayout.prototype.render = function render() {
    return this._entityId;
  };

  /**
   * Patches the HomeLayout instance's options with the passed-in ones.
   *
   * @method setOptions
   * @param {Options} options An object of configurable options for the HomeLayout instance.
   */
  HomeLayout.prototype.setOptions = function setOptions(options) {
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
  HomeLayout.prototype.commit = function commit(context) {
    var transform = context.transform;
    var origin = context.origin;
    var size = context.size;
    var opacity = context.opacity;

    var brandingSize = this.options.brandingSize;
    var brandingTopMargin = this.options.brandingTopMargin;
    var menuSize = this.options.menuSize;
    var menuTopMargin = this.options.menuTopMargin;
    var menuBottomMargin = this.options.menuBottomMargin;

    var result = [
      {
        origin: [0.5, 0],
        align: [0.5, 0],
        transform: Transform.translate(0, brandingTopMargin, 0),
        size: brandingSize,
        target: this.branding.render()
      },
      {
        origin: [0.5, 1],
        align: [0.5, 1],
        transform: Transform.translate(0, -menuBottomMargin, 0),
        size: menuSize,
        target: this.menu.render()
      }
    ];

    return {
      transform: transform,
      opacity: opacity,
      size: size,
      target: result
    };
  };

  module.exports = HomeLayout;
});