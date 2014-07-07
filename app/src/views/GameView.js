/* globals define */
/**
 * GameView contains all the gameplay views, i.e. GameHeaderView and BoardView
 */
define(function(require, exports, module) {
  var Engine              = require('famous/core/Engine');
  var View                = require('famous/core/View');
  var Surface             = require('famous/core/Surface');
  var Transform           = require('famous/core/Transform');
  var StateModifier       = require('famous/modifiers/StateModifier');
  var HeaderFooterLayout  = require('famous/views/HeaderFooterLayout');
  var Timer               = require('famous/utilities/Timer');
  var ContainerSurface    = require('famous/surfaces/ContainerSurface');
  var RenderNode          = require('famous/core/RenderNode');
  var Transitionable      = require('famous/transitions/Transitionable');

  // ## Utils
  var utils = require('utils');

  // ## Views
  var BoardView = require('views/BoardView');
  var BoardMenuView = require('views/BoardMenuView');
  var GameHeaderView = require('views/GameHeaderView');

  // ## Controllers
  var GameController = require('controllers/GameController');

  // ## Templates
  var tplMsg = require('hbs!templates/msg');
  var tplBtn = require('hbs!templates/btn');

  // ## Shared
  var W = utils.getViewportWidth();
  var H = utils.getViewportHeight();
  var MENU_HEIGHT = 220;
  
  var MESSAGES = {
    won: [
      'Level Completed',
      'Nothin but net'
    ],
    lost: [
      'Better luck next time',
      'My grandmother plays better than you'
    ]
  };

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

        // update the game controller with the new stage/level info
        this._controller.newGame({
          level: data.level,
          stage: data.stage
        });

        _updateChildView.call(this);
      }

    }.bind(this));

    this.boardView._eventOutput.on('game:won', function(data) {
      _doDoneAnimation.call(this, 'won', data);
      this._controller.unlockNextLevel();
    }.bind(this));

    this.boardView._eventOutput.on('game:lost', function(data) {
      _doDoneAnimation.call(this, 'lost', data);
    }.bind(this));

    this._eventInput.on('game:doneBtnClicked', function(data) {
      var action = data.action;
      
      if (action === 'next' || action === 'quit') {
        
        _resetDoneNode.call(this, 300, function() {
          this._eventOutput.emit('nav:loadStages');
        }.bind(this));

        Timer.setTimeout(function() {
          this._controller.resetGame();
        }.bind(this), 1500);

      } else if (action === 'replay' || action === 'restart') {
        this._controller.resetGame();
        _resetDoneNode.call(this);
      }
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
    _createLevelDoneNode.call(this);

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

  /*
   * Creates the node that displays the won/lost message
   */
  function _createLevelDoneNode() {
    var node = new RenderNode();

    // create the message node
    var message = _createMessageNode.call(this);

    var backing = new Surface({
      properties: {
        borderRadius: '999em'
      }
    });

    var posMod = new StateModifier({
      size: [true, true],
      origin: [0, 0],
      align: [0, 0],
    });

    var backingMod = new StateModifier({
      size: [5, 5],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
      transform: Transform.translate(0, 0, -1),
      opacity: 0.001
    });

    node = node.add(posMod);
    node.add(backingMod).add(backing);

    this._doneNode = node;
    this._doneNode.msg = message;
    this._doneNode._backing = backing;
    this._doneNode._posMod = posMod;
    this._doneNode._backingMod = backingMod;

    this.add(this._doneNode);
    this.add(message);
  }

  function _createMessageNode() {
    var node = new RenderNode();

    // create the buttons
    var buttons = _createButtons.call(this, 2);

    var backing = new Surface();
    var message = new Surface();
    
    var rootMod = new StateModifier({
      size: [250, 150],
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    var backingMod = new StateModifier();
    var messageMod = new StateModifier({
      size: [190, 30],
      origin: [0.5, 0],
      align: [0.5, 0]
    });

    node = node.add(rootMod);

    node._mod = rootMod;
    node._surface = message;
    node._backing = backing;
    node.buttons = buttons;

    backing._mod = backingMod;
    message._mod = messageMod;

    node.add(backingMod).add(backing);
    node.add(messageMod).add(message);

    // add the buttons
    for (var i = 0; i < buttons.length; i++) {
      node.add(buttons[i]);
    }

    return node;
  }

  function _createButtons(count) {
    
    count = count || count === 0 ? count : 2;

    var height = 50;
    var margin = 10;
    var buttonNodes = [];
    var wrapperClasses = ['game', 'level-done', 'btn'];

    function eventHandler(node) {
      this._eventInput.emit('game:doneBtnClicked', node);
    }

    for (var i = 0; i < count; i++) {
      
      var node = new RenderNode();
      
      var surface = new Surface({
        classes: wrapperClasses
      });

      var mod = new StateModifier({
        size: [190, height],
        origin: [0.5, 1],
        align: [0.5, 1],
        transform: Transform.translate(0, -i * (height + margin), 1)
      });

      node._mod = mod;
      node._surface = surface;

      node.add(mod).add(surface);

      buttonNodes.push(node);

      // add event listener
      node._surface.on('click', eventHandler.bind(this, node));
    }

    return buttonNodes;
  }

  function _resetDoneNode(duration, callback) {
    var dur = duration || 1000;

    _hideMessageNode.call(this, dur);
    this._doneNode._backingMod.setSize([5, 5], {duration: dur});
    this._doneNode._backingMod.setOpacity(0.001, {duration: dur}, function() {
      this._doneNode._backingMod.setTransform(Transform.translate(0, 0, -1));
      if (callback) callback();
    }.bind(this));
  }

  function _doDoneAnimation(type, data) {
    var piece = data.piece;
    var backColor = piece._piece.getOption('backBgColor');
    var level = this._controller.getCurrentLevel();
    var vector = _getPieceTranslation.call(this, piece);
    var height = piece._piece.getOption('height');

    // Place the win node on top of the piece
    var posTransform = Transform.thenMove(
      Transform.translate(0,0,500),
      vector
    );

    this._doneNode._posMod.setTransform(posTransform);

    this._doneNode._backing.setClasses([
      'stage-'+level.stage,
      backColor,
      'piece',
      'level-done',
      'backing'
    ]);

    var dur = 1000;
    var backingMod = this._doneNode._backingMod;

    backingMod.setOpacity(0.8, {duration: dur/2});
    backingMod.setSize([H*1.25, H*1.25], {duration: dur}, function() {
      _showMessageNode.call(this, type, 300);
    }.bind(this));
  }

  function _getPieceTranslation(piece) {
    var width = piece._piece.getOption('width');
    var height = piece._piece.getOption('height');
    var reflectionOrigin = piece._piece.reflectionMod.getOrigin();
    var transform = piece._piece.reflector.backNode._matrix;

    // Adjust for the reflector
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

    // Adjust for the done node backing modifier
    transform = Transform.thenMove(transform, [width/2,height/2,1]);

    return Transform.getTranslate(transform);
  }
  
  function _showMessageNode(type, duration) {
    duration = duration || duration === 0 ? duration : 300;


    // configure the message and buttons
    var content = utils.getRandomArrayItem(MESSAGES[type]);

    _setMessage.call(this, content, [type]);
    _setButtons.call(this, type);

    // show the message
    var msg = this._doneNode.msg;
    msg._mod.setOpacity(0.999, {duration: duration});
    msg._mod.setTransform(Transform.translate(0,0,750));

    // show the button
    for (var i = 0; i < msg.buttons.length; i++) {
      var btn = msg.buttons[i];

      btn._mod.setOpacity(0.999, {duration: duration});
    }
  }

  function _hideMessageNode(duration) {
    var msg = this._doneNode.msg;

    msg._mod.setOpacity(0.001, {duration: duration}, function() {
      msg._mod.setTransform(Transform.translate(0,0,-1));
    }.bind(this));

    // hide the buttons
    for (var i = 0; i < msg.buttons.length; i++) {
      var btn = msg.buttons[i];

      btn._mod.setOpacity(0.001, {duration: duration});
    }
  }

  function _setMessage(content, classes) {
    var contentClasses, backingClasses;
    var msg = this._doneNode.msg;
    var defaultBackingClasses = ['game', 'level-done', 'message', 'backing'];
    var defaultContentClasses = ['game', 'level-done', 'message', 'content'];
    
    if (classes) {
      contentClasses = defaultContentClasses.concat(classes);
      backingClasses = defaultBackingClasses.concat(classes);
    } else {
      contentClasses = defaultContentClasses;
      backingClasses = defaultBackingClasses;
    }

    msg._surface.setContent(content);
    msg._surface.setClasses(contentClasses);
    msg._backing.setClasses(backingClasses);
  }

  function _setButtons(type) {
    var buttons;
    var buttonNodes = this._doneNode.msg.buttons;

    if (type === 'won') {
      buttons = [
        {
          label: 'replay',
          classes: ['btn-replay']
        },
        {
          label: 'next',
          classes: ['btn-next']
        }
      ];
    } else {
      buttons = [
        {
          label: 'restart',
          classes: ['btn-restart']
        },
        {
          label: 'quit',
          classes: ['btn-quit']
        }
      ];
    }

    for (var i = 0; i < buttonNodes.length; i++) {
      var node = buttonNodes[i];
      var surface = node._surface;
      var btn = buttons[i];
      var content = tplBtn({
        label: btn.label,
        classes: btn.classes
      });

      surface.setContent(content);
      node.action = btn.label;
    }
  }

  module.exports = GameView;
});
