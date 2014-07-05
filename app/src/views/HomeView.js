/* globals define */

/**
 * This is the Homepage/Game start View
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier      = require('famous/core/Modifier');
  var Timer         = require('famous/utilities/Timer');

  // ## App Dependencies
  var utils         = require('utils');

  // ## Views
  var BackgroundView  = require('views/BackgroundView');
  var HomeMenuView    = require('views/HomeMenuView');
  var LogoView        = require('views/LogoView');

  // ## Shared Variables
  var W = utils.getViewportWidth();
  var H = utils.getViewportHeight();

  function HomeView() {
    View.apply(this, arguments);

    var rootModifier = new StateModifier({
      origin: [0, 0],
      align: [0, 0]
    });

    this.node = this.add(rootModifier);

    _createBackground.call(this);
    _createLogo.call(this);
    _createMenu.call(this);

    // Pipe button events to parent
    _setListeners.call(this);
  }

  HomeView.prototype = Object.create(View.prototype);
  HomeView.prototype.constructor = HomeView;

  HomeView.DEFAULT_OPTIONS = {};

  HomeView.prototype.showLoading = function() {
    this.logo.showLogo();
  };

  HomeView.prototype.showMenu = function() {
    this.logo._mod.setTransform(Transform.translate(0, -100, 0), {
      curve: 'easeOut',
      duration: 300
    });

    this.menuView.showButtons();
  };

  function _createBackground() {
    this.bg = new BackgroundView();

    this.node.add(this.bg);
    
    this.bg.show(null, 300, function() {
      this.logo.showLogo();
    }.bind(this));
  }

  function _createLogo() {
    this.logo = new LogoView();
    
    var mod = new StateModifier({
      size: [W/5 * 3, W/5 * 3],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    this.logo._mod = mod;

    this.node.add(mod).add(this.logo);
  }

  function _createMenu() {
    this.menuView = new HomeMenuView();

    this.menuView.rootMod.setOrigin([0.5, 1]);
    this.menuView.rootMod.setAlign([0.5, 1]);
    this.menuView.rootMod.setTransform(Transform.translate(0, -60, 10));

    this.node.add(this.menuView);
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

  module.exports = HomeView;
});
