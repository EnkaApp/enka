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
        pointerEvents: 'none'
      }
    });

    this.backing.setClasses([
      'stage-level-bg',
      'stage-'+this.options.stage,
      'color-'+this.options.color
    ]);

    if (this.options.current) {
      this.backing.addClass('current');
    }

    this.node.add(this.backing);
  }

  function _createNumber() {
    this.number = new Surface({
      content: this.options.level,
      size: [true, true],
      properties: {
        zIndex: 1
      }
    });

    var mod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.number.setClasses([
      'stage-level-number',
      'stage-'+this.options.stage,
      'color-'+this.options.color
    ]);

    this.node.add(mod).add(this.number);
  }

  function StageLevelView() {
    View.apply(this, arguments);

    // console.log('StageLevelView', this.options.x, this.options.y);

    this.rootModifier = new StateModifier({
      size: [this.options.width, this.options.height],
      origin: [0, 0],
      align: [0, 0],
      // transform: Transform.translate(-1000, -1000, 0.001)
    });

    this.node = this.add(this.rootModifier);

    _createBacking.call(this);
    _createNumber.call(this);
  }

  StageLevelView.prototype = Object.create(View.prototype);
  StageLevelView.prototype.constructor = StageLevelView;

  StageLevelView.DEFAULT_OPTIONS = {
    current: false,
    level: 1,
    stage: 1,
    color: 1,
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
