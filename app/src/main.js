/* globals define */

define(function(require, exports, module) {
  var Engine = require('famous/core/Engine');

  // ## App Dependencies
  var db = require('localforage');

  // ## Views
  var AppView = require('views/AppView');

  // Configure database (using localforage)
  db.config({
    name: 'enka',
    version: 1.0,
    size: 4980736,
    storeName: 'enka',
    description: 'Stores persistent game information, i.e. current stage, current level, lives'
  });

  // create the main context
  var mainContext = Engine.createContext();

  var appView = new AppView();
  mainContext.add(appView);
});
