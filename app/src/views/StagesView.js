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
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var RenderNode    = require('famous/core/RenderNode');
  var SpringTransition = require('famous/transitions/SpringTransition');
  var SnapTransition = require('famous/transitions/SnapTransition');

  // ## Layout
  var Layout        = require('famous/views/HeaderFooterLayout');

  // ## Views
  var Scrollview    = require('famous/views/Scrollview');
  var StageView     = require('views/StageView');

  // ## Shared
  var H = window.innerHeight;

  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

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
      expandedHeight: options.expandedHeight,
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
        expandedHeight: this.options.stripExpandedHeight,
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

    var container = new ContainerSurface({
      size: [undefined, H - this.options.headerHeight],
      properties: {
        overflow: 'hidden'
      }
    });

    // var mod = new StateModifier({
    //   size: [undefined, H - this.options.headerHeight],
    //   transform: Transform.translate(0, 0, 0)
    // });

    container.add(this.scrollView);
    this.layout.content.add(container);
  }

  function _getNodeAtIndex(index) {
    return this.scrollViewNodes[index];
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
    stripExpandedHeight: H - 44, // window height minus the header height
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

  /**
   * Calculates the height of the first visible scrollview item
   */
  function _getFirstVisibleHeight() {
    var svPos = this.scrollView.getPosition();
    var firstIndex = this.scrollView._scroller._node.index;

    if (firstIndex === 0) return 0;

    var firstVisibile = _getNodeAtIndex.call(this, firstIndex);
    var firstHeight = firstVisibile.getSize()[1];
    var height = firstHeight - svPos;

    return height;
  }

  /**
   * Calculates how far up we need to scroll in order to have the
   * top of the item that was click line up with the top of the 
   * scrollview
   */
  function _getYOffset(clickY) {
    var firstVisibileHeight = _getFirstVisibleHeight.call(this);
    var offset = clickY - firstVisibileHeight;
    offset = offset - this.options.headerHeight;
    offset = offset - offset % this.options.stripHeight;
    
    return firstVisibileHeight + offset;
  }

  /**
   * This calls _shiftOrigin
   *
   * @param {number} delta The number of pixels to shift the scrollview origin by. If this
   * number is positive then it will be shift up by that many pixels. Vice versa if down.
   *
   * @param {function} callback The callback function to execute when scrolling is done
   */
  function _scrollOrigin(delta, transition, callback) {

    // set up a transitionable that will be used to animate scroll position change
    var transitionable = new Transitionable(0);

    if (typeof transition === 'function') {
      callback = transition;
      transition = null;
    }

    // default transition
    if (!transition) {
      transition = {
        duration: 200,
        curve: 'linear'
      };
    }

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

    var complete = function() {
      Engine.removeListener('prerender', prerender);
      if(callback) callback();
    }.bind(this);

    Engine.on('prerender', prerender);
    
    transitionable.set(delta, transition, complete);
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
    var yOffset = _getYOffset.call(this, e.y);

    this.expandStage();
    _scrollOrigin.call(this, yOffset, function() {
      this.closeExpanded();
    }.bind(this));
  };

  StagesView.prototype.closeExpanded = function(callback) {
    var prevNode = _getNodeAtIndex.call(this, this.prevIndex);
    var activeNode = _getNodeAtIndex.call(this, this.activeIndex);

    // close the currently expanded node
    if (this.prevIndex !== this.activeIndex) {
      prevNode.contract(callback);
    }
  };

  StagesView.prototype.expandStage = function() {
    var activeNode = _getNodeAtIndex.call(this, this.activeIndex);
    
    // open the new node
    activeNode.expand();
  };

  StagesView.prototype.loadStage = function() {
    this.expandStage();
  };

  module.exports = StagesView;
});
