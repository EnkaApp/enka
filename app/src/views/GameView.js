/* globals define */
/**
 * GameView contains all the gameplay views, i.e. GameHeaderView and BoardView
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var GameHeaderView = require('./GameHeaderView');
  var HeaderFooterLayout = require("famous/views/HeaderFooterLayout");

  // ## Views
  var BoardView = require('./BoardView');

  function _createBoardView() {

    var layout = new HeaderFooterLayout({
      headerSize: this.options.headerSize
    });

    this.boardView = new BoardView({
      viewHeight: window.innerHeight - this.options.headerSize,
      viewWidth: window.innerWidth - 10
    });

    this.gameHeaderView = new GameHeaderView();

    layout.header.add(this.gameHeaderView);
    layout.content.add(this.boardView);

    this.add(layout);

    // Setup event listeners
    this.boardView.pipe(this.gameHeaderView);
  }

  function GameView() {
    View.apply(this, arguments);

    _createBoardView.call(this);
  }

  GameView.prototype = Object.create(View.prototype);
  GameView.prototype.constructor = GameView;

  GameView.DEFAULT_OPTIONS = {
    headerSize: 44
  };

  module.exports = GameView;
});
