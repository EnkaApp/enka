/* globals define */
define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var EventHandler  = require('famous/core/EventHandler');
  var MouseSync     = require('famous/inputs/MouseSync');
  var TouchSync     = require('famous/inputs/TouchSync');
  var GenericSync   = require('famous/inputs/GenericSync');
  var Transitionable = require('famous/transitions/Transitionable');
  var GridController = require('../GridController');
  
  var xStart, yStart, xEnd, yEnd;

  GenericSync.register({
    'touch': TouchSync
  });

  var sync = new GenericSync({
    "mouse"  : {},
    "touch"  : {},
    // "scroll" : {scale : .5}
  });
   
  function _createBackground() {
    this.bgSurface = new Surface({
      size: [window.innerWidth, window.innerHeight],
      properties: {
        backgroundColor: 'black'
      }
    });

    this.add(this.bgSurface);
  }

  

  function BoardView() {

        // INITIAL SETUP
// ----------------------------------------------------------------------

    View.apply(this, arguments);
    //store this.columns and rows
    this.columns = this.options.dimensions[0];
    var rows = this.options.dimensions[1];
    console.log('this.columns: ', this.columns);
    console.log('rows: ', rows);

    // index variables;
    // currentIndex starts at center
    var currentIndex = this.getCenterIndex();
    console.log('startIndex (center): ', this.getCenterIndex())
    var previousIndex;
    var nextIndex;

    // creates blackBackground
    _createBackground.call(this);

    // size of viewport
    var viewSize = this.getSize();
    console.log('viewPortSize: ', viewSize);

    //creates array of state, set to null
    //gives us access to this.gridControllerMethods
    this.gridController = new GridController(this.dimensions);
    console.log('gridState: ', this.gridController._state)








    // SETUP BOARD WITH FIRST PIECE IN CENTER
// ----------------------------------------------------------------------

    // sets piece size based off of view size
    var pieceSize = this.gridController.getPieceSize(viewSize);
    console.log('pieceSize: ', pieceSize);

    // determines coordinates of piece on grid relative to (0, 0)
    // based on index and pieceSize
    var piecePosition = this.gridController.getXYCoords(currentIndex, pieceSize[0]);
    console.log('piecePosition: ', piecePosition);
    console.log('translatePosition x:' + piecePosition[0] +' y:'+ piecePosition[1] + ' z:' + '0' );

    // responsible for placing piece at center (after attaching piece)
    var centerModifier = new StateModifier({
      origin: [0,0],
      align: [0,0],
      size: pieceSize,
      transform: Transform.translate(piecePosition[0], piecePosition[1], 0)
    });

    // attach modifier to board
    var centerNode = this.add(centerModifier);

    var centerPiece = this.gridController.newPiece({
      width: pieceSize[0],
      height: pieceSize[1],
      frontBgColor: 'blue',
      backBgColor: 'red',
      direction: 'left'
    });

    // attach piece to centerModifier to drop piece in middle
    centerNode.add(centerPiece);
    this.gridController._state[currentIndex] = centerPiece.options.frontBgColor;

    // Engine.pipe(sync);
    this.bgSurface.pipe(sync);







        // EVENT LISTENERS
// ----------------------------------------------------------------------



    // BEGIN SYNC.ON(START)
// ----------------------------------------------------------------------

    sync.on('start', function(data){ // add same color piece here
      xStart = data.clientX;
      yStart = data.clientY;
    });
    // END SYNC.ON(START)
// ----------------------------------------------------------------------









// TEMP - toggle changes the color so the animation looks right
var toggle = false;

    // BEGIN SYNC.ON(END)
// ----------------------------------------------------------------------
    sync.on('end', function(data){ // animate 
      xEnd = data.clientX;
      yEnd = data.clientY;
      var direction;










      // GET SWIPE DIRECTION
// ----------------------------------------------------------------------

      // swipe right
      if(xStart < xEnd && (xEnd - xStart > yEnd - yStart) && (xEnd - xStart > yStart - yEnd)){
        console.log('right');
        direction = 'right';
      }
      // swipe left
      if(xStart > xEnd && (xStart - xEnd > yEnd - yStart) && (xStart - xEnd > yStart - yEnd) ){
        console.log('left');
        direction = 'left';
      }
      // swipe down
      if(yStart < yEnd && (yEnd - yStart > xEnd - xStart) && (yEnd - yStart > xStart - xEnd)){
        console.log('down');
        direction = 'down';
      }
      // swipe up
      if(yStart > yEnd && (yStart - yEnd > xEnd - xStart) && (yStart - yEnd > xStart - xEnd) ){
        console.log('up');
        direction = 'up';
      }
      console.log(currentIndex, direction, this.columns)
      var newIndex = this.getNewIndex(currentIndex, direction, this.columns);
      console.log('brokenINdex', newIndex);


      var frontBgColor = 'blue';
      var backBgColor = 'red';

      if (toggle) {
        frontBgColor = 'red';
        backBgColor = 'blue';
      }

      toggle = !toggle;


      if(!this.gridController._state[newIndex]){
        
        var piece = this.gridController.newPiece({
          width: pieceSize[0],
          height: pieceSize[1],
          frontBgColor: frontBgColor,
          backBgColor: backBgColor,
          direction: direction
        });

        console.log('oldIndex: ', currentIndex);
        console.log('newIndex: ', newIndex);
        currentIndex = newIndex;

        var pieceModifier = new StateModifier({
          origin: [0,0],
          align: [0,0],
          size: pieceSize,
          transform: Transform.translate(piecePosition[0], piecePosition[1], 0)
        });

        this.add(pieceModifier).add(piece);
        console.log(piece);
        piece.reflect();

        piecePosition = this.gridController.getXYCoords(currentIndex, pieceSize[0]);
        console.log('cI', currentIndex)
        this.gridController._state[currentIndex] = piece.options.backBgColor;
        console.log('state: ', this.gridController._state);

        this.checkIfHasMatch.call(this, newIndex, piece);
        // checkIfTrapped(newIndex);



      }
      



    }.bind(this)); // <---- END SYNC.ON('END')********************************************

  }// <---- END BOARDVIEW FUNCTION
// *********************************************************************************











    // ADD METHODS
//-------------------------------------------------------------------------

  BoardView.prototype = Object.create(View.prototype);
  BoardView.prototype.constructor = BoardView;

  BoardView.prototype.getCenterIndex = function(){
    var length = this.options.dimensions[0] * this.options.dimensions[1];
    return (length - 1) / 2;
  }

  BoardView.prototype.checkIfHasMatch = function(index, piece){

    var matches = 0;
    if(this.gridController._state[this.getNewIndex(index, 'left', this.columns)] === piece.options.backBgColor){
      matches++;
      console.log(matches);
    }

  }
  BoardView.prototype.checkIfTrapped = function(index){



  }

  BoardView.prototype.getNewIndex = function(currentIndex, direction){
    if(direction === 'left'){
      return currentIndex - 1;
    }
    if(direction === 'right'){
      return currentIndex + 1;
    }
    if(direction === 'up'){
      return currentIndex - this.columns ;
    }
    if(direction === 'down'){
      return currentIndex + this.columns;
    }
  }










// ADD DEFAULT OPTIONS TO BOARVIEW AND AND BOARDVIEW TO EXPORTS
//-------------------------------------------------------------------------


  BoardView.DEFAULT_OPTIONS = {
    dimensions: [5, 7]
  };

  module.exports = BoardView;
});
