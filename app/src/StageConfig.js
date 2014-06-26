
define(function(require, exports, module) {

  // Each 'coords' array contains the grid positions of a level view.
  // Each level view will be animated in using the order that they are declared

  GAMETYPE_SURVIVAL = 1;
  GAMETYPE_DESTROY = 2;

  // Possible grid configurations.
  // To be used by levels
  var GRID_TYPES = {
    'small': [4,4],
    'standard': [5,5],
    'large': [8,8],
    'xlarge': [10,10],
    
    'wide': [8,4],
    'fat': [8,3],

    'tall': [4,8],
    'skinny': [3,8],
  };

  function _getLevelDef(type, grid, goal, startIndex, obstacles) {
    type = type || GAMETYPE_DESTROY;
    goal = goal || 15;

    if (grid && typeof grid === 'string') {
      grid = GRID_TYPES[grid];
    } else if (Array.isArray(grid)) {
      grid = grid;
    } else {
      grid = GRID_TYPES['standard'];
    }

    startIndex = startIndex || Math.floor((grid[0] * grid[1])/2);

    return {
      gametype: type,
      grid: grid,
      goal: goal,
      startIndex: startIndex,
      obstacles: []
    };
  }

  var STAGES = [

    // ## Stage 1
    {
      icon: {
        url: '/images/mayan-1.png',
        size: [50,60]
      },
      grid: [4, 5],

      //  Array of tuples containing level type and difficulty
      levels: [
        _getLevelDef(null, null, 10),
        _getLevelDef(null, null, 15),
        _getLevelDef(null, 'wide', 15),
        _getLevelDef(null, 'large', 15),
        _getLevelDef(GAMETYPE_SURVIVAL, null, 25),

        _getLevelDef(null, 'tall', 25),
        _getLevelDef(null, 'fat', 15),
        _getLevelDef(GAMETYPE_SURVIVAL, 'skinny', 15),
        _getLevelDef(GAMETYPE_SURVIVAL, null, 25),
        _getLevelDef(null, null, 30),

        _getLevelDef(null, 'wide', 25),
        _getLevelDef(null, 'large', 35),
        _getLevelDef(GAMETYPE_SURVIVAL, null, 15),
        _getLevelDef(GAMETYPE_SURVIVAL, 'skinny', 15),
        _getLevelDef(null, 'skinny', 20),

        _getLevelDef(null, 'wide', 25),
        _getLevelDef(GAMETYPE_SURVIVAL, null, 40),
        _getLevelDef(null, null, 15),
        _getLevelDef(GAMETYPE_SURVIVAL, 'tall', 35),
        _getLevelDef(null, 'skinny', 20),

        _getLevelDef(GAMETYPE_SURVIVAL, null, 25),
        _getLevelDef(null, 'xlarge', 40),
        _getLevelDef(GAMETYPE_SURVIVAL, 'small', 20),
        _getLevelDef(null, 'tall', 15),
        _getLevelDef(null, 'skinny', 20),
      ],
    },

    // ## Stage 2
    {
      icon: {
        url: '/images/mayan-2.png',
        size: [110,60]
      },
      grid: [4, 5],
      levels: [
        {
          gametype: GAMETYPE_SURVIVAL,
          goal: 10,
          grid: [2,8],
          startCoord: [1,1]
        }
      ],
    },

    // ## Stage 3
    {
      icon: {
        url: '/images/mayan-3.png',
        size: [130,60]
      },
      grid: [4, 5],
    },

    // ## Stage 4
    {
      icon: {
        url: '/images/mayan-4.png',
        size: [130,60]
      },
      grid: [4, 5],
    },

    // ## Stage 5
    {
      icon: {
        url: '/images/mayan-5.png',
        size: [110,60]
      },
      grid: [4, 5],
    },

    // ## Stage 6
    {
      icon: {
        url: '/images/mayan-6.png',
        size: [108,60]
      },
      grid: [4, 5],
    }
  ];

  function _getGameTypeDesc(type, goal) {
    if (type === GAMETYPE_SURVIVAL) {
      return 'Survive for ' + goal + ' turns to win';
    }
    else if (type === GAMETYPE_DESTROY) {
      return 'Destroy ' + goal + ' blocks to win';
    }
    else {
      return 'This is just a placeholder. We are working hard to bring this to you.';
    }
  }

  function StageConfig(stage) {
    this.index = stage - 1 || 0;
  }

  // ## Static Methods

  StageConfig.getStagesCount = function() {
    return STAGES.length;
  };


  // ## Instance Methods

  StageConfig.prototype.getLevelCount = function() {
    var grid = STAGES[this.index].grid;
    return grid[0] * grid[1];
  };

  StageConfig.prototype.getCols = function() {
    return STAGES[this.index].grid[0];
  };

  StageConfig.prototype.getRows = function() {
    return STAGES[this.index].grid[1];
  };

  StageConfig.prototype.getLevelConfig = function(level) {
    return STAGES[this.index].levels[level];
  };

  StageConfig.prototype.getIcon = function() {
    return STAGES[this.index].icon;
  };

  StageConfig.prototype.getGameDesc = function(level) {
    var levels = STAGES[this.index].levels;
    var levelDef = levels && levels[level-1] || {};
    var type = '';
    var goal = '';

    if (levelDef) {
      type = levelDef.gametype;
      goal = levelDef.goal;
    }
    
    return _getGameTypeDesc(type, goal);
  };

  module.exports = StageConfig;
});