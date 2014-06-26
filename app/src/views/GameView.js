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

  // function _createContainer() {
  //   this.container = new ContainerSurface({
  //     size: [undefined, undefined],
  //     properties: {
  //       visibility: 'hidden'
  //     }
  //   });
  // }

  function _createBoardView() {
    var layout = new HeaderFooterLayout({
      headerSize: 44
    });

    this.boardView = new BoardView();
    this.gameHeaderView = new GameHeaderView();

    layout.header.add(this.gameHeaderView);
    layout.content.add(this.boardView);

    this.add(layout);

    // Setup event listeners
    this.boardView.pipe(this.gameHeaderView);
  }

  function GameView() {
    View.apply(this, arguments);

    // _createContainer.call(this);
    _createBoardView.call(this);
  }

  GameView.prototype = Object.create(View.prototype);
  GameView.prototype.constructor = GameView;

  GameView.DEFAULT_OPTIONS = {};

  module.exports = GameView;
});
