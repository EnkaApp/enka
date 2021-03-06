/* globals define */

/**
 * GameHeaderView contains all the metagame stuff, i.e. the next pieces
 * display and the current score, lives, etc
 */
define(function(require, exports, module) {
  var View            = require('famous/core/View');
  var Surface         = require('famous/core/Surface');
  var Transform       = require('famous/core/Transform');
  var Easing          = require('famous/transitions/Easing');
  var StateModifier   = require('famous/modifiers/StateModifier');

  // ## Controllers
  var PieceController  = require('controllers/PieceController');
  var GameController   = require('controllers/GameController');

  // ## Shared
  var open = true;

  function _setListeners() {
    this._pieceController._eventOutput.on('piece:colorsUpdated', function() {
      this.updateColors();
    }.bind(this));

    this.menuButton.on('click', function() {
      this._eventOutput.emit('game:toggleMenu', open);
      open = !open;
    }.bind(this));

    this._eventInput.on('game:closeMenu', function() {
      open = true;
    });
  }

  function GameHeaderView(options) {
    View.apply(this, arguments);

    this.rootMod = new StateModifier({
      origin: [0.5, 0],
      align: [0.5, 0],
      transform: Transform.translate(0, 0, 200)
    });

    this._pieceController = new PieceController();
    this._gameController = new GameController();

    this.upcomingColors = [];

    this.node = this.add(this.rootMod);

    _createBacking.call(this);
    _createMenuButton.call(this);
    _initPieces.call(this);
    _setListeners.call(this);
  }

  GameHeaderView.prototype = Object.create(View.prototype);
  GameHeaderView.prototype.constructor = GameHeaderView;

  GameHeaderView.prototype.updateColors = function() {

    var level = this._gameController.getCurrentLevel();
    var pw = this.options.pieceSize[0];

    var transition = {
      curve: Easing.inExpo,
      duration: 300
    };

    var first = this.upcomingColors[0];
    var fourth = this.upcomingColors[3];

    // set the color of the last piece to the latest color
    fourth.setClasses(_getClasses.call(this, 2, level.stage, level.level));

    // start transitioning
    first._modifier.setOpacity(0.001, transition);
    fourth._modifier.setOpacity(0.999, {
      curve: 'easeOut',
      duration: 1000
    });

    function callback() {
      this._modifier.setTransform(Transform.translate(90, 0, 0));
    }

    // shift all the colors
    for (var i = 0; i < this.upcomingColors.length; i++) {
      var surface = this.upcomingColors[i];
      var transform = Transform.translate((i-1) * (pw + 5), 0, 0);

      if (i === 0) {
        surface._modifier.setTransform(transform, transition, callback.bind(surface));
      }
      else {
        surface._modifier.setTransform(transform, transition);
      }
    }

    // Move the first piece to the end
    first = this.upcomingColors.shift();
    this.upcomingColors.push(first);
  };

  GameHeaderView.DEFAULT_OPTIONS = {
    pieceSize: [20, 20]
  };

  function _createBacking() {

    this.backing = new Surface({
      classes: ['header', 'navbar', 'game-navbar']
    });

     var backingMod = new StateModifier({
      transform: Transform.behind
    });

    this.node.add(backingMod).add(this.backing);
  }

  function _createMenuButton() {
    this.menuButton = new Surface({
      size: [true, true],
      classes: ['header', 'navbar', 'game-navbar', 'game-navbar-button'],
      content: '<i class="fa fa-2x fa-angle-double-up"></i>'
    });

    var mod = new StateModifier({
      origin: [1, 0.5],
      align: [1, 0.5],
      transform: Transform.translate(-10, 0, 1)
    });

    this.node.add(mod).add(this.menuButton);
  }

  function _initPieces() {

    var level = this._gameController.getCurrentLevel();

    var mod = new StateModifier({
      size: [70, 20],
      origin: [0, 0.5],
      align: [0, 0.5],
      transform: Transform.translate(10, 0, 1)
    });

    var node = this.node.add(mod);

    for (var i = 0; i < 4; i++) {
      var classes;
      var properties = {};
      var pw = this.options.pieceSize[0];

      // create modifier
      var modifier = new StateModifier({
        origin: [0, 0.5],
        align: [0, 0.5],
        transform: Transform.translate(i * (pw + 5), 0, 1)
      });

      // the fourth piece will be used to make the animation look better
      // so it does not need a color
      if (i < 3) {
        // properties.backgroundColor = this._pieceController.colorQueue[i];
        classes = _getClasses.call(this, i, level.stage, level.level);
      }

      var surface = new Surface({
        size: this.options.pieceSize,
        properties: properties,
        classes: classes
      });

      surface._modifier = modifier;

      this.upcomingColors.push(surface);

      node.add(modifier).add(surface);
    }
  }

  function _getClasses(index, stage, level) {
    return [
      'piece',
      'piece-mini',
      'stage-' + stage,
      'level-' + level,
      this._pieceController.colorQueue[index]
    ];
  }

  module.exports = GameHeaderView;
});
