/* globals define */
/**
 * GameView contains all the gameplay views, i.e. GameHeaderView and BoardView
 */
define(function(require, exports, module) {
  var View                = require('famous/core/View');
  var Surface             = require('famous/core/Surface');
  var Transform           = require('famous/core/Transform');
  var StateModifier       = require('famous/modifiers/StateModifier');
  var HeaderFooterLayout  = require('famous/views/HeaderFooterLayout');
  var Timer               = require('famous/utilities/Timer');

  // ## Views
  var BoardView = require('views/BoardView');
  var BoardMenuView = require('views/BoardMenuView');
  var GameHeaderView = require('views/GameHeaderView');

  var MENU_HEIGHT = Math.floor(window.innerHeight / 2);

  function _setListeners() {

    var transition = {
      curve: 'linear',
      duration: 300
    };

    // Setup event listeners
    this.boardView.pipe(this.gameHeaderView);

    function _closeMenu() {
      var layoutTransform = Transform.translate(0, 0, 1);
      var menuTransform = Transform.translate(0, -MENU_HEIGHT, 1);

      this.layoutMod.setTransform(layoutTransform, transition);
      this.boardMenuView.rootMod.setTransform(menuTransform, transition);
      this.boardView.show();
    }
    
    this.gameHeaderView.on('game:toggleMenu', function(open) {
      if (open) {
        var layoutTransform = Transform.translate(0, MENU_HEIGHT, 1);
        var menuTransform = Transform.translate(0, 0, 1);

        this.layoutMod.setTransform(layoutTransform, transition);
        this.boardMenuView.rootMod.setTransform(menuTransform, transition);
        this.boardView.dim();
      } else {
        _closeMenu.call(this);
      }
    }.bind(this));

    this.boardMenuView.on('game:closeMenu', function() {
      _closeMenu.call(this);
      this.gameHeaderView._eventInput.emit('game:closeMenu');
    }.bind(this));

    this.boardMenuView.on('game:quit', function() {
      this._eventOutput.emit('nav:loadStages');
      this.gameHeaderView._eventInput.emit('game:closeMenu');

      // Let the slide animation complete before closing the menu
      Timer.setTimeout(function() {
        _closeMenu.call(this);
      }.bind(this), 600);

    }.bind(this));

    this._eventInput.on('game:load', function(data) {
      this.boardMenuView.updateOptions(data);
    }.bind(this));
  }

  function GameView() {
    View.apply(this, arguments);

    this.gameHeaderView = new GameHeaderView();

    _createBoardView.call(this);
    _createBoardMenuView.call(this);

    // Call this after layout views have been created
    _createLayout.call(this);

    _setListeners.call(this);
  }

  GameView.prototype = Object.create(View.prototype);
  GameView.prototype.constructor = GameView;

  GameView.DEFAULT_OPTIONS = {
    headerSize: 44,
    borderWidth: [5, 5]
  };

  function _createLayout() {
    this.layout = new HeaderFooterLayout({
      headerSize: this.options.headerSize
    });

    this.layoutMod = new StateModifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.layout.header.add(this.gameHeaderView);
    this.layout.content.add(this.boardView);

    this.add(this.layoutMod).add(this.layout);
  }


  function _createBoardView() {
    this.boardView = new BoardView({
      viewHeight: window.innerHeight - this.options.headerSize - 2 * this.options.borderWidth[1],
      viewWidth: window.innerWidth - 2 * this.options.borderWidth[0]
    });
  }

  function _createBoardMenuView() {
    this.boardMenuView = new BoardMenuView({
      height: MENU_HEIGHT
    });

    this.add(this.boardMenuView);
  }

  module.exports = GameView;
});
