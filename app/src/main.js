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

  // your app here
  // var logo = new ImageSurface({
  //   size: [200, 200],
  //   content: '/content/images/famous_logo.png',
  //   classes: ['backfaceVisibility']
  // });

  // var initialTime = Date.now();
  // var centerSpinModifier = new Modifier({
  //   origin: [0.5, 0.5],
  //   transform : function() {
  //     return Transform.rotateY(0.002 * (Date.now() - initialTime));
  //   }
  // });

  var appView = new AppView();

  mainContext.add(appView);
  // mainContext.add(centerSpinModifier).add(logo);
});
