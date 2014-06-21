/* globals define */

/**
 * This is the stages stripe (menu item) view
 */
define(function(require, exports, module) {
  var Engine        = require('famous/core/Engine');
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Modifier      = require('famous/core/Modifier');
  var Transitionable = require('famous/transitions/Transitionable');
  var Easing        = require('famous/transitions/Easing');
  var Timer         = require('famous/utilities/Timer');


  // ## Views
  var StageLevelsView = require('views/StageLevelsView');

  // ## View Elements
  function _createBackground() {
    this.bg = new Surface({
      // size: [undefined, this.options.height],
      size: [undefined, undefined],
      content: this.options.content,
      properties: {
        backgroundColor: this.options.backgroundColor,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        color: 'white'
      }
    });

    this.bgMod = new Modifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.node.add(this.bgMod).add(this.bg);
  }

  function _createStageLevelsView() {
    this._levels = new StageLevelsView({
      stage: this.options.index + 1
    });

    var stageMod = new Modifier({
      size: [undefined, undefined],
      origin: [0, 0],
      align: [0, 0]
    });

    this.node.add(this._levels);
  }

  // ## Event Handlers/Listeners    
  function _setListeners() {

    function handleClick(e) {
      this._eventOutput.emit('selectStage', {
        index: this.options.index,
        node: this,
        event: e
      });
    }

    this.bg.pipe(this._eventOutput);
    this.bg.on('click', handleClick.bind(this));
  }

  function StageView() {
    View.apply(this, arguments);

    this._levels = null;

    this.rootModifier = new StateModifier({
      size: [undefined, this.options.currentHeight]
    });

    this.node = this.add(this.rootModifier);

    _createBackground.call(this);
    _createStageLevelsView.call(this);

    _setListeners.call(this);
  }

  StageView.prototype = Object.create(View.prototype);
  StageView.prototype.constructor = StageView;

  StageView.DEFAULT_OPTIONS = {
    index: 0,
    height: 100,
    expandedHeight: window.innerHeight,
    currentHeight: 100,
    content: '',
    backgroundColor: 'blue'
  };

  function _animateSize(options, callback) {
    var transition = {
      duration: 300,
      curve: Easing.inOutQuad
    };

    var start = options.start || 0;
    var end = options.end || 0;
    var axis = options.axis && options.axis.toLowerCase() || 'y';

    var transitionable = new Transitionable(start);

    var prerender = function() {
      var size = [];
      var pixels = transitionable.get();

      if (axis === 'x') {
        size = [pixels, undefined];
      } else if (axis === 'y') {
        size = [undefined, pixels];
      } else {
        size = [pixels, pixels];
      }

      this.rootModifier.setSize(size);
    }.bind(this);

    var complete = function(){
      Engine.removeListener('prerender', prerender);
      
      // Update the currentHeight of the view
      this.options.currentHeight = end;
      
      if (callback) callback();
    }.bind(this);

    Engine.on('prerender', prerender);

    transitionable.set(end, transition, complete);
  }

  StageView.prototype.expand = function() {
    _animateSize.call(this, {
      start: this.options.height,
      end: this.options.expandedHeight,
      axis: 'y'
    }, function () {
      this._levels.showLevels();
    }.bind(this));
  };

  StageView.prototype.contract = function(callback) {
    _animateSize.call(this, {
      start: this.options.expandedHeight,
      end: this.options.height,
      axis: 'y'
    }, function () {
      this._levels.hideLevels();
      if (callback) callback.call(this);
    }.bind(this));
  };

  module.exports = StageView;
});
