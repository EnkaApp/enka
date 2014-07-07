/* globals define */

define(function(require, exports, module) {
  var Engine          = require('famous/core/Engine');
  var View            = require('famous/core/View');
  var Surface         = require('famous/core/Surface');
  var Transform       = require('famous/core/Transform');
  var StateModifier   = require('famous/modifiers/StateModifier');
  var Easing          = require('famous/transitions/Easing');
  var Transitionable  = require('famous/transitions/Transitionable');
  var ImageSurface    = require('famous/surfaces/ImageSurface');

  // ## Stage Configuration
  var StageConfig = require('StageConfig');

  function _setListeners() {
    function stageSelect(e) {
      this._eventOutput.emit('stage:select', {
        stage: this.options.stage,
        node: this,
        event: e
      });
    }

    this.bg.on('click', stageSelect.bind(this));
    this.bg.pipe(this._eventOutput);
  }

  function StageView() {
    View.apply(this, arguments);

    this.config = new StageConfig(this.options.stage);

    this.rootMod = new StateModifier({
      size: [undefined, this.options.currentHeight],
      transform: Transform.translate(0, 0, 1)
    });

    this.node = this.add(this.rootMod);

    _createBackground.call(this);
    _createStageIcon.call(this);

    _setListeners.call(this);
  }

  StageView.prototype = Object.create(View.prototype);
  StageView.prototype.constructor = StageView;

  StageView.DEFAULT_OPTIONS = {
    index: 0,
    stage: 1,
    height: 100,
    currentHeight: 100,
    expandedHeight: 500,
    active: false
  };

  StageView.prototype.expand = function(callback) {
    this.options.active = true;
    this.bg.addClass('active');

    var transition = {curve: 'easeOut', duration: 250};
    var iconYPos = -(this.options.expandedHeight/2 - 50);

     // shift the icon up
    this.iconMod.setTransform(Transform.translate(0, iconYPos, 0), transition, function() {
      // and hide the icon
      this.iconMod.setOpacity(0.001, transition);
    }.bind(this));

    // No need to animate if we are already at the expanded height.
    // @NOTE This will only happen when the stages are first initialized
    if (this.options.currentHeight === this.options.expandedHeight) {
      if (callback) callback();
      return;
    }

    _animateSize.call(this, {
      start: this.options.height,
      end: this.options.expandedHeight,
      axis: 'y'
    }, function() {
      if (callback) callback();
    }.bind(this));
  };

  StageView.prototype.contract = function(callback) {
    var transition = {curve: 'easeOut', duration: 250};

    this.options.active = false;
    this.bg.removeClass('active');

    this.iconMod.setTransform(Transform.translate(0, 0, 0), transition, function() {
      // and show the icon
      this.iconMod.setOpacity(0.999, transition);
    }.bind(this));

    _animateSize.call(this, {
      start: this.options.expandedHeight,
      end: this.options.height,
      duration: 500,
      axis: 'y'
    }, function() {
      if (callback) callback();
    });
  };

  // ## Private Helpers

  function _createBackground() {
    this.bg = new Surface({
      size: [undefined, undefined],
      classes: ['stage-bg', 'stage-'+this.options.stage]
    });

    this.bgMod = new StateModifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.node.add(this.bgMod).add(this.bg);
  }

  function _createStageIcon() {
    var icon = this.config.getIcon();

    this.icon = new ImageSurface({
      content: icon.url,
      classes: [
        'stage-' + this.options.stage,
        'stage-icon'
      ],
      properties: {
        pointerEvents: 'none'
      }
    });

    this.iconMod = new StateModifier({
      size: icon.size || [50, 50],
      align: [0.5, 0.5],
      origin: [0.5, 0.5],
      opacity: 0.85
    });

    this.node.add(this.iconMod).add(this.icon);
  }

  function _animateSize(options, callback) {
    var transition = {
      duration: options.duration || 300,
      curve: Easing.inOutQuad
    };

    var start = options.start || 0;
    var end = options.end || 0;
    var axis = options.axis && options.axis.toLowerCase() || 'y';

    var transitionable = new Transitionable(start);

    var prerender = function() {
      var size = [];
      var pixels = transitionable.get();

      if (axis === 'x') {
        size = [pixels, undefined];
      } else if (axis === 'y') {
        size = [undefined, pixels];
      } else {
        size = [pixels, pixels];
      }

      this.rootMod.setSize(size);
    }.bind(this);

    var complete = function() {
      Engine.removeListener('prerender', prerender);

      // Update the currentHeight of the view
      this.options.currentHeight = end;

      if (callback) callback();
    }.bind(this);

    Engine.on('prerender', prerender);

    transitionable.set(end, transition, complete);
  }

  module.exports = StageView;
});
