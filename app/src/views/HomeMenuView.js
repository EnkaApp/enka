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

  var TOP_MARGIN = 40; // button top margin
  var DELAY = 300; // milliseconds between button intro animations

  // Button Intro Transition
  var spring = {
    method: 'spring',
    period: 1000,
    dampingRatio: 0.7
  };

  // ## Views
  var HomeButtonView = require('views/HomeButtonView');

  function _createResumeGameButton() {
    this.btnResumeGame = new HomeButtonView({
      content: 'Resume',
      classes: ['btn-resume']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, window.innerHeight / 2, 0)
    });

    this._modifiers.push(mod);
    this.add(mod).add(this.btnResumeGame);

  }

  function _createPlayButton() {
    this.btnPlay = new HomeButtonView({
      content: 'Stages',
      classes: ['btn-play']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, window.innerHeight / 2, 0)
    });
    
    this._modifiers.push(mod);
    this.add(mod).add(this.btnPlay);
  }

  function _createAboutButton() {
    this.btnAbout = new HomeButtonView({
      content: 'About',
      classes: ['btn-about']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, window.innerHeight / 2, 0)
    });

    this._modifiers.push(mod);
    this.add(mod).add(this.btnAbout);
  }

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

  HomeMenuView.DEFAULT_OPTIONS = {};

  HomeMenuView.prototype.showButtons = function() {

      // {
      //   curve: Easing.inSine,
      //   duration: 500
      // }
    
    function _callback(i) {
      this._modifiers[i].setTransform(Transform.translate(0, i*TOP_MARGIN, 0), spring);
    }

    for (var i = 0; i < this._modifiers.length; i++) {
      Timer.setTimeout(_callback.bind(this, i), (i+1) * DELAY);
    }
  };

  module.exports = HomeMenuView;
});
