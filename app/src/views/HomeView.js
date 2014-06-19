/* globals define */

/**
 * This is the Homepage/Game start View
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier = require('famous/core/Modifier');

  // ## Layouts
  var HomeLayout = require('./HomeLayout');

  // ## Views
  var HomeMenuView = require('./HomeMenuView');
  var LogoView = require('./LogoView');

  function _createLayout() {
    this.layout = new HomeLayout({
      menuTopMargin: 80
    });

    var modifier = new StateModifier({
      tranform: Transform.translate(0, 0, 0.1)
    });

    this.add(this.layout);
  }

  function _createBackground() {
    this.bg = new Surface({
      properties: {
        backgroundColor: '#FFFFFF'
      }
    });

    this.bg.setClasses(['bg-home']);

    this.add(this.bg);
  }

  function _createLogo() {
    var logo = new LogoView();

    this.layout.branding.add(logo);
  }

  function _createMenu() {
    this.menuView = new HomeMenuView();

    this.layout.menu.add(this.menuView);
  }

  function _setListeners() {
    this.menuView.on('nav:loadStages', function() {
      this._eventOutput.emit('nav:loadStages');
    }.bind(this));

    this.menuView.on('nav:loadGame', function() {
      this._eventOutput.emit('nav:loadGame');
    }.bind(this));

    // Listen for event from AppView
    this.bg.pipe(this._eventOutput);
  }

  function HomeView() {
    View.apply(this, arguments);

    _createBackground.call(this);
    _createLayout.call(this);
    _createLogo.call(this);
    _createMenu.call(this);

    // Pipe button events to parent
    _setListeners.call(this);

    this.add(this.layout);
  }

  HomeView.prototype = Object.create(View.prototype);
  HomeView.prototype.constructor = HomeView;

  HomeView.DEFAULT_OPTIONS = {};

  module.exports = HomeView;
});
