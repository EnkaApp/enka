define(function(require, exports, module) {
  // ## Dependencies
  var _ = require('lodash');
  var db = require('localforage');

  // ## Famous Dependencies
  var OptionsManager = require('famous/core/OptionsManager');
  var Timer = require('famous/utilities/Timer');

  // ## App Dependencies
  var LivesController = require('controllers/LivesController');

  function _init() {

    db.ready().then(function() {
      
      db.getItem('user').then(function(user) {

        // if user exists in the db, load him/her
        if (user) {
          console.info('Loading user');

          db.getItem('user', function(user) {
            this.setOptions(user);
          }.bind(this));

        }
        // otherwise create a new user
        else {
          console.info('Creating new user');

          if (!this.options.created) {
            this.options.created = Date.now();
          }

          this.save();
        }

      }.bind(this));
    }.bind(this));
  }

  function User(options) {
    
    if (User._instance) {
      return User._instance;
    }

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) this.setOptions(options);
    _.extend(this.options, this.constructor.DEFAULT_OPTIONS);

    // initialize user
    _init.call(this);

    User._instance = this;
  }

  User._instance = null;

  User.DEFAULT_OPTIONS = {
    created: '',
    latestStage: 1, // latest stage progressed to
    latestLevel: 1, // furthest level of latest stage
    lives: 5,
    lastDeath: '',
    lastRecharge: ''
  };

  User.prototype.save = function() {
    db.ready().then(function() {
      db.setItem('user', this.options, function() {
        console.info('Successfully saved user');
      });
    }.bind(this));
  };

  User.prototype.delete = function() {
    db.ready().then(function() {
      db.removeItem('user', function() {
        console.info('Successfully deleted user');
      });
    });
  };

  /**
   * Look up options value by key
   * @method getOptions
   *
   * @param {string} key key
   * @return {Object} associated object
   */
  User.prototype.getOptions = function getOptions() {
      return this._optionsManager.value();
  };

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  User.prototype.setOptions = function setOptions(options) {
      this._optionsManager.patch(options);
  };

  User.prototype.hasUnlockedLevel = function(stage, level) {
    var res = false;

    if (stage < this.options.latestStage) {
      res = true;
    } else if (stage === this.options.latestStage) {
      if (level <= this.options.latestLevel) {
        res = true;
      }
    }

    return res;
  };

  /**
   * 
   */
  User.prototype.getLatestLevel = function() {
    return {
      stage: this.options.latestStage,
      level: this.options.latestLevel
    };
  };

  User.prototype.setLatestLevel = function(stage, level) {

    var options = {
      latestStage: stage,
      latestLevel: level
    };
    
    // update options
    this.setOptions(options);

    // save to database
    this.save();
  };

  module.exports = User;
});