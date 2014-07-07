define(function(require, exports, module) {
  var Engine = require('famous/core/Engine');
  var Timer = require('famous/utilities/Timer');

  // ## Controller Base
  var Controller = require('controllers/Controller');

  // ## Shared
  var db = require('localforage');
  var isActive = false;

  // ## Constants
  var MAX_LIVES = 5;
  var RECHARGE_TIME = 1 * 60 * 1000; // 15 mins

  function LivesController() {
    if (LivesController._instance) {
      return LivesController._instance;
    }

    Controller.apply(this, arguments);

    LivesController._instance = this;
  }

  LivesController.prototype = Object.create(Controller.prototype);
  LivesController.prototype.constructor = LivesController;

  LivesController._instance = null;

  LivesController.DEFAULT_OPTIONS = {
    lives: 5,
    lastDeath: '',
    lastRecharge: ''
  };

  LivesController.prototype.get = function() {
    return this.options.lives;
  };

  LivesController.prototype.add = function() {
    this.options.lives++;

    // save to the database
    db.ready().then(function() {
      db.setItem('lives', this.options.lives);
    });

    // Inform listeners that we have added a life
    this._eventOutput.emit('lives:addedOne', this.options.lives);
    this._eventOutput.emit('lives:updateCount',this.options.lives);

    if (this.hasMaxLives()) {
      this._eventOutput.emit('lives:isMaxxed',this.options.lives);
    }

    _resetTimer.call(this);
  };

  LivesController.prototype.remove = function() {

    this.options.lives--;

    // save to the database
    db.ready().then(function() {
      db.setItem('lives', this.options.lives);
    });

    // Inform listeners that we have remove a life
    this._eventOutput.emit('lives.removedOne', this.options.lives);
    this._eventOutput.emit('lives:updateCount',this.options.lives);

    // start the timer
    _startTimer.call(this);
  };

  LivesController.prototype.hasMaxLives = function() {
    return this.options.lives === MAX_LIVES;
  };

  LivesController.prototype.hasLives = function() {
    return this.options.lives > 0;
  };

  // ## Private Helper Functions

  function _startTimer() {
    // make sure only one timer is running at a time
    if (!isActive) {
      var elapsedTime = 0;
      var timeRemaining = RECHARGE_TIME;

      var id = Timer.setInterval(function() {
        elapsedTime += 1000;
        timeRemaining = RECHARGE_TIME - elapsedTime;
        this._eventOutput.emit('lives:timeRemaining', _msToMin(timeRemaining));

        if (elapsedTime >= RECHARGE_TIME) {

          // Stop this interval
          Engine.removeListener('prerender', id);

          // Increment lives... which also resets timer if needed
          this.add();
        }
      }.bind(this), 1000);

      isActive = true;
    }
  }

  function _resetTimer() {
    isActive = false;

    if (!this.hasMaxLives()) {
      _startTimer.call(this);
    }
  }

  // ## Utility Functions

  function _msToMin(ms) {
    var s = ms / 1000;
    var seconds = s % 60;
    var mins = (s - seconds) / 60;

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return mins + ':' + seconds;
  }

  module.exports = LivesController;
});
