/* globals define */

/**
 * This is the level selection view
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Lightbox      = require('famous/views/Lightbox');
  var Easing        = require('famous/transitions/Easing');

  function _createBacking() {
    this.backing = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: 'black'
      }
    });

    this.backing.setClasses(['level-select-bg']);

    this.node.add(this.backing);
  }

  function _createLightbox() {
    var lightboxOpts = {
      inOpacity: 1,
      outOpacity: 0,
      inOrigin: [0, 0],
      outOrigin: [0, 0],
      showOrigin: [0, 0],
      inTransform: Transform.thenMove(Transform.rotateX(0.9), [0, -300, -300]),
      outTransform: Transform.thenMove(Transform.rotateZ(0.7), [0, window.innerHeight, -1000]),
      inTransition: { duration: 650, curve: 'easeOut' },
      outTransition: { duration: 500, curve: Easing.inCubic }
    };

    this.lightbox = new Lightbox(lightboxOpts);
    this.node.add(this.lightbox);
  }

  function StageLevelView() {
    View.apply(this, arguments);

    console.log('StageLevelView', this.options.x, this.options.y);

    this.rootModifier = new StateModifier({
      size: [this.options.width, this.options.height],
      origin: [0, 0],
      align: [0, 0],
      // transform: Transform.translate(-1000, -1000, 0.001)
    });

    this.node = this.add(this.rootModifier);

    _createBacking.call(this);
    _createLightbox.call(this);
  }

  StageLevelView.prototype = Object.create(View.prototype);
  StageLevelView.prototype.constructor = StageLevelView;

  StageLevelView.DEFAULT_OPTIONS = {
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    start: [0, 0, -1000],
  };

  StageLevelView.prototype.show = function() {
    console.log('show stagelevelview');


    this.rootModifier.setOpacity(0.999, {
      curve: 'linear',
      duration: 300
    });

    var transform = Transform.translate(this.options.x, this.options.y, 1);
    this.rootModifier.setTransform(transform, {
      curve: 'linear',
      duration: 350
    });
  };

  StageLevelView.prototype.hide = function() {
    console.log('hide stagelevelview');

    var transform = Transform.thenMove(Transform.rotateZ(0.7), [0, window.innerHeight, -1000]);
    // var transform = Transform.translate(10000, 10000, -0.01);
    this.rootModifier.setTransform(transform, {
      duration: 500,
      curve: Easing.inCubic
    }, function() {
      var start = this.options.start;

      this.rootModifier.setTransform(Transform.translate(start[0], start[1], start[2]));
    }.bind(this));

    this.rootModifier.setOpacity(0.001, {
      duration: 500,
      curve: Easing.inCubic
    });
  };

  module.exports = StageLevelView;
});
