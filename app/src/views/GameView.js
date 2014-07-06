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
  var ContainerSurface    = require('famous/surfaces/ContainerSurface');
  var RenderNode          = require('famous/core/RenderNode');

  // ## Utils
  var utils = require('utils');

  // ## Views
  var BoardView = require('views/BoardView');
  var BoardMenuView = require('views/BoardMenuView');
  var GameHeaderView = require('views/GameHeaderView');
  var OrigamiView = require('views/OrigamiView');

  // ## Controllers
  var GameController = require('controllers/GameController');

  // ## Templates
  var tplMsg = require('hbs!templates/msg');
  var tplBtn = require('hbs!templates/btn');

  var MENU_HEIGHT = 220;

  function _setListeners() {

    var transition = {
      curve: 'linear',
      duration: 300
    };

    // Setup event listeners
    this.boardView.pipe(this.gameHeaderView);
    this.boardView.pipe(this._eventInput);

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

      if (this._fromPage === 'stages') {
        this._eventOutput.emit('nav:loadStages');
      } else {
        this._eventOutput.emit('nav:loadHome');
      }
      
      this.gameHeaderView._eventInput.emit('game:closeMenu');

      // Let the slide animation complete before closing the menu
      Timer.setTimeout(function() {
        _closeMenu.call(this);
      }.bind(this), 600);

    }.bind(this));

    this._eventInput.on('game:load', function(data) {

      this._fromPage = data.fromPage;

      // check to see if the stage/level that is loading is the same
      // as the one that the user has been playing... if not, update
      // the game controller with the new game data
      if (!this._controller.isSameGame(data)) {

        console.info('Loading new game :: stage:', data.stage, ', level:', data.level);

        // update the game controller with the new stage/level info
        this._controller.newGame({
          level: data.level,
          stage: data.stage
        });

        _updateChildView.call(this);
      }

    }.bind(this));

    this.boardView._eventOutput.on('game:won', function(data) {
      _doWinAnimation.call(this, data);
      this._controller.unlockNextLevel();
    }.bind(this));

    this.winBtn.on('click', function() {
      this._eventOutput.emit('nav:loadStages');

      // reset the origami view (i.e win message) but allow the page
      // change plenty of time to complete first
      Timer.setTimeout(function() {
        _resetOrigamiView.call(this);
      }.bind(this), 1250);
    }.bind(this));
  }

  function _updateChildView() {
    this.boardMenuView.update();
    this.boardView.update();

    // @TODO implement these
    // this.gameHeaderView.update();
  }

  function GameView() {
    View.apply(this, arguments);

    this._fromPage = 'home';

    this._controller = new GameController();

    this.gameHeaderView = new GameHeaderView();

    _createBoardView.call(this);
    _createBoardMenuView.call(this);
    _createOrigamiView.call(this);

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

  // ## Private Helpers

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
      rows: this._controller.getRows(),
      columns: this._controller.getCols(),
      startIndex: this._controller.getStartIndex(),
      viewHeight: utils.getViewportHeight() - this.options.headerSize - 2 * this.options.borderWidth[1],
      viewWidth: utils.getViewportWidth() - 2 * this.options.borderWidth[0]
    });
  }

  function _createBoardMenuView() {
    this.boardMenuView = new BoardMenuView({
      height: MENU_HEIGHT
    });

    this.add(this.boardMenuView);
  }

  function _createWinNode() {
    var node = new RenderNode();

    var msg = tplMsg({
      message: 'Level Completed'
    });

    var message = new Surface({
      content: msg,
      classes: ['gameboard', 'gameboard-win']
    });

    var btn = tplBtn({
      label: 'Continue',
      classes: ['btn-continue']
    });

    this.winBtn = new Surface({
      content: btn,
      classes: ['gameboard', 'gameboard-buttons', 'gameboard-win']
    });

    var nodeMod = new StateModifier({
      size: [190, 150],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.translate(0, 0, 1)
    });

    var winBtnMod = new StateModifier({
      size: [190, 50],
      origin: [0.5, 1],
      align: [0.5, 1],
      transform: Transform.translate(0, -20, 1)
    });

    node = node.add(nodeMod);
    node.add(message);
    node.add(winBtnMod).add(this.winBtn);

    this.winMessage = node;
    node._rootModifier = nodeMod;
    node._winBtnModifer = winBtnMod;

    return node;
  }

  function _resetOrigamiView() {
    this.overlayMod.setTransform(Transform.translate(0, 0, -100));
    this.overlayMod.setOpacity(0.001);
    this.origamiMod.setTransform(Transform.translate(0, 0, -100));
    // this.winMessage._rootModifier.setTransform(Transform.translate(0, 0, -100));
    this.origamiView.reset();
  }

  function _createOrigamiView() {

    this.overlay = new Surface({
      classes: ['game-overlay', 'game-win'],
      properties: {
        backgroundColor: '#303030'
      }
    });

    this.overlayMod = new StateModifier({
      origin: [0, 0],
      align: [0, 0],
      transform: Transform.translate(0, 0, -100),
      opacity: 0.001
    });
    
    this.origamiMod = new StateModifier({
      origin: [0, 0],
      align: [0, 0],
      size: [64, 64],
      transform: Transform.translate(0, 0, -100),
    });

    var node = _createWinNode.call(this);
    this.origamiView = new OrigamiView({
      content: node
    });

    // Create the view but make not visible
    this.add(this.overlayMod).add(this.overlay);
    this.add(this.origamiMod).add(this.origamiView);
  }

  function _doWinAnimation(data) {
    var piece = data.piece;
    var lastPieceIndex = data.index;
    var backColor = piece._piece.getOption('backBgColor');
    var width = piece._piece.getOption('width');
    var height = piece._piece.getOption('height');
    var reflectionOrigin = piece._piece.reflectionMod.getOrigin();
    var centerX = utils.getViewportWidth() / 2;
    var centerY = utils.getViewportHeight() / 2;

    // Configure the origami view so that it starts at the same size as the piece
    this.origamiView.setOptions({
      startDimen: width
    });

    // HACKY
    var transform = piece._piece.reflector.backNode._matrix;

    if (reflectionOrigin[0] == 0.5) {

      // Adjust for 'Up' Reflection
      if (reflectionOrigin[1] === 0) {
        transform = Transform.thenMove(transform, [-width/2,-height,1]);
      }
      // Adjust for 'Down' Reflection
      else {
        // transform = Transform.thenMove(transform, [-width/2,height,2]);
        transform = Transform.thenMove(transform, [-width/2,0,1]);
      }
      
    } else if (reflectionOrigin[1] === 0.5) {
      // Adjust for 'Left' Reflection
      if (reflectionOrigin[0] === 0) {
        // transform = Transform.thenMove(transform, [0,-height/2,2]);
        transform = Transform.thenMove(transform, [-width,-height/2,1]);
      }
      // Adjust for 'Right' Reflection
      else {
        // transform = Transform.thenMove(transform, [width,-height/2,2]);
        transform = Transform.thenMove(transform, [0,-height/2,1]);
      }
    }

    // Place the origami view on top of the winning move
    this.origamiMod.setSize([width, height]);

    // This transform calculates the position of the piece and put origamiView on top of it
    var vector = Transform.getTranslate(transform);
    transform = Transform.moveThen(vector, Transform.translate(0, 0, 15));
    this.origamiMod.setTransform(transform);

    // Remove the last piece now that we have its position
    this.boardView.deletePiece(lastPieceIndex);

    // Fade the overlay in
    this.overlayMod.setTransform(Transform.translate(0,0,10));
    this.overlayMod.setOpacity(0.999, {
      curve: 'linear',
      duration: 1500
    });

    // This transform moves origamiView to the middle of the view
    transform = Transform.translate(centerX - width/2, centerY - height/2, 100);
    this.origamiMod.setTransform(transform, {
      curve: 'linear',
      duration: 500
    }, function() {
      this.origamiView.open();
    }.bind(this));
  }

  module.exports = GameView;
});
