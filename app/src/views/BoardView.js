/* globals define */

/**
 * BoardView is basically a grid layout with a bunch of surfaces
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var GridLayout    = require('famous/views/GridLayout');

  var boardDimensions = [5,7];

  function _createBackground() {
    var bgSurface = new Surface({
      properties: {
        backgroundColor: 'black'
      }
    });

    this.add(bgSurface);
  }

  function _createSurfaces() {
    var size = boardDimensions[0] * boardDimensions[1];
    var surfaces = [];
    for(var i = 0; i < size; i++){
      surfaces.push(new Surface({
        content: 'panel ' + (i + 1),
        size: undefined,
        properties: {
          color: 'black',
          backgroundColor: 'hsl(100, 100%, 100%)',
          textAlign: 'center'
        }

      }));
    }

    return surfaces;
  }

  function _createGrid(dimensions) {
    var grid = new GridLayout({
      dimensions: dimensions
    });

    var surfaces = _createSurfaces();
    grid.sequenceFrom(surfaces);
    this.add(grid);


  }

  function BoardView() {
    View.apply(this, arguments);

    // add background
    _createBackground.call(this);
    // add grid
    _createGrid.call(this, boardDimensions);
  }

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.DEFAULT_OPTIONS = {};

  module.exports = BoardView;
});
