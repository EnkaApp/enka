define(function(require, exports, module) {
  var _             = require('lodash');
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var CanvasSurface = require('famous/surfaces/CanvasSurface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier      = require('famous/core/Modifier');
  var Transitionable = require('famous/transitions/Transitionable');
  var Easing        = require('famous/transitions/Easing');
  var Timer         = require('famous/utilities/Timer');

  var letters = {
    F: {
      animationChain: ['height', 'width', 'width'],
      surfaces: [{
        origin: [0, 1],
        size: [37, 125],
        backgroundColor: '#282C38',
        translate: Transform.translate(0, 0, 0),
        zIndex: 10
      }, {
        origin: [0, 0],
        size: [80, 37],
        backgroundColor: '#FA1435',
        translate: Transform.translate(0, 0, 0),
        zIndex: 15
      }, {
        origin: [0, 0],
        size: [80, 37],
        backgroundColor: '#18C5DC',
        translate: Transform.translate(0, 46, 0),
        zIndex: 5
      }]
    },

    pyramid: {
      animationChain: ['height', 'height', 'height'],
      surfaces:[{
        origin: [0.5, 1],
        size: [160, 40],
        classes: ['logo', 'logo-brick', 'logo-bottom'],
        translate: Transform.translate(0, 0, 1),
        zIndex: 5
      }, {
        origin: [0.5, 1],
        size: [100, 25],
        classes: ['logo', 'logo-brick', 'logo-middle'],
        translate: Transform.translate(0, -45, 1),
        zIndex: 5
      }, {
        origin: [0.5, 1],
        size: [65, 16],
        classes: ['logo', 'logo-brick', 'logo-top'],
        translate: Transform.translate(0, -75, 1),
        zIndex: 5
      }]
    }
  };

  function _createLetterSurface(options) {
    return new Surface({
      size: [options.width, options.height],
      classes: options.classes || [],
      properties: {
        backgroundColor: options.backgroundColor,
        zIndex: options.zIndex,
        pointerEvents: 'none'
      }
    });
  }

  function _createLetterModifier(options) {
    return new Modifier({
      origin: options.origin,
      transform: options.translate
    });
  }

  function _animateLetterSurface(node, options, duration) {
    var dur = duration || duration === 0 ? duration : 250;

    Timer.setTimeout(function(i) {
      var transition = {duration: dur, curve: Easing.inOutQuad };

      var start = 0;
      var end = !options.width && options.size[0] || !options.height && options.size[1];

      var transitionable = new Transitionable(start);

      var prerender = function() {
        var width = options.width || transitionable.get();
        var height = options.height || transitionable.get();

        node.setOptions({
          size: [width, height]
        });
      };

      var complete = function() {
        Engine.removeListener('prerender', prerender);
      };

      Engine.on('prerender', prerender);

      transitionable.set(end, transition, complete);
    }.bind(this, options.index), options.index * dur);
  }

  function _createLetter(letter) {
    var nodes = [];

    // retrieve the letter definition
    letter = letters[letter];

    for (var i = 0; i < letter.surfaces.length; i++) {
      var options = _.extend({}, letter.surfaces[i]);

      options.index = i;

      if (letter.animationChain[i] === 'width') {
        options.height = options.size[1];
        options.width = 0;
      } else {
        options.height = 0;
        options.width = options.size[0];
      }
      
      var surface = _createLetterSurface(options);
      var modifier = _createLetterModifier(options);

      surface._options = options;

      this._surfaces.push(surface);
      this.add(modifier).add(surface);
    }
  }

  // @NOTE Keep this canvas code here as an example...
  // @TODO Figure out why canvas animations tied into the 'prerender'
  // event don't actually appear on the screen
  // 
  // function _createLetter(letter) {

  //   var options = {
  //     x: 0,
  //     y: 0,
  //     width: 100,
  //     height: 100,
  //     fill: '#000000'
  //   };

  //   var canvas = new CanvasSurface({
  //     canvasSize: [190, 190]
  //   });
    
  //   var context = canvas.getContext('2d');

  //   // Height Transitionable
  //   var transition = {duration: 400, curve: 'linear' };
  //   var start = 0;
  //   var end = options.height;
  //   var transitionable = new Transitionable(start);

  //   function _render() {
  //     // clear the canvas
  //     context.clearRect(0, 0, canvas.width, canvas.height);

  //     var height = transitionable.get();

  //     console.log(height);

  //     // draw the letter
  //     context.beginPath();
  //     context.rect(options.x, options.y, height, height);
  //     context.fillStyle = options.fill;
  //     context.fill();
  //   }

  //   Engine.on('prerender', _render);

  //   var complete = function() {
  //     Engine.removeListener('prerender', _render);
  //     // this.letter = canvas;
  //     // if (callback) callback();
  //   };

  //   // start the drawing process
  //   // _render();

  //   transitionable.set(end, transition, complete);

  //   this.letter = canvas;
  // }

  function LetterView() {
    View.apply(this, arguments);

    this._surfaces = [];

    _createLetter.call(this, this.options.letter);

    // this.add(this.letter);
  }

  LetterView.prototype = Object.create(View.prototype);
  LetterView.prototype.constructor = LetterView;

  LetterView.DEFAULT_OPTIONS = {
    letter: 'pyramid'
  };

  LetterView.prototype.show = function(callback) {
    var dur = 250;

    for (var i = 0; i < this._surfaces.length; i++) {
      var surface = this._surfaces[i];
      _animateLetterSurface(surface, surface._options, dur);
    }

    Timer.setTimeout(function() {
      if (callback) callback();
    }, dur * this._surfaces.length);
  };

  module.exports = LetterView;
});