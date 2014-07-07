
define(function(require, exports, module) {

  // Each 'coords' array contains the grid positions of a level view.
  // Each level view will be animated in using the order that they are declared

  var GAMETYPE_SURVIVAL = 1;
  var GAMETYPE_DESTROY = 2;

  // Possible grid configurations.
  // To be used by levels
  var GRID_TYPES = {
    'small': [4,6],
    'standard': [5,8],
    'large': [6,10],
    'xlarge': [10,10],

    'wide': [8,4],
    'fat': [8,3],

    'tall': [4,8],
    'skinny': [3,8]
  };

  /*
   * @param {int} type - gametype, either GAMETYPE_DESTROY or GAMETYPE_SURVIVAL
   * @param {array} grid - tuple containing the grid col and row size
   * @param {int} goal - win condition, i.e. number of blocks that need to be destroyed or turns survived
   * @param {int} startIndex - where the first piece should be placed
   * @params {array} obstacles - array of indices where obstacles should be placed
   */
  function _getLevelDef(type, grid, goal, startIndex, obstacles) {
    type = type || GAMETYPE_DESTROY;
    goal = goal || 15;

    if (grid && typeof grid === 'string') {
      grid = GRID_TYPES[grid];
    } else if (Array.isArray(grid)) {
      grid = grid;
    } else {
      grid = GRID_TYPES.standard;
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

      // grid to lay out the levels
      grid: [4, 5],

      // Array of level specifications
      levels: [
        _getLevelDef(null, 'large', 2),
        _getLevelDef(null, 'standard', 4),
        _getLevelDef(null, 'standard', 6),
        _getLevelDef(null, 'standard', 8),

        _getLevelDef(GAMETYPE_SURVIVAL, 'standard', 8),
        _getLevelDef(null, 'tall', 6),
        _getLevelDef(null, 'tall', 6),
        _getLevelDef(GAMETYPE_SURVIVAL, 'skinny', 5),

        _getLevelDef(GAMETYPE_SURVIVAL, null, 5),
        _getLevelDef(null, null, 30),
        _getLevelDef(null, 'wide', 10),
        _getLevelDef(null, 'large', 15),

        _getLevelDef(GAMETYPE_SURVIVAL, null, 15),
        _getLevelDef(GAMETYPE_SURVIVAL, 'skinny', 10),
        _getLevelDef(null, 'skinny', 10),
        _getLevelDef(null, 'wide', 15),

        _getLevelDef(GAMETYPE_SURVIVAL, null, 10),
        _getLevelDef(null, null, 10),
        _getLevelDef(GAMETYPE_SURVIVAL, 'tall', 15),
        _getLevelDef(null, 'skinny', 10)
      ]
    },

    // ## Stage 2
    {
      icon: {
        url: '/images/mayan-2.png',
        size: [100,65]
      },
      // grid to lay out the levels
      grid: [4, 5],

      levels: [
        _getLevelDef(GAMETYPE_SURVIVAL, null, 15),
        _getLevelDef(null, 'xlarge', 10),
        _getLevelDef(GAMETYPE_SURVIVAL, 'small', 10),
        _getLevelDef(null, 'tall', 10),

        _getLevelDef(null, 'skinny', 10),
        _getLevelDef(null, 'xlarge', 6),
        _getLevelDef(GAMETYPE_SURVIVAL, 'small', 15),
        _getLevelDef(null, 'tall', 8)
      ]
    },

    // ## Stage 3
    {
      icon: {
        url: '/images/mayan-3.png',
        size: [150,65]
      },

      // grid to lay out the levels
      grid: [4, 5]
    },

    // ## Stage 4
    {
      icon: {
        url: '/images/mayan-4.png',
        size: [200,65]
      },

      // grid to lay out the levels
      grid: [4, 5]
    },

    // ## Stage 5
    {
      icon: {
        url: '/images/mayan-5.png',
        size: [150,65]
      },
      grid: [4, 5]
    },

    // ## Stage 6
    {
      icon: {
        url: '/images/mayan-6.png',
        size: [150,65]
      },

      // grid to lay out the levels
      grid: [4, 5]
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

  StageConfig.GAMETYPE_SURVIVAL = GAMETYPE_SURVIVAL;
  StageConfig.GAMETYPE_DESTROY = GAMETYPE_DESTROY;

  // ## Static Methods

  StageConfig.getStagesCount = function() {
    return STAGES.length;
  };

  // ## Instance Methods

  StageConfig.prototype.getLevelCount = function() {
    return STAGES[this.index].levels.length;
  };

  StageConfig.prototype.getLevelConfig = function(level) {
    return STAGES[this.index].levels[level-1];
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
