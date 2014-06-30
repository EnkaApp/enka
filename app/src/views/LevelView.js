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
  var Transitionable = require('famous/transitions/Transitionable');
  var SpringTransition = require('famous/transitions/SpringTransition');

  // ## Configurations
  var StageConfig = require('StageConfig');

  // ## Models
  var User = require('models/UserModel');

  // ## Views
  var Flipper = require('famous/views/Flipper');

  // ## Templates
  var tplLevelFront = require('hbs!templates/levelFront');
  var tplLevelDetail = require('hbs!templates/levelDetail');
  var tplBtn = require('hbs!templates/btn');

  // ## Shared
  var user = new User();
  var W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  // Button Intro Transition
  var spring = {
    method: 'spring',
    period: 700,
    dampingRatio: 0.5
  };

  function _createListeners() {

    function play(e) {
      if (this._locked) return;
      
      // Tell downstream listeners that a user wants to play
      this._eventOutput.emit('level:play', {
        index: this.options.level - 1,
        stage: this.options.stage,
        level: this.options.level,
        node: this,
        event: e
      });
    }
    
    function select(e) {
      if (this._locked) return;

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
      if (this._locked) return;

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
    this.back.playButton.on('click', play.bind(this));
    this.back.backing.on('click', close.bind(this));
    
    this.front.pipe(this._eventOutput);
  }

  function LevelView() {
    View.apply(this, arguments);

    // set locked/unlocked status
    this._locked = !user.hasUnlockedLevel(this.options.stage, this.options.level);

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
    start: [-W * 4, -H, 0]
  };

  LevelView.prototype.hide = function(transition) {

    var easeOut = {
      curve: 'easeOut',
      duration: 300
    };

    transition = transition !== undefined ? transition : spring;

    this.rootMod.setOpacity(0.001, transition, function() {
      this.rootMod.setTransform(this._transform);
    }.bind(this));
  };

  LevelView.prototype.show = function(transition) {
    
    var easeOut = {
      curve: 'easeOut',
      duration: 500
    };

    transition = transition !== undefined ? transition : spring;
    
    this.rootMod.setOpacity(0.999, transition);
    this.rootMod.setTransform(Transform.translate(0,0,1), transition);
  };

  LevelView.prototype.unlock = function() {

    // update the user model
    user.setLatestLevel(this.stage, this.level);

    // update the view
    this._locked = false;
    this.front.unlock();
    this.back.unlock();

    // make sure listeners are set
    _createListeners.call(this);
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
      level: this.options.level,
      color: this._color,
      locked: this._locked
    });
  }

  function _createBack() {
    this.back = new LevelBackView({
      stage: this.options.stage,
      level: this.options.level,
      color: this._color,
      locked: this._locked
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
    _setLFVListeners.call(this);
  }

  LevelFrontView.DEFAULT_OPTIONS = {
    stage: 1,
    level: 1,
    color: 1,
    locked: true
  };

  LevelFrontView.prototype = Object.create(View.prototype);
  LevelFrontView.prototype.constructor = LevelFrontView;

  LevelFrontView.prototype.unlock = function() {
    this.setOptions({
      locked: false
    });

    this.backing.removeClass('locked');
  };

  function _getLFVContent() {
    var data = {
      level: this.options.level
    };

    return tplLevelFront(data);
  }

  function _createLFVBacking() {
    this.backing = new Surface({
      size: [undefined, undefined],
      content: _getLFVContent.call(this),
      properties: {}
    });

    this.backing.setClasses([
      'stage-level-front',
      'stage-'+this.options.stage,
      'stage-level--color'+this.options.color
    ]);

    if (this.options.current) {
      this.backing.addClass('current');
    }

    if (this.options.locked) {
      this.backing.addClass('locked');
    }

    this.node.add(this.backing);
  }

  // ------------------------------------------------------------
  // ------------------------------------------------------------
  // ------------------------------------------------------------

  function _setLBVListeners() {
    this.backing.pipe(this._eventOutput);
    this.playButton.pipe(this._eventOutput);
  }

  function LevelBackView() {
    View.apply(this, arguments);

    this._config = new StageConfig(this.options.stage);

    this.rootModifier = new StateModifier({
      size: [this.options.width, this.options.height],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    this.node = this.add(this.rootModifier);

    _createLFBBacking.call(this);
    _createLFBPlayButton.call(this);

    _setLBVListeners.call(this);
  }

  LevelBackView.DEFAULT_OPTIONS = {
    width: 250,
    height: 250,
    stage: 1,
    level: 1,
    color: 1,
    locked: true
  };

  LevelBackView.prototype = Object.create(View.prototype);
  LevelBackView.prototype.constructor = LevelBackView;

  LevelBackView.prototype.unlock = function() {
    this.setOptions({
      locked: false
    });

    this.backing.removeClass('locked');
  };

  function _getLFBContent() {
    var data = {
      description: this._config.getGameDesc(this.options.level)
    };

    return tplLevelDetail(data);
  }

  function _createLFBBacking() {

    this.backing = new Surface({
      size: [undefined, undefined],
      content: _getLFBContent.call(this),
      properties: {
        backgroundColor: 'white' // TEMP
      }
    });

    this.backing.setClasses([
      'stage-level-back',
      'stage-level-backing',
      'stage-'+this.options.stage,
      'stage-level--color'+this.options.color,
    ]);

    if (this.options.current) {
      this.backing.addClass('current');
    }

    if (this.options.locked) {
      this.backing.addClass('locked');
    }

    this.node.add(this.backing);
  }

  function _createLFBPlayButton() {

    var content = tplBtn({
      label: 'Play',
      classes: 'btn-play'
    });

    this.playButton = new Surface({
      content: content,
    });

    this.playButton.setClasses([
      'stage-level-back',
      'stage-'+this.options.stage,
      'stage-level--color'+this.options.color
    ]);

    this.playButtonMod = new StateModifier({
      size: [this.options.width-50, 50],
      origin: [0.5, 1],
      align: [0.5, 1],
      transform: Transform.translate(0, -50, 0)
    });

    this.node.add(this.playButtonMod).add(this.playButton);
  }

  module.exports = LevelView;
});
