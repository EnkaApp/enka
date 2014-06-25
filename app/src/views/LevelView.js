/* globals define */

/**
 * This is the level selection view
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Modifier      = require('famous/core/Modifier');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Lightbox      = require('famous/views/Lightbox');
  var Easing        = require('famous/transitions/Easing');

  // ## Views
  var Flipper = require('famous/views/Flipper');

  function _createListeners() {
    
    function select(e) {
      // Flip the card
      this.flipper.flip();

      // Tell downstream listeners that a level was selected
      this._eventOutput.emit('level:select', {
        index: this.options.level - 1,
        stage: this.options.stage,
        level: this.options.level,
        node: this,
        event: e
      });
    }

    function close(e) {
      // Flip the card
      this.flipper.flip();

      // Tell downstream listeners that a level was closed
      this._eventOutput.emit('level:close', {
        index: this.options.level - 1,
        stage: this.options.stage,
        level: this.options.level,
        node: this,
        event: e
      });
    }

    this.front.on('click', select.bind(this));
    this.back.on('click', close.bind(this));
    
    this.front.pipe(this._eventOutput);
  }

  function LevelView() {
    View.apply(this, arguments);

    this._transform = Transform.translate(
      this.options.start[0],
      this.options.start[1],
      this.options.start[2]
    );

    this.rootMod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5],

      // starts the cells off the screen so it can be animated into position
      transform: this._transform
    });

    // Used to set a CSS color class
    this._color = (this.options.index % this.options.colors) + 1;

    this.node = this.add(this.rootMod);

    _createFlipper.call(this);

    _createListeners.call(this);
  }

  LevelView.prototype = Object.create(View.prototype);
  LevelView.prototype.constructor = LevelView;

  LevelView.DEFAULT_OPTIONS = {
    current: false,
    index: 0,
    level: 1,
    stage: 1,
    colors: 1,
    start: [-10000, -10000, 0]
  };

  LevelView.prototype.hide = function(transition) {

    var easeOut = {
      curve: 'easeOut',
      duration: 300
    };

    transition = transition !== undefined ? transition : easeOut;

    this.rootMod.setOpacity(0.001, transition, function() {
      this.rootMod.setTransform(this._transform);
    }.bind(this));
  };

  LevelView.prototype.show = function(transition) {
    
    var easeOut = {
      curve: 'easeOut',
      duration: 300
    };

    transition = transition !== undefined ? transition : easeOut;
    
    this.rootMod.setOpacity(0.999, transition);
    this.rootMod.setTransform(Transform.translate(0,0,1), transition);
  };

  function _createFlipper() {
    this.flipper = new Flipper();

    var flipperMod = new Modifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    _createFront.call(this);
    _createBack.call(this);

    this.flipper.setFront(this.front);
    this.flipper.setBack(this.back);

    this.node.add(flipperMod).add(this.flipper);
  }

  function _createFront() {
    this.front = new LevelFrontView({
      stage: this.options.stage,
      color: this._color
    });
  }

  function _createBack() {
    this.back = new LevelBackView({
      stage: this.options.stage,
      color: this._color
    });
  }

  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // ------------------------------------------------------------

  function _setLFVListeners() {
    this.backing.pipe(this._eventOutput);
  }

  function LevelFrontView() {
    View.apply(this, arguments);

    this.rootModifier = new StateModifier({
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    this.node = this.add(this.rootModifier);

    _createLFVBacking.call(this);
    _createLFVNumber.call(this);
    _setLFVListeners.call(this);
  }

  LevelFrontView.DEFAULT_OPTIONS = {
    color: 1
  };

  LevelFrontView.prototype = Object.create(View.prototype);
  LevelFrontView.prototype.constructor = LevelFrontView;

  function _createLFVBacking() {
    this.backing = new Surface({
      size: [undefined, undefined],
      properties: {}
    });

    this.backing.setClasses([
      'stage-level-front',
      'stage-level-bg',
      'stage-'+this.options.stage,
      'color-'+this.options.color
    ]);

    if (this.options.current) {
      this.backing.addClass('current');
    }

    this.node.add(this.backing);
  }

  function _createLFVNumber() {
    this.number = new Surface({
      content: this.options.level,
      size: [true, true],
      properties: {
        zIndex: 1,
        pointerEvents: 'none'
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
  }

  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // ------------------------------------------------------------

  function _setLBVListeners() {
    this.backing.pipe(this._eventOutput);
  }

  function LevelBackView() {
    View.apply(this, arguments);

    this.rootModifier = new StateModifier({
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    this.node = this.add(this.rootModifier);

    _createLFBBacking.call(this);
    _setLBVListeners.call(this);
  }

  LevelBackView.DEFAULT_OPTIONS = {
    stage: 1,
    color: 1
  };

  LevelBackView.prototype = Object.create(View.prototype);
  LevelBackView.prototype.constructor = LevelBackView;

  function _createLFBBacking() {
    this.backing = new Surface({
      size: [undefined, undefined],
      properties: {
        backgroundColor: 'white' // TEMP
      }
    });

    this.backing.setClasses([
      'stage-level-back',
      'stage-level-bg',
      'stage-'+this.options.stage,
      'color-'+this.options.color
    ]);

    if (this.options.current) {
      this.backing.addClass('current');
    }

    this.node.add(this.backing);
  }

  module.exports = LevelView;
});
