/**
 * This is the top level view. It contains the HomeView, LevelView, GameView
 */
define(function(require, exports, module) {
  var Engine            = require('famous/core/Engine');
  var View              = require('famous/core/View');
  var Surface           = require('famous/core/Surface');
  var Transform         = require('famous/core/Transform');
  var Modifier          = require('famous/core/Modifier');
  var StateModifier     = require('famous/modifiers/StateModifier');
  var Transitionable    = require('famous/transitions/Transitionable');
  var Lightbox          = require('famous/views/Lightbox');
  var Timer             = require('famous/utilities/Timer');

  // ## App Dependencies
  var utils           = require('utils');

  // ## Models and Controllers
  var UserModel       = require('models/UserModel');
  var GameModel       = require('models/GameModel');
  var GameController  = require('controllers/GameController');

  // ## Views
  var BackgroundView  = require('views/BackgroundView');
  var GameView        = require('views/GameView');
  var HomeView        = require('views/HomeView');
  var StagesView      = require('views/StagesView');
  var FpsMeterView    = require('views/FpsMeterView');
  var LogoView        = require('views/LogoView');

  // ## EventSyncs
  var GenericSync   = require('famous/inputs/GenericSync');
  var MouseSync     = require('famous/inputs/MouseSync');
  var TouchSync     = require('famous/inputs/TouchSync');

  // ## Shared
  var PAGE_CHANGE_DURATION = 500;

  // GenericSync.register({
  //   'mouse': MouseSync,
  //   'touch': TouchSync
  // });

  // ## Shared Variables
  var W = utils.getViewportWidth();
  var H = utils.getViewportHeight();
  var userIsLoaded = false;
  var gameIsLoaded = false;
  var gameIsSetup = false;

  function _setListeners() {
    this.stagesView.on('nav:loadHome', function() {
      _slideDown.call(this);
      this.showPage('home');
    }.bind(this));

    this.stagesView.on('nav:loadGame', function(data) {
      
      data.fromPage = 'stages';
      
      _slideLeft.call(this);
      this.gameView._eventInput.emit('game:load', data);
      this.showPage('game');
    }.bind(this));

    this.gameView.on('nav:loadStages', function() {
      _slideRight.call(this);
      this.showPage('stages');
    }.bind(this));

    this.gameView.on('nav:loadHome', function() {
      _slideRight.call(this);
      this.showPage('home');
    }.bind(this));

    this.homeView.on('nav:loadStages', function(){
      _slideUp.call(this);
      this.showPage('stages');
    }.bind(this));

    this.homeView.on('nav:loadGame', function() {
      var data = this.gameController.getOptions();

      data.fromPage = 'home';

      _slideLeft.call(this);
      this.gameView._eventInput.emit('game:load', data);
      this.showPage('game');
    }.bind(this));
  }

  function AppView() {
    View.apply(this, arguments);

    // Initialize Models
    this.gameModel = new GameModel();
    this.userModel = new UserModel();

    // For testing
    // this.userModel.setLatestLevel(1,20);

    this._currentPage = '';
    this._pages = {};

    this.showingHome = true;
    this.delegateToScrollView = false;

    var appModifier = new StateModifier({
      size: [W, H],
      origin: [0, 0],
      align: [0, 0]
    });

    this.node = this.add(appModifier);

    _createLightbox.call(this);
    _createHomeView.call(this);
    _createFPSView.call(this);

    this.showHomePage();

    // Setup the rest of the application once both game and user have loaded

    Engine.on('game:loaded', function(savedGame) {
      gameIsLoaded = true;
      if (userIsLoaded) _setupGame.call(this);
    }.bind(this));

    Engine.on('user:loaded', function() {
      userIsLoaded = true;
      if (gameIsLoaded) _setupGame.call(this);
    }.bind(this));

    // _handleSwipe.call(this);
  }

  AppView.prototype = Object.create(View.prototype);
  AppView.prototype.constructor = AppView;


  // ## Event Handlers/Listeners

  // @TODO 
  // Enable this back in and get it working so you can swipe between pages
  

  // function _handleSwipe() {
  //   var sync = new GenericSync(
  //       ['mouse', 'touch'],
  //       {direction: GenericSync.DIRECTION_Y}
  //   );

  //   this.homeView.pipe(sync);
  //   this.stagesView.pipe(sync);

  //   this.stagesView.on('stagesView:scrollViewEdgeHit', function() {
  //     this.delegateToScrollView = false;
  //     console.log('delegateToScrollView', this.delegateToScrollView);
  //   }.bind(this));

  //   this.stagesView.on('stagesView:scrollViewInContent', function() {
  //     this.delegateToScrollView = true;
  //     console.log('delegateToScrollView', this.delegateToScrollView);
  //   }.bind(this));

  //   sync.on('update', function(data) {
  //     // Only respond to input events if we are not within the scrollView
  //     if (!this.delegateToScrollView) {
  //       var pos = this.homeViewYPos.get();
  //       this.homeViewYPos.set(Math.max(0, pos + -data.delta));
  //     }
  //   }.bind(this));

  //   sync.on('end', function(data) {
  //     // Only respond to input events if we are not within the scrollView
  //     if (!this.delegateToScrollView) {
  //       var velocity = data.velocity;
  //       var position = this.homeViewYPos.get();
      
  //       // Show Stages
  //       if (this.showingHome) {
  //         // If threshold is met, trigger slideUp to show the stagesView
  //         if(position > this.options.posThreshold) {
  //           this.slideUp();
  //           this.showingHome = false;
  //         }
  //         // Otherwise snap the homeView back to its starting position
  //         else {
  //           this.slideDown();
  //         }
  //       }
  //       // Show Home
  //       else {
  //         if(position < H - this.options.posThreshold) {
  //           this.slideDown();
  //           this.showingHome = true;
  //         } else {
  //           this.slideUp();
  //         }
  //       }
  //     }

  //   }.bind(this));
  // }

  AppView.DEFAULT_OPTIONS = {
    lightboxOpts: {
      inTransform: Transform.translate(0, 0, 0),
      showTransform: Transform.translate(0, 0, 0),
      outTransform: Transform.translate(0, 0, 0),
      inTransition: {curve: 'easeOut', duration: PAGE_CHANGE_DURATION},
      outTransition: {curve: 'easeOut', duration: PAGE_CHANGE_DURATION},
      inOpacity: 1,
      outOpacity: 1,
      overlap: true
    }
  };

  AppView.prototype.showPage = function(page) {
    var view = this._pages[page];

    this.lightbox.show(view);

     // save current page
    this._currentPage = page;
  };


  AppView.prototype.showHomePage = function() {
    var options = {
      inTransform: Transform.translate(0, 0, 0)
    };

    this.lightbox.setOptions(options);
    this.showPage('home');
  };

  // ## View Constructors

  function _setupGame() {

    if (gameIsSetup) return;

    // Initialize Controllers
    this.gameController = new GameController();

    console.log(this.gameController.getOptions());

    _createStagesView.call(this);
    _createGameView.call(this);
    _setListeners.call(this);

    // Show the menu
    Timer.setTimeout(function() {
      this.homeView.showMenu();
    }.bind(this), 2000);

    gameIsSetup = true;
  }

  function _createLightbox() {
    this.lightbox = new Lightbox(this.options.lightboxOpts);
    this.node.add(this.lightbox);
  }

  function _createHomeView() {
    this.homeView = new HomeView();
    this._pages.home = this.homeView;
  }

  function _createStagesView() {
    this.stagesView = new StagesView({
      pageChangeDuration: PAGE_CHANGE_DURATION
    });
    this._pages.stages = this.stagesView;
  }

  function _createGameView() {
    this.gameView = new GameView();
    this._pages.game = this.gameView;
  }

  function _createFPSView() {
    this.fpsView = new FpsMeterView();

    var mod = new StateModifier({
      transform: Transform.translate(0, 0, 1000)
    });

    this.node.add(mod).add(this.fpsView);
  }

  // ## Private Helpers

  function _getPageIndex(page) {
    return this._pagesMap[page];
  }

  function _slideLeft() {
    var options = {
      inTransform: Transform.translate(W, 0, 0),
      outTransform: Transform.translate(-W, 0, 0),
    };

    this.lightbox.setOptions(options);
  }

  function _slideRight() {
    var options = {
      inTransform: Transform.translate(-W, 0, 0),
      outTransform: Transform.translate(W, 0, 0),
    };

    this.lightbox.setOptions(options);
  }

  function _slideUp() {
    var options = {
      inTransform: Transform.translate(0, H, 0),
      outTransform: Transform.translate(0, -H, 0),
    };

    this.lightbox.setOptions(options);
  }

  function _slideDown() {
    var options = {
      inTransform: Transform.translate(0, -H, 0),
      outTransform: Transform.translate(0, H, 0),
    };

    this.lightbox.setOptions(options);
  }

  module.exports = AppView;
});
