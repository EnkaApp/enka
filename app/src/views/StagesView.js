/* globals define */

/**
 * This is the stages selection menu view
 */
define(function(require, exports, module) {
  var Engine            = require('famous/core/Engine');
  var View              = require('famous/core/View');
  var Surface           = require('famous/core/Surface');
  var Transform         = require('famous/core/Transform');
  var Transitionable    = require('famous/transitions/Transitionable');
  var StateModifier     = require('famous/modifiers/StateModifier');
  var Easing            = require('famous/transitions/Easing');
  var ContainerSurface  = require('famous/surfaces/ContainerSurface');
  var RenderNode        = require('famous/core/RenderNode');
  var SpringTransition  = require('famous/transitions/SpringTransition');
  var SnapTransition    = require('famous/transitions/SnapTransition');
  var Lightbox          = require('famous/views/Lightbox');
  var Timer             = require('famous/utilities/Timer');

  // ## App Dependencies
  var utils = require('utils');

  // ## Stage Configuration
  var StageConfig = require('StageConfig');

  // ## Layout
  var Layout = require('famous/views/HeaderFooterLayout');

  // ## Views
  var Scrollview  = require('famous/views/Scrollview');
  var LevelsView  = require('views/LevelsView');
  var StageView   = require('views/StageView');

  // ## Controllers
  var LivesController = require('controllers/LivesController');

  // ## Shared Variables
  var W = utils.getViewportWidth();
  var H = utils.getViewportHeight();

  Transitionable.registerMethod('spring', SpringTransition);
  Transitionable.registerMethod('snap', SnapTransition);

  function _setListeners() {
    this.homeIcon.on('click', function() {
      this._eventOutput.emit('nav:loadHome');
    }.bind(this));

    this._eventInput.on('nav:loadGame', function(data) {
      this._eventOutput.emit('nav:loadGame', data);
    }.bind(this));

    // this._eventInput.on('level:select', function() {
      
    // }.bind(this));

    // this._eventInput.on('level:close', function() {

    // }.bind(this));

    this._eventInput.on('stage:close', function(data) {
      this.closeExpanded();
    }.bind(this));
  }

  function StagesView() {
    View.apply(this, arguments);

    // Array of level surfaces to be lightboxed in
    this._stageLevels = [];

    // set initial active stage
    this.prevIndex = this.options.activeStage - 1;
    this.activeIndex = this.options.activeStage - 1;

    _createLayout.call(this);
    _createHeader.call(this);
    _createContent.call(this);
    _createLightbox.call(this);
    
    // Init Event Listeners
    _setListeners.call(this);

    this.loadStage();
  }

  StagesView.prototype = Object.create(View.prototype);
  StagesView.prototype.constructor = StagesView;

  StagesView.DEFAULT_OPTIONS = {
    headerHeight: 44,
    stageHeight: 100,

    // stageExpandedHeight should be larger than actual scrollview container
    // otherwise occassionally when _scrollActiveToTop is called you will be 
    // able to see either a little of the previous or next view. I believe this
    // is due to how the scrollview is being scrolled. For now, this is a pretty
    // good fix
    stageExpandedHeight: H,
    activeStage: 1,
    pageChangeDuration: 500
  };

  StagesView.prototype.scrollToStage = function(data) {
    var e = data.event;
    var index = data.stage - 1;
    var node = data.node;

    this.activeIndex = index;

    // var bgColor = data.backgroundColor;

    this.expandStage(function() {
      _scrollActiveToTop.call(this, function() {
        // animate in the levels
        var levels = this._stageLevels[this.activeIndex];
        this.lightbox.show(levels, null, function() {
          levels.show();
        });
      }.bind(this));
    }.bind(this));
  };

  StagesView.prototype.closeExpanded = function(callback) {
    var activeNode = _getStageAtIndex.call(this, this.activeIndex);

    // close the expanded node
    activeNode.contract(function() {
      this.lightbox.hide();
      if (callback) callback();
    }.bind(this));
  };

  StagesView.prototype.expandStage = function(callback) {
    var activeNode = _getStageAtIndex.call(this, this.activeIndex);
    activeNode.expand(callback);
  };

  /*
   * Only used when this class is first initialized
   */
  StagesView.prototype.loadStage = function() {
    this.expandStage();

    // animate in the levels
    var levels = this._stageLevels[this.activeIndex];
    this.lightbox.show(levels, null, function() {

      // Timer ensures that levels are shown only after the page change animation completes
      Timer.setTimeout(function() {
        levels.show();
      }, this.options.pageChangeDuration + 100);
    }.bind(this));
  };

  // ## Private Helpers

  /*
   * Lightbox is used to conserve memory, otherwise older phones such as the iPhone 4
   * crash when attempting to load the stages + all stage levels
   */
  function _createLightbox() {
    this.lightbox = new Lightbox({
      inTransform: Transform.translate(0, 0, 0),
      showTransform: Transform.translate(0, 0, 0),
      outTransform: Transform.translate(0, 0, 0),
      inOpacity: 1,
      outOpacity: 1,
    });

    var mod = new StateModifier({
      size: [undefined, this.options.stageExpandedHeight],
      transform: Transform.translate(0, 0, 1)
    });

    this.add(mod).add(this.lightbox);
  }

  // ## Create layout

  function _createLayout() {
    this.layout = new Layout({
      headerSize: this.options.headerHeight
    });

    var mod = new StateModifier({
      transform: Transform.translate(0, 0, 0.1)
    });

    this.add(mod).add(this.layout);
  }

  // ## Setup layout.header

  function _createHeader() {

    var livesController = new LivesController();

    // @NOTE TEMP... to be removed
    livesController.remove();

    var headerMod = new StateModifier({
      transform: Transform.translate(0,0,50)
    });

    var node = this.layout.header.add(headerMod);

    // Save the modifier for later reference
    this.layout.header._mod = headerMod;

    // Setup the background
    var bg = new Surface({
      properties: {
        backgroundColor: 'black',
        classes: ['header', 'navbar']
      }
    });

    var bgMod = new StateModifier({
      transform: Transform.behind
    });

    // Setup the home icone
    this.homeIcon = new Surface({
      size: [true, true],
      classes: ['header', 'nav-item'],
      content: '<i class="fa fa-2x fa-angle-double-up"></i>',
    });

    var homeIconMod = new StateModifier({
      align: [1, 0.5],
      origin: [1, 0.5],
      transform: Transform.translate(-12,0,0)
    });

    // Setup lives display
    var livesIcon = new Surface({
      size: [true, true],
      classes: ['header'],
      content: '<i class="fa fa-heart"></i>',
    });

    var livesIconMod = new StateModifier({
      align: [0, 0.5],
      origin: [0, 0.5],
      transform: Transform.translate(12,0,0)
    });

    var livesCounter = new Surface({
      size: [true, true],
      classes: ['header', 'lives-count'],
      content: livesController.get() || '0',
    });

    var livesCounterMod = new StateModifier({
      align: [0, 0.5],
      origin: [0, 0.5],
      transform: Transform.translate(30,0,0)
    });

    // Setup the lives timer
    var timer = new Surface({
      content: '',
      classes: ['header', 'lives-timer'],
    });

    var timerMod = new StateModifier({
      size: [50, 24],
      align: [0, 0.5],
      origin: [0, 0.5],
      transform: Transform.translate(43,0,0)
    });

    // Setup event listeners
    livesController.on('lives:timeRemaining', function(time) {
      timer.setContent('- ' + time);
    });

    livesController.on('lives:isMaxxed', function() {
      timer.setContent('');
    });

    livesController.on('lives:updateCount', function(lives) {
      livesCounter.setContent(lives);
    });

    // Add everything to the scene graph
    node.add(bgMod).add(bg);
    node.add(homeIconMod).add(this.homeIcon);
    node.add(livesIconMod).add(livesIcon);
    node.add(livesCounterMod).add(livesCounter);
    node.add(timerMod).add(timer);
  }

  // ## Setup layout.content

  function _createContent() {

    _createScrollView.call(this);

    var container = new ContainerSurface({
      size: [undefined, H - this.options.headerHeight],
      properties: {
        overflow: 'hidden'
      }
    });

    container.add(this.scrollView);
    this.layout.content.add(container);
  }

  function _createStageView(options) {
    var view = new StageView({
      stage: options.index + 1,
      height: options.height,
      currentHeight: options.currentHeight,
      expandedHeight: options.expandedHeight
    });

    // Pipe all view events to the scrollview so we can scroll and
    // respond to level click events
    view.pipe(this.scrollView);
    view.on('stage:select', this.scrollToStage.bind(this));

    return view;
  }

  function _createStageLevels(options) {
    var view = new LevelsView({
      stage: options.index + 1,
      height: options.height,
      currentHeight: options.currentHeight,
      expandedHeight: options.expandedHeight
    });

    // Send view events to the scrollview so we can respond to level click events
    view.on('stage:close', function(data) {
      this._eventInput.emit('stage:close', data);
    }.bind(this));

    view.on('level:select', function() {
      this._eventInput.emit('level:select');
    }.bind(this));

    view.on('level:close', function() {
      this._eventInput.emit('level:close');
    }.bind(this));

    view.on('nav:loadGame', function(data) {
      this._eventInput.emit('nav:loadGame', data);
    }.bind(this));

    return view;
  }

  function _createScrollView() {
    this._stages = [];
    this.scrollView = new Scrollview();

    for (var i = 0; i < StageConfig.getStagesCount(); i++) {
      var options = {
        index: i,
        height: this.options.stageHeight,
        currentHeight: this.options.stageHeight,
        expandedHeight: this.options.stageExpandedHeight,
      };

      if (this.activeIndex === i) {
        options.currentHeight = this.options.stageExpandedHeight;
        options.active = true;
      }
      
      var stage = _createStageView.call(this, options);
      var levels = _createStageLevels.call(this, options);

      this._stageLevels.push(levels);
      this._stages.push(stage);
    }

    this.scrollView.sequenceFrom(this._stages);

    this.scrollView._eventInput.on('end', function() {

      // if we are not at the top edge tell AppView to stop responding 
      // to Touch/Scroll Events
      if (this.scrollView._scroller.onEdge() !== -1) {
        this._eventOutput.emit('stagesView:scrollViewInContent');
      } else {
        this._eventOutput.emit('stagesView:scrollViewEdgeHit');
      }
    }.bind(this));

    this.scrollView.pipe(this._eventOutput);
  }

  function _scrollActiveToTop(transition, callback) {
    var yOffset = _getYOffset.call(this, this.activeIndex);
    _scrollOrigin.call(this, yOffset, transition, callback);
  }

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

  /*
   * Calculates the height of the first visible scrollview item
   */
  function _getFirstVisibleHeight() {
    // svPos is the number of pixels of the first visible scrollview node that is hidden
    var svPos = this.scrollView.getPosition();
    var firstIndex = this.scrollView._scroller._node.index;

    var firstVisibile = _getStageAtIndex.call(this, firstIndex);
    var firstHeight = firstVisibile.getSize()[1];
    var height = firstHeight - svPos;

    return height;
  }

  /*
   * Calculates how far up we need to scroll in order to have the
   * top of the item that was click line up with the top of the 
   * scrollview
   *
   * @param {float} the pixel coordinate of the Y click position
   * @param {index} the scrollview index of the scroll node that was clicked on
   */
  function _getYOffset(index) {
    var ADJUST = 0; // arbitrary
    var firstIndex = this.scrollView._scroller._node.index;

    // If the first visible index is the clicked index then we are scrolling down
    if (index === firstIndex) {
      var svPos = this.scrollView.getPosition();
      return -svPos;
    }

    var firstVisibileHeight = _getFirstVisibleHeight.call(this);

    // If the clicked index is the one after the first visible just return the height
    if (index === firstIndex + 1) {
      return firstVisibileHeight + ADJUST;
    }

    // Otherwise we calculate offset and add it to the height of the first visible
    var offset = (index - firstIndex - 1) * this.options.stageHeight;

    console.log(offset, firstVisibileHeight + offset + ADJUST);
    
    return firstVisibileHeight + offset + ADJUST;
  }

  /*
   * This calls _shiftOrigin
   *
   * @param {number} delta The number of pixels to shift the scrollview origin by. If this
   * number is positive then it will be shifted up by that many pixels. Vice versa if down.
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
        duration: 300,
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

  function _getStageAtIndex(index) {
    return this._stages[index];
  }

  module.exports = StagesView;
});
