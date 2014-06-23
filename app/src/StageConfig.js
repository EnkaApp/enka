
define(function(require, exports, module) {

  // Each 'coords' array contains the grid positions of a level view.
  // Each level view will be animated in using the order that they are declared

  var stages = [

    // ## Stage 1
    {
      grid: [5, 7],
      size: [50, 50],
      coords: [
        [2,0],
        [2,1],
        [3,1],
        [4,1],
        [4,2],
        [4,3],
        [3,3],
        [2,3],
        [1,3],
        [0,3],
        [0,4],
        [0,5],
        [1,5],
        [2,5],
      ],
      warp: {
        image: '',
        coord: [2,6]
      }
    },

    // ## Stage 2
    {
      grid: [5, 8],
      size: [50, 50],
      coords: [
        [0,0],
        [1,0],
        [2,0],
        [3,0],
        [4,0],
        [4,1],
        [4,2],
        [4,3],
        [4,4],
        [4,5],
        [4,6],
        [4,7],
        [3,7],
        [2,7],
        [1,7],
        [0,7],
        [0,6],
        [0,5],
        [0,4],
        [0,3],
        [0,2],
        [1,2],
        [2,2],
        [2,3],
        [2,4]
      ],
      warp: {
        image: '',
        coord: [1,3]
      },
      levels: [
        {
          grid: [2,8],
          startCoord: [1,1]
        }
      ],
    },

    // ## Stage 3
    {
      grid: [5, 5],
      size: [50, 50],
      coords: [
        [0,0],
        [1,0],
        [2,0],
        [3,0],
        [4,0],
        [4,1],
        [4,2],
        [3,2],
        [2,2],
        [1,2],
        [0,2],
        [0,3],
        [0,4],
        [1,4],
        [2,4],
        [3,4]
      ],
      warp: {
        image: '',
        coord: [4,4]
      }
    },

    // ## Stage 4
    {
      grid: [5, 7],
      size: [50, 50],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [0,4],
        [0,5],
        [0,6],
        [1,6],
        [2,6],
        [2,5],
        [2,4],
        [2,3],
        [3,3],
        [4,3],
        [4,4],
        [4,5],
      ],
      warp: {
        image: '',
        coord: [4,6]
      }
    },

    // ## Stage 5
    {
      grid: [5, 7],
      size: [50, 50],
      coords: [
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [1,3],
        [1,4],
        [1,5],
        [1,6],
        [2,6],
        [3,6],
        [3,5],
        [3,4],
        [3,3],
        [4,3],
        [4,2],
        [4,1],
        
      ],
      warp: {
        image: '',
        coord: [4,0]
      }
    },

    // ## Stage 6
    {
      grid: [5, 9],
      size: [50, 50],
      coords: [
        [2,0],
        [2,1],
        [2,2],
        [1,2],
        [0,2],
        [0,3],
        [0,4],
        [0,5],
        [1,5],
        [2,5],
        [3,5],
        [4,5],
        [4,6],
        [4,7],
        [3,7],
        [2,7]
      ],
      warp: {
        image: '',
        coord: [2,8]
      }
    }
  ];

  function StageConfig(index) {
    this.index = index || 0;
  }

  StageConfig.getStagesCount = function() {
    return stages.length;
  };

  StageConfig.prototype.getLevelCount = function() {
    return stages[this.index].coords.length;
  };

  StageConfig.prototype.getCellSize = function() {
    return stages[this.index].size.slice();
  };

  StageConfig.prototype.getCoords = function() {
    return stages[this.index].coords.slice();
  };

  StageConfig.prototype.getCols = function() {
    return stages[this.index].grid[0];
  };

  StageConfig.prototype.getRows = function() {
    return stages[this.index].grid[1];
  };

  StageConfig.prototype.getWarp = function() {
    return stages[this.index].warp;
  };

  StageConfig.prototype.getLevelConfig = function(level) {
    return stages[this.index].levels[level];
  };

  module.exports = StageConfig;
});