define(function(require, exports, module) {
  
  // ## Controller Base
  var Controller = require('controllers/Controller');

  // ## Configuration
  var StageConfig = require('StageConfig');

  // ## Models
  var GameModel = require('models/GameModel');

  function _setListeners() {
    this.on('game:turn++', function() {
      this.addTurn();
    }.bind(this));

    this.on('game:destroyed++', function() {
      this.addDestroyed();
    }.bind(this));

    this.pipe(this._model);
  }

  function _init() {
    var stage = new StageConfig(this.options.stage);
    
    this._stage = stage;
    this._config = stage.getLevelConfig(this.options.level);
    this._model = new GameModel();
  }

  function GameController() {

    if (GameController._instance) {
      return GameController._instance;
    }

    Controller.apply(this, arguments);
    _init.call(this);

    GameController._instance = this;
  }

  GameController.prototype = Object.create(Controller.prototype);
  GameController.prototype.constructor = GameController;

  GameController._instance = null;

  GameController.DEFAULT_OPTIONS = {
    stage: 1,
    level: 1,
    turns: 0,
    destroyed: 0,
    state: null
  };

  GameController.prototype.update = function(options) {
    this.setOptions(options);
    _init.call(this);
  };

  GameController.prototype.isSameGame = function(data) {
    return this.options.stage === data.stage && this.options.level === data.level;
  };

  GameController.prototype.getLevelConfig = function() {
    return this._config;
  };

  GameController.prototype.getDescription = function() {
    return this._stage.getGameDesc(this.options.level);
  };

  GameController.prototype.getCols = function() {
    return this._config.grid[0];
  };

  GameController.prototype.getStartIndex = function() {
    return this._config.startIndex;
  };

  GameController.prototype.getRows = function() {
    return this._config.grid[1];
  };

  GameController.prototype.addTurn = function() {
    this.options.turns++;
    
    // check win condition
    if (_hasWon()) this.won();

    // send 'turn++' event to model
    this._eventOutput.emit('game:turn++');
  };

  GameController.prototype.addDestroyed = function() {
    this.options.destroyed++;

    // check win condition
    if (_hasWon()) this.won();

    // send 'destroyed++' event to model
    this._eventOutput.emit('game:destroyed++');
  };

  GameController.prototype.won = function() {
    _reset.call(this); // Reset turns and destroyed

    // Send 'won' event
    this._eventOutput.emit('game:won');
  };

  GameController.prototype.quit = function() {
    _reset.call(this); // Reset turns and destroyed

    // Send 'quit' event and reset the model
    this._eventOutput.emit('game:quit');
  };

  GameController.prototype.resume = function() {
    // retrieve game state from the model

    // send 'resume' event
    this._eventOutput.emit('game:resume');
  };

  GameController.prototype.pause = function() {
    // save game state to model

    // send 'paused' event
    this._eventOutput.emit('game:paused');
  };

  // ## Private Helpers

  function _reset() {
    this.setOptions({
      destroyed: 0,
      turns: 0
    });
  }
  
  function _hasWon() {
    var won = false;
    var gametype = this._config.gametype;
    var goal = this._config.goal;

    if (gametype === StageConfig.GAMETYPE_SURVIVAL) {
      if (this.options.turns >= goal) won = true;
    } else if (gametype === StageConfig.GAMETYPE_DESTROY) {
      if (this.options.destroyed >= goal) won = true;
    }

    return won;
  }

  module.exports = GameController;
});