
define(function(require, exports, module) {

  // Each 'coords' array contains the grid positions of a level view.
  // Each level view will be animated in using the order that they are declared

  GAMETYPE_SURVIVAL = 1;
  GAMETYPE_DESTROY = 2;

  var stages = [

    // ## Stage 1
    {
      icon: {
        url: '/images/mayan-1.png',
        size: [50,60]
      },
      grid: [4, 5],
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
  }

  function StageConfig(stage) {
    this.index = stage - 1 || 0;
  }

  // ## Static Methods

  StageConfig.getStagesCount = function() {
    return stages.length;
  };


  // ## Instance Methods

  StageConfig.prototype.getLevelCount = function() {
    var grid = stages[this.index].grid;
    return grid[0] * grid[1];
  };

  StageConfig.prototype.getCols = function() {
    return stages[this.index].grid[0];
  };

  StageConfig.prototype.getRows = function() {
    return stages[this.index].grid[1];
  };

  StageConfig.prototype.getLevelConfig = function(level) {
    return stages[this.index].levels[level];
  };

  StageConfig.prototype.getIcon = function() {
    return stages[this.index].icon;
  };

  StageConfig.prototype.getGameDesc = function(level) {
    var type = stages[this.index].levels[level-1].gametype;
    var goal = stages[this.index].levels[level-1].goal;
    
    return _getGameTypeDesc(type, goal);
  };

  module.exports = StageConfig;
});