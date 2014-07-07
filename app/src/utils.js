define(function(require, exports, module) {

  function Utilities() {}

  // ## Static Functions
  Utilities.getViewportWidth = function() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  Utilities.getViewportHeight = function() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  };

  Utilities.getRandomIntInRange = function(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
  };

  Utilities.getRandomArrayItem = function(arr) {
    var index = this.getRandomIntInRange(0, arr.length-1);
    return arr[index];
  };

  module.exports = Utilities;
});
