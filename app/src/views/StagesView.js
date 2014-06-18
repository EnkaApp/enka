/* globals define */

/**
 * This is the stages selection menu view
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

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
  
  function _createBackground() {
    this.bg = new Surface({
      size: [undefined, undefined],
      content: 'Temp',
      properties: {
        backgroundColor: 'red'
      }
    });

    this.bg.setClasses(['bg-stages']);

    var mod = new StateModifier({
      transform: Transform.behind
    });

    this.add(mod).add(this.bg);
  }

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

  function _createListView() {
    var surfaces = [];
    this.scrollView = new Scrollview({});

    for (var i = 0; i < 40; i++) {
      var surface = new Surface({
        size: [undefined, 100],
        properties: {
          backgroundColor: 'hsl(' + i * 360/40 + ', 100%, 50%)',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }
      });

      surface.pipe(this.scrollView);
      surface.on('click', this.loadStage);

      surfaces.push(surface);
    }

    this.scrollView.sequenceFrom(surfaces);

    this.scrollView._eventInput.on('end', function() {

      // if the current scroll position is greater than 0 then we need to 
      // tell AppView to stop responding to Touch/Scroll Events
      if (this.scrollView.getPosition() > 0) {
        this._eventOutput.emit('stagesView:scrollViewInContent');
      } else {
        this._eventOutput.emit('stagesView:scrollViewEdgeHit');
      }
    }.bind(this));

    this.scrollView._eventInput.pipe(this._eventOutput);

    return this.scrollView;
  }

  function _createBody() {

    this.listView = _createListView.call(this);

    var mod = new StateModifier({
      size: [undefined, H - this.options.headerSize],
      transform: Transform.translate(0, 0, 0)
    });

    this.layout.content.add(mod).add(this.listView);
  }

  function _setListeners() {
    this.homeIcon.on('click', function() {
      this._eventOutput.emit('nav:loadHome');
    }.bind(this));
  }

  function StagesView() {
    View.apply(this, arguments);

    _createBackground.call(this);
    _createLayout.call(this);
    _createHeader.call(this);
    _createBody.call(this);
    
    // Init Event Listeners
    _setListeners.call(this);
  }

  StagesView.prototype = Object.create(View.prototype);
  StagesView.prototype.constructor = StagesView;

  StagesView.DEFAULT_OPTIONS = {
    headerSize: 44
  };

  StagesView.prototype.loadStage = function() {
    console.log('load stage');
  };

  module.exports = StagesView;
});
