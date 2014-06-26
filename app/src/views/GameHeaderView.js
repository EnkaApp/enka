/* globals define */

/**
 * GameHeaderView contains all the metagame stuff, i.e. the next pieces
 * display and the current score, lives, etc
 */
define(function(require, exports, module) {
  var View            = require('famous/core/View');
  var Surface         = require('famous/core/Surface');
  var Transform       = require('famous/core/Transform');
  var Easing          = require('famous/transitions/Easing');
  var StateModifier   = require('famous/modifiers/StateModifier');
  
  var PieceGenerator  = require('PieceGenerator');
  var BoardView = require('views/BoardView');

  function GameHeaderView(options) {
    View.apply(this, arguments);
    
    this.pieceGenerator = new PieceGenerator();

    this.upcomingColors = [];

    for(var i = 0; i < 4; i++) {

      var properties = {};
      var pw = this.options.pieceSize[0];

      // create modifier
      var modifier = new StateModifier({
        origin: [0, 0.5],
        align: [0, 0.5],
        transform: Transform.translate(i * (pw + 5), 0, 0)
      });

      // the fourth piece will be used to make the animation look better
      // so it does not need a color
      if (i < 3) {
        properties.backgroundColor = this.pieceGenerator.colorQueue[i];
      }

      var surface = new Surface({
        size: this.options.pieceSize,
        properties: properties
      });

      surface._modifier = modifier;

      this.upcomingColors.push(surface);

      this.add(modifier).add(surface);
    }

    this.pieceGenerator._eventOutput.on('piece:colorsUpdated', function() {
      this.updateColors();
    }.bind(this));

  }
  
  GameHeaderView.prototype = Object.create(View.prototype);
  GameHeaderView.prototype.constructor = GameHeaderView;

  GameHeaderView.prototype.updateColors = function() {

    var pw = this.options.pieceSize[0];

    var transition = {
      // curve: 'easeOut',
      curve: Easing.inExpo,
      duration: 300
    };

    // remove the first piece
    var first = this.upcomingColors[0];
    var second = this.upcomingColors[1];
    var third = this.upcomingColors[2];
    var fourth = this.upcomingColors[3];

    // set the color of the last piece to the latest color
    fourth.setProperties({
      backgroundColor: this.pieceGenerator.colorQueue[2]
    });

    // start transitioning
    first._modifier.setOpacity(0.001, transition);
    fourth._modifier.setOpacity(0.999, {
      curve: 'easeOut',
      duration: 1000
    });

    // shift all the colors
    for (var i = 0; i < this.upcomingColors.length; i++) {
      var surface = this.upcomingColors[i];
      var transform = Transform.translate((i-1) * (pw + 5), 0, 0);

      if (i === 0) {
        surface._modifier.setTransform(transform, transition, function() {
          this._modifier.setTransform(Transform.translate(90, 0, 0));
        }.bind(surface));
      } else {
        surface._modifier.setTransform(transform, transition);
      }
    }

    // change the color of the first piece... add it to the end
    first.setProperties({
      backgroundColor: 'none'
    });

    first = this.upcomingColors.shift();
    this.upcomingColors.push(first);
  };

  GameHeaderView.DEFAULT_OPTIONS = {
    pieceSize: [20, 20]
  };

  module.exports = GameHeaderView;
});
