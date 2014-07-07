/* global console */
/* eslint no-console:0 */

define(function(require, exports, module) {
  var Engine = require('famous/core/Engine');

  // ## Dependencies
  var _ = require('lodash');
  var db = require('localforage');

  // ## App Dependencies
  var Model = require('models/Model');

  // ## StageConfig
  var StageConfig = require('StageConfig');

  function _init() {

    db.ready().then(function() {
      db.getItem('user').then(function(user) {

        // if user exists in the db, load him/her
        if (user) {
          console.info('Loading user', user);
          this.setOptions(user);
        }
        // otherwise create a new user
        else {
          console.info('Creating new user');

          if (!this.options.created) {
            this.options.created = Date.now();
          }

          this.save();
        }

        Engine.emit('user:loaded');

      }.bind(this));
    }.bind(this));
  }

  function UserModel() {

    if (UserModel._instance) {
      // Engine.emit('user:loaded');
      return UserModel._instance;
    }

    Model.apply(this, arguments);

    // this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
    // this._optionsManager = new OptionsManager(this.options);

    // if (options) this.setOptions(options);
    _.extend(this.options, this.constructor.DEFAULT_OPTIONS);

    // initialize UserModel
    _init.call(this);

    UserModel._instance = this;
  }

  UserModel.prototype = Object.create(Model.prototype);
  UserModel.prototype.constructor = UserModel;

  UserModel._instance = null;

  UserModel.DEFAULT_OPTIONS = {
    created: '',
    latestStage: 1, // latest stage progressed to
    latestLevel: 1, // furthest level of latest stage
    lives: 5,
    lastDeath: '',
    lastRecharge: ''
  };

  UserModel.prototype.save = function() {
    db.ready().then(function() {
      db.setItem('user', this.options, function() {
        console.info('Successfully saved user');
      });
    }.bind(this));
  };

  UserModel.prototype.delete = function() {
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
  UserModel.prototype.getOptions = function getOptions() {
      return this._optionsManager.value();
  };

  /*
   *  Set internal options.
   *
   *  @method setOptions
   *  @param {Object} options
   */
  UserModel.prototype.setOptions = function setOptions(options) {
      this._optionsManager.patch(options);
  };

  UserModel.prototype.hasUnlockedLevel = function(stage, level) {
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

  /*
   * Returns users latest level and stage
   */
  UserModel.prototype.getLatestLevel = function() {
    return {
      stage: this.options.latestStage,
      level: this.options.latestLevel
    };
  };

  /*
   * Alias for getLatestLevel
   */
  UserModel.prototype.getLatestStage = function() {
    return this.getLatestLevel();
  };

  UserModel.prototype.setLatestLevel = function(stage, level) {

    // Something is firing this with no info... so stop if there is no info
    // @TODO track down why
    if (!stage || !level) {
      return;
    }

    var options = {
      latestStage: stage,
      latestLevel: level
    };

    // update options
    this.setOptions(options);

    // save to database
    this.save();
  };

  UserModel.prototype.unlockNextLevel = function() {
    var level = this.options.latestLevel;
    var stage = this.options.latestStage;
    var stageConfig = new StageConfig(this.options.latestStage);

    // If we are on the final level of the stage... unlock the next stage
    if (this.options.latestLevel === stageConfig.getLevelCount()) {
      level = 1;
      stage += 1;
    }
    else {
      level += 1;
    }

    this.setLatestLevel(stage, level);
  };

  module.exports = UserModel;
});
