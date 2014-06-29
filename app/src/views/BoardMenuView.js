/* globals define */

define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Controller
  var GameController = require('controllers/GameController');

  // ## Templates
  var tplBtn = require('hbs!templates/btn');

  function _setListeners() {
    this.resumeBtn.on('click', function() {
      console.log('game:closeMenu');
      this._eventOutput.emit('game:closeMenu');
    }.bind(this));

    this.quitBtn.on('click', function() {
      console.log('game:quit');
      this._eventOutput.emit('game:quit');
    }.bind(this));
  }

  function BoardMenuView() {
    View.apply(this, arguments);

    // Retrieve an instance of GameController so that we can
    // get the game description and load it into the view
    this._controller = new GameController();

    this.rootMod = new StateModifier({
      align: [0.5, 0],
      origin: [0.5, 0],
      size: [undefined, this.options.height],
      transform: Transform.translate(0, -this.options.height, 0)
    });

    this._buttons = [];

    this.node = this.add(this.rootMod);

    _createBacking.call(this);
    _createDescription.call(this);
    _createButtons.call(this);
    _setListeners.call(this);

    // Make sure that the description is set
    this.update();
  }

  BoardMenuView.prototype = Object.create(View.prototype);
  BoardMenuView.prototype.constructor = BoardMenuView;

  BoardMenuView.DEFAULT_OPTIONS = {
    height: 100,
    description: ''
  };

  BoardMenuView.prototype.update = function() {
    var options = this._controller.getOptions();

    this.setOptions({
      description: this._controller.getDescription()
    });

    this.desc.setContent(this.options.description);
  };

  function _createBacking() {
    this.backing = new Surface({
      classes: ['gamemenu', 'gamemenu-backing'],
      properties: {
        backgroundColor: 'white'
      }
    });

    this.node.add(this.backing);
  }

  function _createDescription() {
    this.desc = new Surface({
      classes: ['gamemenu', 'gamemenu-description']
    });

    var mod = new StateModifier({
      align: [0.5, 0],
      origin: [0.5, 0],
      size: [undefined, 30],
      transform: Transform.translate(0, 20, 0)
    });

    this.desc._mod = mod;

    this.node.add(mod).add(this.desc);
  }

  function _createButtons() {
    var buttons = [
      {
        label: 'Resume',
        classes: ['btn-resume']
      },

      {
        label: 'Quit',
        classes: ['btn-quit']
      }
    ];

    var mod = new StateModifier({
      size: [undefined, buttons.length * 60],
      origin: [0.5, 1],
      align: [0.5, 1],
      transform: Transform.translate(0, -20, 0)
    });

    this.buttonsNode = this.node.add(mod);

    for (var i = 0; i < buttons.length; i++) {
      _createButton.call(this, i, buttons[i]);
    }
  }

  function _createButton(index, options) {
    var classes;
    var label = options.label || '';
    var height = 50;

    if (Array.isArray(options.classes)) {
      classes = options.classes.join(' ');
    } else {
      classes = options.classes;
    }

    var btn = tplBtn({
      label: label,
      classes: classes
    });

    var surface = new Surface({
      content: btn,
      classes: ['gamemenu', 'gamemenu-buttons']
    });

    // Property label will look like 'resumeBtn'
    var propLabel = label.toLowerCase() + 'Btn';
    this[propLabel] = surface;

    var mod = new StateModifier({
      align: [0.5, 0],
      origin: [0.5, 0],
      size: [200, height],
      transform: Transform.translate(0, index * (height + 10), 0)
    });

    this[propLabel]._mod = mod;

    this._buttons.push(surface);

    this.buttonsNode.add(mod).add(surface);
  }

  module.exports = BoardMenuView;
});
