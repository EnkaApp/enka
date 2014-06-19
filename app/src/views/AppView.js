/**
 * This is the top level view. It contains the HomeView, LevelView, GameView
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var Modifier      = require('famous/core/Modifier');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Transitionable  = require('famous/transitions/Transitionable');

  // ## Views
  var GameView    = require('views/GameView');
  var HomeView      = require('views/HomeView');
  var StagesView    = require('views/StagesView');

  // ## EventSyncs
  var GenericSync   = require('famous/inputs/GenericSync');
  var MouseSync     = require('famous/inputs/MouseSync');
  var TouchSync     = require('famous/inputs/TouchSync');

  GenericSync.register({
    'mouse': MouseSync,
    'touch': TouchSync
  });

  // ## Shared Variables
  var H = window.innerHeight;
  var W = window.innerWidth;

  // ## View Constructors
  function _createStagesView() {
    this.stagesView = new StagesView();

    this.stagesYModifier = new Modifier({
      transform: function() {
        var h = H - this.homeViewYPos.get();
        return Transform.translate(0, h, 0);
      }.bind(this)
    });

    this.gameXModifier = new Modifier({
      transform: function() {
        return Transform.translate(-this.gameViewXPos.get(), 0, 0);
      }.bind(this)
    });

    this.add(this.stagesYModifier).add(this.gameXModifier).add(this.stagesView);
  }

  function _createHomeView() {
    this.homeView = new HomeView();

    this.homeModifier = new Modifier({
      transform: function() {
        return Transform.translate(0, -this.homeViewYPos.get(), 0);
      }.bind(this)
    });

    this.gameXModifier = new Modifier({
      transform: function() {
        return Transform.translate(-this.gameViewXPos.get(), 0, 0);
      }.bind(this)
    });

    this.add(this.homeModifier).add(this.gameXModifier).add(this.homeView);
  }

  function _createGameView() {
    this.gameView = new GameView();

    this.gameModifier = new Modifier({
      opacity: function() {
        return this.gameViewOpacity.get();
      }.bind(this),
      transform: function() {
        var w = W - this.gameViewXPos.get();
        return Transform.translate(w, 0, 0);
      }.bind(this)
    });

    this.add(this.gameModifier).add(this.gameView);
  }


  // ## Event Handlers/Listeners

  function _handleSwipe() {
    var sync = new GenericSync(
        ['mouse', 'touch'],
        {direction: GenericSync.DIRECTION_Y}
    );

    this.homeView.pipe(sync);
    this.stagesView.pipe(sync);

    this.stagesView.on('stagesView:scrollViewEdgeHit', function() {
      this.delegateToScrollView = false;
      console.log('delegateToScrollView', this.delegateToScrollView);
    }.bind(this));

    this.stagesView.on('stagesView:scrollViewInContent', function() {
      this.delegateToScrollView = true;
      console.log('delegateToScrollView', this.delegateToScrollView);
    }.bind(this));

    sync.on('update', function(data) {
      // Only respond to input events if we are not within the scrollView
      if (!this.delegateToScrollView) {
        var pos = this.homeViewYPos.get();
        this.homeViewYPos.set(Math.max(0, pos + -data.delta));
      }
    }.bind(this));

    sync.on('end', function(data) {
      // Only respond to input events if we are not within the scrollView
      if (!this.delegateToScrollView) {
        var velocity = data.velocity;
        var position = this.homeViewYPos.get();
      
        // Show Stages
        if (this.showingHome) {
          // If threshold is met, trigger slideUp to show the stagesView
          if(position > this.options.posThreshold) {
            this.slideUp();
            this.showingHome = false;
          }
          // Otherwise snap the homeView back to its starting position
          else {
            this.slideDown();
          }
        }
        // Show Home
        else {
          if(position < H - this.options.posThreshold) {
            this.slideDown();
            this.showingHome = true;
          } else {
            this.slideUp();
          }
        }
      }

    }.bind(this));
  }

  function _setListeners() {
    this.stagesView.on('nav:loadHome', function() {
      this.slideDown();
    }.bind(this));

    this.homeView.on('nav:loadStages', function(){
      this.slideUp();
    }.bind(this));

    this.homeView.on('nav:loadGame', function() {
      this.slideLeft();
    }.bind(this));
  }

  function AppView() {
    View.apply(this, arguments);

    this.showingHome = true;
    this.delegateToScrollView = false;
    
    // @NOTE homeViewYPos indicates the number of pixels ABOVE the top of the
    // document that homeView is currently positioned. 
    // Also keep in mind that stagesView moves inversely to homeViewYPos.
    this.homeViewYPos = new Transitionable(0);

    // @NOTE gameViewXPos indicates the number of pixels RIGHT of the right edge
    // of the document that gameView is currently positioned. 
    // Also keep in mind that stagesView and homeView moves inversely to gameViewXPos.
    this.gameViewXPos = new Transitionable(0);
    this.gameViewOpacity = new Transitionable(0);

    _createStagesView.call(this);
    _createHomeView.call(this);
    _createGameView.call(this);

    // Initialize Event Handlers
    _setListeners.call(this);
    _handleSwipe.call(this);
  }

  AppView.prototype = Object.create(View.prototype);
  AppView.prototype.constructor = AppView;

  AppView.DEFAULT_OPTIONS = {
    transition: {
      duration: 500,
      curve: 'easeOut',
    },
    posThreshold: H/4,
    velThreshold: 0.75
  };

  AppView.prototype.slideUp = function() {
    this.homeViewYPos.set(H, this.options.transition, function() {
      this.showingHome = false;
    });
  };

  AppView.prototype.slideDown = function() {
    this.homeViewYPos.set(0, this.options.transition, function() {
      this.showingHome = true;
    });
  };

  AppView.prototype.slideLeft = function() {
    this.gameViewOpacity.set(1);
    this.gameViewXPos.set(W, this.options.transition, function() {
      this.showingStages = false;
    });
  };

  AppView.prototype.slideRight = function() {
    this.gameViewXPos.set(0, this.options.transition, function() {
      this.showingStages = true;
    });
  };

  module.exports = AppView;
});
