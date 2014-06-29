/**
 * GameModel is a singleton and serves as an aggregation point for 
 * information about the game the user is currently playing.
 */

 define(function(require, exports, module) {
  var EventHandler = require('famous/core/EventHandler');
  var OptionsManager = require('famous/core/OptionsManager');

  // ## Dependencies
  var Model = require('models/Model');
  var db = require('localforage');

  // ## Configuration
  var StageConfig = require('StageConfig');

  // @TODO
  function _init() {
    db.ready().then(function() {
      db.getItem('currentGame').then(function(currentGame) {
        // if (currentGame)
      });
    });
  }

  function _setListeners() {
    this._eventInput.on('game:turn++', function() {
      this.options.turns++;
    }.bind(this));

    this._eventInput.on('game:pieceDestroyed++', function() {
      this.options.destroyed++;
    }.bind(this));
  }

  function GameModel() {

    if (GameModel._instance) {
      return GameModel._instance;
    }

    Model.apply(this, arguments);

    _setListeners.call(this);

    GameModel._instance = this;
  }

  GameModel.prototype = Object.create(Model.prototype);
  GameModel.prototype.constructor = GameModel;

  GameModel._instance = null;

  GameModel.DEFAULT_OPTIONS = {
    currentLevel: 1,
    currentStage: 1,
    turns: 0,
    destroyed: 0,
    state: null
  };

  // ## Database Operations

  GameModel.prototype.save = function(data) {
    db.ready().then(function() {
      db.setItem('currentGame', data, function() {
        console.info('Saved current game data');
      });
    }.bind(this));
  };


  GameModel.prototype.delete = function() {
    db.ready().then(function() {
      db.removeItem('currentGame', function() {
        console.info('Deleted current game data');
      });
    });
  };

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  GameModel.prototype.setOptions = function(options) {
    this._optionsManager.patch(options);
  };

  GameModel.prototype.getDescription = function() {
    var stage = new StageConfig(this.options.currentStage);

    return stage.getGameDesc(this.options.currentLevel);
  };

  GameModel.prototype.reset = function() {
    this.setOptions({
      turns: GameModel.DEFAULT_OPTIONS.turns,
      destroyed: GameModel.DEFAULT_OPTIONS.destroyed
    });

    this.save();
  };

  return GameModel;
 });