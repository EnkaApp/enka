/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Templates
  var tplHomeBtn = require('hbs!templates/homeBtn');

  function _createBacking() {

    var content = tplHomeBtn({
      label: this.options.content
    });

    this.button = new Surface({
      size: [this.options.width, this.options.height],
      content: content
    });

    var classes = ['btn-wrapper'].concat(this.options.classes);
    this.button.setClasses(classes);

    this.buttonMod = new StateModifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.add(this.buttonMod).add(this.button);
  }

  function _createTitle() {
    
    var title = new Surface({
      content: this.options.content,
      properties: {
        pointerEvents: 'none',
        zIndex: 1
      }
    });

    var classes = ['btn-title'].concat(this.options.classes);
    title.setClasses(classes);

    var mod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5,0.5],
      size: [this.options.width, this.options.height],
    });

    this.add(mod).add(title);
  }

  function _setListeners() {
    this.button.on('click', function() {
      this._eventOutput.emit('click');
    }.bind(this));
  }

  function HomeButtonView() {
    View.apply(this, arguments);

    _createBacking.call(this);
    // _createTitle.call(this);

    // Pipe click event up
    _setListeners.call(this);
  }

  HomeButtonView.prototype = Object.create(View.prototype);
  HomeButtonView.prototype.constructor = HomeButtonView;

  HomeButtonView.DEFAULT_OPTIONS = {
    content: 'Click Me!',
    width: 190,
    height: 40,
    classes: []
  };

  module.exports = HomeButtonView;
});
