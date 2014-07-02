/* globals define */

define(function(require, exports, module) {
  var Engine      = require('famous/core/Engine');
  var Modifier    = require('famous/core/Modifier');
  var Transform   = require('famous/core/Transform');
  var RenderNode  = require('famous/core/RenderNode');
  
  // ## App Dependencies
  var db        = require('localforage');
  var UserModel = require('models/UserModel');
  var GameModel = require('models/GameModel');

  // ## Views
  var AppView = require('views/AppView');
  var SplashView = require('views/SplashView');

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
  var hasLoaded = false;

  // Initialize Game Model
  var game = new GameModel();

  // create the main context
  var mainContext = Engine.createContext();

  // create the views
  // var splashView = new SplashView();

  // @TODO use a rendercontroller to show the appView

  // mainContext.add(splashView);
  // splashView.show();

  Engine.on('user:loaded', function() {
    var appView = new AppView();
    mainContext.add(appView);
  });
});
