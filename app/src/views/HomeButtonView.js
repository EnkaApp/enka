/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  function _createBackground() {
    this.buttonBackground = new Surface({
      size: [this.options.width, this.options.height]
    });

    var classes = ['btn-bg'].concat(this.options.classes);
    this.buttonBackground.setClasses(classes);

    this.add(this.buttonBackground);
  }

  function _createTitle() {
    
    var title = new Surface({
      content: this.options.content,
      properties: {
        pointerEvents: 'none'
      }
    });

    var classes = ['btn-title'].concat(this.options.classes);
    title.setClasses(classes);

    var mod = new StateModifier({
      transform: Transform.translate(0, 6, 0)
    });

    this.add(mod).add(title);
  }

  function _setListeners() {
    this.buttonBackground.on('click', function() {
      this._eventOutput.emit('nav:loadStages');
    }.bind(this));
  }

  function HomeButtonView() {
    View.apply(this, arguments);

    _createBackground.call(this);
    _createTitle.call(this);

    // Pipe click event up
    _setListeners.call(this);
  }

  HomeButtonView.prototype = Object.create(View.prototype);
  HomeButtonView.prototype.constructor = HomeButtonView;

  HomeButtonView.DEFAULT_OPTIONS = {
    content: 'Click Me!',
    width: 190,
    height: 30,
    classes: []
  };

  module.exports = HomeButtonView;
});
