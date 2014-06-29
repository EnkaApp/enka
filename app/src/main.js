/* globals define */

define(function(require, exports, module) {
  'use strict';
  // import dependencies
  var Engine = require('famous/core/Engine');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  
  var db = require('localforage');
  var UserModel = require('models/UserModel');
  var GameModel = require('models/GameModel');

  // Configure database (using localforage)
  db.config({
    name: 'enka',
    version: 1.0,
    size: 4980736,
    storeName: 'enka',
    description: 'Stores persistent game information, i.e. current stage, current level, lives'
  });

  // Initialize User Model
  var user = new UserModel();

  // Initialize Game Model
  var game = new GameModel();

  // Views
  var AppView = require('views/AppView');

  // create the main context
  var mainContext = Engine.createContext();

  mainContext.setPerspective(500);

  var appView = new AppView();

  mainContext.add(appView);
});
