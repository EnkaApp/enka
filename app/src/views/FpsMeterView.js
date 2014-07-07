/* eslint func-style:0 no-return-assign:0 */

define(function(require, exports, module) {
  var Engine = require('famous/core/Engine');
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Timer = require('famous/utilities/Timer');
  var Transform = require('famous/core/Transform');

  var __bind = function(fn, me) {
    return function() {
      return fn.apply(me, arguments);
    };
  };

  var __hasProp = {}.hasOwnProperty;

  var __extends = function(child, parent) {
    for (var key in parent) {
      if (__hasProp.call(parent, key)) child[key] = parent[key];
    }

    function ctor() {
      this.constructor = child;
    }

    ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child;
  };

  var FpsMeter = (function(_super) {
    __extends(FpsMeter, _super);

    FpsMeter.prototype.currTime = 0;

    FpsMeter.prototype.lastTime = 0;

    FpsMeter.prototype.frameTime = 0;

    FpsMeter.prototype.state = true;

    FpsMeter.prototype.filterStrength = 10;

    FpsMeter.prototype.updateFrequency = 100;

    function FpsMeter() {
      this.update = __bind(this.update, this);
      this.toggleState = __bind(this.toggleState, this);
      this.tick = __bind(this.tick, this);
      FpsMeter.__super__.constructor.apply(this, arguments);
      this.initTime();
      this.surface = new Surface({
        size: [70, 30],
        classes: ['fpsmeter'],
        content: '',
        properties: {
          zIndex: 100
        }
      });
      this.add(new Modifier({
        origin: [1,1],
        align: [1,1],
        transform: Transform.translate(0, 0, 10)
      })).add(this.surface);
      this.surface.on('click', this.toggleState);
      this.start();
    }

    FpsMeter.prototype.initTime = function() {
      var perf;
      var perfNow;

      perf = window.performance;
      if (perf && (perf.now || perf.webkitNow)) {
        perfNow = perf.now ? 'now' : 'webkitNow';
        this.getTime = perf[perfNow].bind(perf);
      }
      return this.lastTime = this.getTime();
    };

    FpsMeter.prototype.tick = function() {
      var thisFrameTime;
      this.currTime = this.getTime();
      thisFrameTime = this.currTime - this.lastTime;
      this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength;
      return this.lastTime = this.currTime;
    };

    FpsMeter.prototype.toggleState = function() {
      if (this.state) {
        this.stop();
      } else {
        this.start();
      }
      return this.state = !this.state;
    };

    FpsMeter.prototype.start = function() {
      Engine.on('prerender', this.tick);
      return this.interval = Timer.setInterval(this.update, this.updateFrequency);
    };

    FpsMeter.prototype.stop = function() {
      Engine.removeListener('prerender', this.tick);
      return Timer.clear(this.interval);
    };

    FpsMeter.prototype.update = function() {
      return this.surface.setContent('' + ((1000 / this.frameTime).toFixed(1)) + ' fps');
    };

    FpsMeter.prototype.getTime = function() {
      return +new Date();
    };

    return FpsMeter;

  })(View);

  module.exports = FpsMeter;
});
