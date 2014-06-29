define(function(require, exports, module) {

  function Utilities() {}

  // ## Static Functions
  Utilities.getViewportWidth = function() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  Utilities.getViewportHeight = function() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  };

  module.exports = Utilities;
});