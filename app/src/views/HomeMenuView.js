/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transitionable = require('famous/transitions/Transitionable');
  var SpringTransition = require('famous/transitions/SpringTransition');
  var Timer         = require('famous/utilities/Timer');
  var Easing        = require('famous/transitions/Easing');

  Transitionable.registerMethod('spring', SpringTransition);

  // ## App Dependencies
  var utils = require('utils');

  // ## Shared Variables
  var W = utils.getViewportWidth();
  var H = utils.getViewportHeight();

  var TOP_MARGIN = 10; // button top margin
  var DELAY = 300; // milliseconds between button intro animations

  // Button Intro Transition
  var spring = {
    method: 'spring',
    period: 1000,
    dampingRatio: 0.7
  };

  // ## Views
  var HomeButtonView = require('views/HomeButtonView');

  function _setListeners() {
    this.btnPlay.on('click', function() {
      this._eventOutput.emit('nav:loadStages');
    }.bind(this));

    this.btnResumeGame.on('click', function() {
      this._eventOutput.emit('nav:loadGame');
    }.bind(this));

    this.btnAbout.on('click', function() {
      this._eventOutput.emit('nav:showAbout');
    }.bind(this));
  }

  function HomeMenuView() {
    View.apply(this, arguments);

    this.rootMod = new StateModifier({
      size: [190, 150],
      origin: [0.5, 0],
      align: [0.5, 0],
      transform: Transform.translate(0, 0, 0)
    });

    this.node = this.add(this.rootMod);

    // Array of button modifiers
    this._modifiers = [];

    _createResumeGameButton.call(this);
    _createPlayButton.call(this);
    _createAboutButton.call(this);

    // Pipe the event up
    _setListeners.call(this);
  }

  HomeMenuView.prototype = Object.create(View.prototype);
  HomeMenuView.prototype.constructor = HomeMenuView;

  HomeMenuView.DEFAULT_OPTIONS = {
    buttonHeight: 50
  };

  HomeMenuView.prototype.showButtons = function() {
    var margin = this.options.buttonHeight + TOP_MARGIN;

    function _callback(i) {
      this._modifiers[i].setTransform(Transform.translate(0, i*margin, 0), spring);
    }

    for (var i = 0; i < this._modifiers.length; i++) {
      Timer.setTimeout(_callback.bind(this, i), (i+1) * DELAY);
    }
  };

  // ## Private Helpers

  function _createResumeGameButton() {
    this.btnResumeGame = new HomeButtonView({
      content: 'Resume',
      classes: ['btn-resume'],
      height: this.options.buttonHeight
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, H, 0)
    });

    this._modifiers.push(mod);
    this.node.add(mod).add(this.btnResumeGame);

  }

  function _createPlayButton() {
    this.btnPlay = new HomeButtonView({
      content: 'Stages',
      classes: ['btn-play'],
      height: this.options.buttonHeight
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, H, 0)
    });
    
    this._modifiers.push(mod);
    this.node.add(mod).add(this.btnPlay);
  }

  function _createAboutButton() {
    this.btnAbout = new HomeButtonView({
      content: 'About',
      classes: ['btn-about'],
      height: this.options.buttonHeight
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, H, 0)
    });

    this._modifiers.push(mod);
    this.node.add(mod).add(this.btnAbout);
  }

  module.exports = HomeMenuView;
});
