/* globals define */
define(function(require, exports, module) {
  'use strict';
  // import dependencies
  var Engine = require('famous/core/Engine');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var ImageSurface = require('famous/surfaces/ImageSurface');

  // Views
  var AppView = require('views/AppView');

  // create the main context
  var mainContext = Engine.createContext();

  var appView = new AppView();

  mainContext.add(appView);
  // mainContext.add(centerSpinModifier).add(logo);
});
