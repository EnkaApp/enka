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

  function _createLogo() {
    var logo = new LogoView();

    this.layout.branding.add(logo);
  }

  function _createMenu() {
    var menu = new HomeMenuView();

    this.layout.menu.add(menu);
  }

  function HomeView() {
    View.apply(this, arguments);

    this.layout = new HomeLayout();

    _createLogo.call(this);
    _createMenu.call(this);

    this.add(this.layout);
  }

  HomeView.prototype = Object.create(View.prototype);
  HomeView.prototype.constructor = HomeView;

  HomeView.DEFAULT_OPTIONS = {};

  module.exports = HomeView;
});
