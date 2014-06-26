define(function(require, exports, module) {
  var Engine = require('famous/core/Engine');
  var EventHandler = require('famous/core/EventHandler');
  var OptionsManager = require('famous/core/OptionsManager');
  var Timer = require('famous/utilities/Timer');

  var MAX_LIVES = 5;
  var RECHARGE_TIME = 1 * 60 * 1000; // 15 mins
  
  var db = require('localforage');
  var isActive = false;

  function _msToMin(ms) {
    var s = ms / 1000;
    var seconds = s % 60;
    var mins = (s - seconds) / 60;

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return mins + ':' + seconds;
  }

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
  
  function Lives(options) {
    if (Lives._instance) {
      return Lives._instance;
    }

    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);

    Lives._instance = this;
  }

  Lives._instance = null;

  Lives.DEFAULT_OPTIONS = {
    lives: 5,
    lastDeath: '',
    lastRecharge: '',
  };

  /**
   * Look up options value by key
   * @method getOptions
   *
   * @param {string} key key
   * @return {Object} associated object
   */
  Lives.prototype.getOptions = function getOptions() {
      return this._optionsManager.value();
  };

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  Lives.prototype.setOptions = function setOptions(options) {
      this._optionsManager.patch(options);
  };


  Lives.prototype.get = function() {
    return this.options.lives;
  };

  Lives.prototype.add = function() {
    // this.setOptions({
    //   lives: this.options.lives++
    // });

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

  Lives.prototype.remove = function() {
    // this.setOptions({
    //   lives: this.options.lives--
    // });

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

  Lives.prototype.hasMaxLives = function() {
    return this.options.lives === MAX_LIVES;
  };

  Lives.prototype.hasLives = function() {
    return this.options.lives > 0;
  };

  module.exports = Lives;
});