/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Views
  var HomeButtonView = require('./HomeButtonView');

  function _createResumeGameButton() {
    this.btnResumeGame = new HomeButtonView({
      content: 'Resume',
      classes: ['btn-resume']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.add(mod).add(this.btnResumeGame);
  }

  function _createPlayButton() {
    this.btnPlay = new HomeButtonView({
      content: 'Stages',
      classes: ['btn-play']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, 50, 0)
    });

    this.add(mod).add(this.btnPlay);
  }

  function _createAboutButton() {
    this.btnAbout = new HomeButtonView({
      content: 'About',
      classes: ['btn-about']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, 100, 0)
    });

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

    _createPlayButton.call(this);
    _createAboutButton.call(this);
    _createResumeGameButton.call(this);

    // Pipe the event up
    _setListeners.call(this);
  }

  HomeMenuView.prototype = Object.create(View.prototype);
  HomeMenuView.prototype.constructor = HomeMenuView;

  HomeMenuView.DEFAULT_OPTIONS = {};

  module.exports = HomeMenuView;
});
