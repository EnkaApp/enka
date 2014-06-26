/* globals define */

/**
 * GameHeaderView contains all the metagame stuff, i.e. the next pieces
 * display and the current score, lives, etc
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var PieceGenerator = require('../PieceGenerator');
  var StateModifier = require('famous/modifiers/StateModifier');
  var BoardView = require('./BoardView');

  function GameHeaderView(options) {
    View.apply(this, arguments);
    
    this.pieceGenerator = new PieceGenerator();

    this.upcomingColors = [];

    for(var i = 0; i < 3; i++) {

      var pw = this.options.pieceSize[0];

      // create modifier
      var modifier = new StateModifier({
        origin: [0, 0.5],
        align: [0, 0.5],
        transform: Transform.translate(i * (pw + 5), 0, 0)
      });

      var surface = new Surface({
        size: this.options.pieceSize,
        properties: {
          backgroundColor: this.pieceGenerator.colorQueue[i]
        }
      });

      surface._modifier = modifier;

      this.add(modifier).add(surface);
    }

    // var downMod = new StateModifier({ 
    //   origin: [0, 0.5],
    //   align: [0, 0.5],
    //   transform: Transform.translate(0, 0, 0)
    // });

    // var midMod = new StateModifier({
    //   origin: [0, 0.5],
    //   align: [0, 0.5],
    //   transform: Transform.translate(40, 0, 0)
    // });

    // var rightMod = new StateModifier({
    //   origin: [0, 0.5],
    //   align: [0, 0.5],
    //   transform: Transform.translate(, 0, 0)
    // });

    // var node = this.add(downMod);
    // node.add(this.upcomingColors[0])
    // node.add(midMod).add(this.upcomingColors[1]);
    // node.add(rightMod).add(this.upcomingColors[2]);

    this._eventInput.on('piece:colorsUpdated', function() {
      this.updateColors();
    }.bind(this));

  }
  
  GameHeaderView.prototype = Object.create(View.prototype);
  GameHeaderView.prototype.constructor = GameHeaderView;

  GameHeaderView.prototype.updateColors = function(){
    // console.log('colorQueue: ', this.pieceGenerator.colorQueue);
    // this.upcomingColors[0].setProperties({backgroundColor: this.pieceGenerator.colorQueue[0]});
    // this.upcomingColors[1].setProperties({backgroundColor: this.pieceGenerator.colorQueue[1]});
    // this.upcomingColors[2].setProperties({backgroundColor: this.pieceGenerator.colorQueue[2]});
    // console.log('onDeck: ', this.upcomingColors);
  };

  GameHeaderView.DEFAULT_OPTIONS = {
    pieceSize: [20, 20]
  };

  module.exports = GameHeaderView;
});
