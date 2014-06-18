/* globals define */

/**
 * This is the stages selection menu view
 */
define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Transitionable = require('famous/transitions/Transitionable');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Easing        = require('famous/transitions/Easing');

  // ## Layout
  var Layout        = require('famous/views/HeaderFooterLayout');

  // ## Views
  var Scrollview    = require('famous/views/Scrollview');
  var StageView     = require('views/StageView');

  // ## Shared
  var H = window.innerHeight;

  function _createLayout() {
    this.layout = new Layout({
      headerSize: this.options.headerSize
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, 0, 0.1)
    });

    this.add(mod).add(this.layout);
  }
  
  // function _createBackground() {
  //   this.bg = new Surface({
  //     size: [undefined, undefined],
  //     content: 'Temp',
  //     properties: {
  //       backgroundColor: 'red'
  //     }
  //   });

  //   this.bg.setClasses(['bg-stages']);

  //   var mod = new StateModifier({
  //     transform: Transform.behind
  //   });

  //   this.add(mod).add(this.bg);
  // }

  // ## Setup layout.header

  function _createHeader() {
    var bg = new Surface({
      properties: {
        backgroundColor: 'black'
      }
    });

    this.homeIcon = new Surface({
      size: [true, true],
      content: '<i class="fa fa-2x fa-angle-double-up"></i>',
      properties: {
        color: 'white'
      }
    });

    bg.setClasses(['navbar']);

    // Modifiers
    var bgMod = new StateModifier({
      transform: Transform.behind
    });

    var iconMod = new StateModifier({
      align: [1, 0.5],
      origin: [1, 0.5],
      transform: Transform.translate(-12,0,0)
    });

    this.layout.header.add(iconMod).add(this.homeIcon);
    this.layout.header.add(bgMod).add(bg);
  }

  // ## Setup layout.content

  function _createScrollViewNode(options) {
    var view = new StageView({
      index: options.index,
      height: options.height,
      backgroundColor: options.backgroundColor
    });

    view.pipe(this.scrollView);
    view.on('selectStage', this.loadStage.bind(this));

    // var surface = new Surface({
    //   size: [undefined, options.height],
    //   properties: {
    //     backgroundColor: options.backgroundColor
    //     boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    //   }
    // });

    // surface.pipe(this.scrollView);
    // surface.on('click', this.loadStage);
    // return surface;

    return view;
  }

  function _createScrollView() {
    this.scrollViewNodes = [];
    this.scrollView = new Scrollview({});

    for (var i = 0; i < 40; i++) {
      var node = _createScrollViewNode.call(this, {
        index: i,
        height: this.options.stripHeight,
        backgroundColor: 'hsl(' + i * 360/40 + ', 100%, 50%)'
      });

      this.scrollViewNodes.push(node);
    }

    this.scrollView.sequenceFrom(this.scrollViewNodes);

    this.scrollView._eventInput.on('end', function() {

      // if the current scroll position is greater than 0 then we need to 
      // tell AppView to stop responding to Touch/Scroll Events
      // if (this.scrollView.getPosition() > 0) {
      if (this.scrollView._scroller.onEdge() === -1) {
        this._eventOutput.emit('stagesView:scrollViewInContent');
      } else {
        this._eventOutput.emit('stagesView:scrollViewEdgeHit');
      }
    }.bind(this));

    this.scrollView.pipe(this._eventOutput);
  }

  function _createBody() {

    _createScrollView.call(this);

    var mod = new StateModifier({
      size: [undefined, H - this.options.headerSize],
      transform: Transform.translate(0, 0, 0)
    });

    this.layout.content.add(mod).add(this.scrollView);
  }

  function _setListeners() {
    this.homeIcon.on('click', function() {
      this._eventOutput.emit('nav:loadHome');
    }.bind(this));
  }

  function StagesView() {
    View.apply(this, arguments);

    // _createBackground.call(this);
    _createLayout.call(this);
    _createHeader.call(this);
    _createBody.call(this);
    
    // Init Event Listeners
    _setListeners.call(this);
  }

  StagesView.prototype = Object.create(View.prototype);
  StagesView.prototype.constructor = StagesView;

  StagesView.DEFAULT_OPTIONS = {
    headerSize: 44,
    stripHeight: 100
  };

  /**
   * Taken from famous/views/Scrollview because _shiftOrigin is not exposed
   */
  function _shiftOrigin(amount) {
    var sv = this.scrollView;

    /** @enum */
    var SpringStates = {
        NONE: 0,
        EDGE: 1,
        PAGE: 2
    };

    sv._edgeSpringPosition += amount;
    sv._pageSpringPosition += amount;
    sv.setPosition(sv.getPosition() + amount);
    if (sv._springState === SpringStates.EDGE) {
        sv.spring.setOptions({anchor: [sv._edgeSpringPosition, 0, 0]});
    }
    else if (sv._springState === SpringStates.PAGE) {
        sv.spring.setOptions({anchor: [sv._pageSpringPosition, 0, 0]});
    }
  }

  function _getYOffset(index, clickY, svPos) {
    console.log(svPos, clickY);
    var offset = clickY - clickY % this.options.stripHeight;

    if (this.scrollView._scroller.onEdge() === -1) {
      offset += this.options.headerSize;
    }
    
    return offset;
  }

  StagesView.prototype.loadStage = function(data) {
    console.log('load stage', data, data.event);

    var e = data.event;
    var index = data.index;
    var bgColor = data.backgroundColor;
    var transition = {
      duration: 300,
      curve: 'linear'
    };

    // set up a transitionable that will be used to animate scroll position change
    var transitionable = new Transitionable(0);

    // @NOTE
    // This is hacky... but it works. Unlike with a standard transform where the
    // transformation is calculated from the initial position everytime, _shiftOrigin
    // saves its position on each invocation so we are keeping track of previous moved 
    // moved amount in order to adjust what we pass into _shiftOrigin so that the 
    // move amount doesn't end up accumulating on itself
    var prevMove = 0;

    // function to fire with each Engine 'prerender' event
    var prerender = function() {
      var size = [];
      var move = transitionable.get() - prevMove;
      prevMove = transitionable.get();

      _shiftOrigin.call(this, move);
    }.bind(this);

    var complete = function(){
      Engine.removeListener('prerender', prerender);
    };

    var svPos = this.scrollView.getPosition();
    var yOffset = _getYOffset.call(this, index, e.y, svPos);

    Engine.on('prerender', prerender);
    
    transitionable.set(yOffset, transition, complete);
  };

  // StagesView.prototype.animateStrips = function(e){

  //   if (this.options.active === true) {

  //     this.options.active = false;

  //     var stripIndex = e.index;
  //     var durationBase = 450;

  //     this.backgroundView.colorize(e.bgColor);
  //     this.stripViews[stripIndex].animateIcon();
  //     this.stripViews[stripIndex].animateText(stripIndex);

  //     for(var i = 0; i < this.stripModifiers.length; i++){

  //       if (i < stripIndex){
  //           var yOffset = -this.options.stripHeight;
  //           var duration = durationBase;
  //           var z = i; 

  //       } else if (i > stripIndex) {
  //           var yOffset = 548; 
  //           var duration = durationBase;
  //           var z = i;

  //       } else {
  //           this.stripViews[i].expandBacking();
  //           var yOffset = 0;
  //           var duration = durationBase - 50;
  //           var z = i;
  //       }

  //       //immediately set the z index based on direction...
  //       this.stripModifiers[i].setTransform(
  //       Transform.translate(0, this.options.topOffset + this.options.stripOffset * i, z));


  //       this.animationComplete = false;

  //       this.stripModifiers[i].setTransform(
  //           Transform.translate(0, yOffset, z),{
  //           duration: 500,
  //           curve: Easing.outCubic
  //       }, function() {

  //           //hide all un-selected strips, once...
  //           if (!this.animationComplete) {
  //               this.animationComplete = true;

  //               for(var i = 0; i < this.stripModifiers.length; i++) {

  //                   if (i != stripIndex) {
  //                       this.stripViews[i].hide();
  //                   }

  //               }
  //           }

  //       }.bind(this));
  //     }

  //   };
  // };

  module.exports = StagesView;
});
