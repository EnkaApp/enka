/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Views
  var HomeButtonView = require('./HomeButtonView');

  function _createPlayButton() {
    this.btnPlay = new HomeButtonView({
      content: 'Play',
      classes: ['btn-play']
    });

    this.add(this.btnPlay);
  }

  function _createAboutButton() {
    this.btnAbout = new HomeButtonView({
      content: 'About',
      classes: ['btn-about']
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, 50, 0)
    });

    this.add(mod).add(this.btnAbout);
  }

  function _setListeners() {
    this.btnPlay.on('nav:loadStages', function() {
      this._eventOutput.emit('nav:loadStages');
    }.bind(this));
  }

  function HomeMenuView() {
    View.apply(this, arguments);

    _createPlayButton.call(this);
    _createAboutButton.call(this);

    // Pipe the event up
    _setListeners.call(this);
  }

  HomeMenuView.prototype = Object.create(View.prototype);
  HomeMenuView.prototype.constructor = HomeMenuView;

  HomeMenuView.DEFAULT_OPTIONS = {};

  module.exports = HomeMenuView;
});
