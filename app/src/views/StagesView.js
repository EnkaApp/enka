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
      headerSize: this.options.headerHeight
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
    var headerMod = new StateModifier({
      transform: Transform.translate(0,0,0.1)
    });

    var bgMod = new StateModifier({
      transform: Transform.behind
    });

    var iconMod = new StateModifier({
      align: [1, 0.5],
      origin: [1, 0.5],
      transform: Transform.translate(-12,0,0)
    });

    var node = this.layout.header.add(headerMod);
    node.add(bgMod).add(bg);
    node.add(iconMod).add(this.homeIcon);
  }

  // ## Setup layout.content

  function _createScrollViewNode(options) {
    var view = new StageView({
      index: options.index,
      height: options.height,
      backgroundColor: options.backgroundColor,
    });

    view.pipe(this.scrollView);
    view.on('selectStage', this.scrollToStage.bind(this));

    return view;
  }

  function _createScrollView() {
    this.scrollViewNodes = [];
    this.scrollView = new Scrollview({
      // if paginated === true, a click event on a scrollview item 
      // triggers ScrollView.goToNextPage so we can't use it
      // paginated: true
    });

    for (var i = 0; i < 30; i++) {
      var node = _createScrollViewNode.call(this, {
        index: i,
        height: this.options.stripHeight,
        backgroundColor: 'hsl(' + i * 360/30 + ', 100%, 50%)'
      });

      this.scrollViewNodes.push(node);
    }

    this.scrollView.sequenceFrom(this.scrollViewNodes);

    this.scrollView._eventInput.on('end', function() {

      // if we are not at the top edge tell AppView to stop responding 
      // to Touch/Scroll Events
      // if (this.scrollView.getPosition() > 0) {
      if (this.scrollView._scroller.onEdge() !== -1) {
        this._eventOutput.emit('stagesView:scrollViewInContent');
      } else {
        this._eventOutput.emit('stagesView:scrollViewEdgeHit');
      }
    }.bind(this));

    this.scrollView.pipe(this._eventOutput);
  }

  function _createContent() {

    _createScrollView.call(this);

    var mod = new StateModifier({
      size: [undefined, H - this.options.headerHeight],
      transform: Transform.translate(0, 0, 0)
    });

    this.layout.content.add(mod).add(this.scrollView);
  }

  function _setListeners() {
    this.homeIcon.on('click', function() {
      this._eventOutput.emit('nav:loadHome');
    }.bind(this));
  }

  function _getNodeAtIndex(index) {
    return this.scrollViewNodes[index];
  }

  function StagesView() {
    View.apply(this, arguments);

    // _createBackground.call(this);
    _createLayout.call(this);
    _createHeader.call(this);
    _createContent.call(this);
    
    // Init Event Listeners
    _setListeners.call(this);

    // set initial active stage
    this.prevIndex = this.options.activeStage - 1;
    this.activeIndex = this.options.activeStage - 1;
    this.loadStage();
  }

  StagesView.prototype = Object.create(View.prototype);
  StagesView.prototype.constructor = StagesView;

  StagesView.DEFAULT_OPTIONS = {
    headerHeight: 44,
    stripHeight: 100,
    activeStage: 2
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

  function _getYOffset(index, clickY) {
    
    var svPos = this.scrollView.getPosition();

    clickY -= this.options.headerHeight;
    var offset = clickY - clickY % this.options.stripHeight;

    // scrollView position is the number of pixels above the scrollview container
    // that the first visible scrollview node is... so for instance if the bottom 5 pixels
    // of the first visible node is showing and the node height is 100 then the scrollview 
    // position is 95
    //
    // So in order to align the node with the top of the scrollview we need to adjust the
    // offset if the scrollView position is greater than 0 but less than the node height
    if (svPos > 0 && svPos < this.options.stripHeight) {
      if (svPos <= this.options.stripHeight * 0.5) {
        offset -= svPos;
      } else {
        offset += this.options.stripHeight - svPos;
      }
    }

    return offset;
  }

  StagesView.prototype.scrollToStage = function(data) {
    var e = data.event;
    var index = data.index;
    var node = data.node;

    // stop from executing if their is a second click on an already active node
    if (this.activeIndex === index) return;
    this.prevIndex = this.activeIndex;
    this.activeIndex = index;

    var bgColor = data.backgroundColor;
    var transition = {
      duration: 250,
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
    
    var yOffset = _getYOffset.call(this, index, e.y);
    console.log(yOffset);

    Engine.on('prerender', prerender);
    
    transitionable.set(yOffset, transition, complete);
    this.loadStage();
  };

  StagesView.prototype.loadStage = function() {
    var prevNode = _getNodeAtIndex.call(this, this.prevIndex);
    var activeNode = _getNodeAtIndex.call(this, this.activeIndex);
    
    // close the currently expanded node
    if (this.prevIndex !== this.activeIndex) {
      prevNode.contract();
    }

    // open the new node
    activeNode.expand();
  };

  module.exports = StagesView;
});
