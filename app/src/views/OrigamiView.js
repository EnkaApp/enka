define(function(require, exports, module) {
  var View = require('famous/core/View');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Timer = require('famous/utilities/Timer');
  var Easing = require('famous/transitions/Easing');

  // Should be run at initialization and anytime the options change
  function _init() {
    this._tDur = (this.options.duration + this.options.delay * 4) / 4; // triangle animation duration
    this._tHeight = _getTriangleHeight.call(this); // triangle height
    this._tWidth = this._tHeight * 2; // triangle width
    this._triangleSpecs = _getTriangleSpecs.call(this); // triangle specs
    this._scale = this.options.startDimen / this._tWidth; // scaling

    // console.log(this.options.startDimen, this._tHeight, this._tWidth, this._scale);

    this.rotationMod.setTransform(Transform.scale(this._scale, this._scale, 1));
    this.centerMod.setSize([this._tHeight * 4, this._tHeight * 4]);

    this.largeCenterModifier.setTransform(Transform.translate(0, 0, -0.001));
    this.largeCenterModifier.setOpacity(0.001);
    this.largeCenterModifier.setSize([this.options.endDimen, this.options.endDimen]);

    // Update Triangles
    _updateTriangles.call(this);
  }

  var OrigamiView = function() {
    this._triangles = {};
    this._triangleModifers = {}; // stores all triangle modifiers

    this.rootMod = new StateModifier({
      transform: Transform.translate(0, 0, 0)
    });

    this.rotationMod = new StateModifier();
    this.centerMod = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    this.largeCenterModifier = new StateModifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    });

    // Apply Options
    View.apply(this, arguments);

    _init.call(this);

    var node = this.add(this.rootMod);
    this.node = node.add(this.rotationMod).add(this.centerMod);

    _createCenterSquare.call(this);
    _createLargeSquare.call(this);
    _createTriangles.call(this);
  };

  OrigamiView.prototype = Object.create(View.prototype);
  OrigamiView.prototype.constructor = OrigamiView;

  OrigamiView.DEFAULT_OPTIONS = {
    startDimen: 62, // start dimensions
    endDimen: 230, // final dimensions,
    duration: 1600, // full animation duration
    delay: 100, // delay between triangle animations
    content: null
  };

  OrigamiView.prototype.setOptions = function(options) {
    this._optionsManager.patch(options);
    _init.call(this);
  };

  OrigamiView.prototype.open = function() {
    _doPiecesAnimation.call(this);
    _doWholeThingAnimation.call(this);
  };

  OrigamiView.prototype.reset = function() {
    _init.call(this);
  };

  // ## Private Helpers

  function _getBorderWidth(top, right, bottom, left) {
    var borderWidths = [top, right, bottom, left];
    return 'border-width: ' + borderWidths.join('px ') + 'px';
  }

  function _getTriangleSpecs() {
    var h = this._tHeight;
    var w = this._tWidth;
    var zInner = 50;
    var zOuter = zInner + 10;

    var specs = {
      topTriangle: {
        inner: {
          classes: ['bottom-triangle'],
          borderWidth: _getBorderWidth(h, h, 0 , h),
          size: [w, h],
          origin: [0.5, 0],
          translate: Transform.translate(0, h, zOuter),
        },
        outer: {
          size: [w, h],
          origin: [0.5, 0],
          classes: ['bottom-triangle', 'light'],
          borderWidth: _getBorderWidth(h, h, 0, h),
          properties: {
            backfaceVisibility: 'visible',
            webkitBackfaceVisibility: 'visible',
          },
          translate: Transform.translate(0, h, zInner),
        }
      },

      rightTriangle: {
        inner: {
          size: [h, w],
          origin: [1, 0.5],
          classes: ['left-triangle'],
          borderWidth: _getBorderWidth(h, h, h, 0),
          translate: Transform.translate(-h, 0, zOuter),
        },
        outer: {
          size: [h, w],
          origin: [1, 0.5],
          classes: ['left-triangle', 'light'],
          borderWidth: _getBorderWidth(h, h, h, 0),
          properties: {
            backfaceVisibility: 'visible',
            webkitBackfaceVisibility: 'visible',
          },
          translate: Transform.translate(-h, 0, zInner),
        }
      },

      bottomTriangle: {
        inner: {
          borderWidth: _getBorderWidth(0, h, h, h),
          size: [w, h],
          origin: [0.5, 1],
          classes: ['top-triangle'],
          translate: Transform.translate(0, -h, zOuter),
        },
        outer: {
          classes: ['top-triangle', 'light'],
          borderWidth: _getBorderWidth(0, h, h, h),
          size: [w, h],
          origin: [0.5, 1],
          properties: {
            backfaceVisibility: 'visible',
            webkitBackfaceVisibility: 'visible',
          },
          translate: Transform.translate(0, -h, zInner),
        }
      },

      leftTriangle: {
        inner: {
          size: [h, w],
          origin: [0, 0.5],
          classes: ['right-triangle'],
          borderWidth: _getBorderWidth(h, 0, h, h),
          translate: Transform.translate(h, 0, zOuter),
        },
        outer: {
          size: [h, w],
          classes: ['right-triangle', 'light'],
          borderWidth: _getBorderWidth(h, 0, h, h),
          origin: [0, 0.5],
          properties: {
            backfaceVisibility: 'visible',
            webkitBackfaceVisibility: 'visible',
          },
          translate: Transform.translate(h, 0, zInner),
        }
      }
    };

    return specs;
  }

  var animationSequence = [
    'topTriangle',
    'bottomTriangle',
    'rightTriangle',
    'leftTriangle'
  ];

  function _createCenterSquare() {
    this.centerSquare = new Surface({
      size: [this._tHeight * 2, this._tHeight *  2],
    });

    this.centerModifier = new StateModifier({
      transform: Transform.translate(0, 0, 0),
      origin: [0.5, 0.5],
      align: [0.5, 0.5],
    });

    this.centerSquare.setClasses(['center-square']);

    this.node.add(this.centerModifier).add(this.centerSquare);
  }

  function _createLargeSquare() {
    this.largeSquare = new Surface({
      // size: [this.options.endDimen, this.options.endDimen],
      properties: {
        backgroundColor: 'white'
      }
    });

    // this.largeCenterModifier = new StateModifier({
    //   size: [this.options.endDimen, this.options.endDimen],
    //   opacity: 0.001,
    //   transform: Transform.translate(0, 0, -0.001),
    // });

    this.largeSquare.setClasses(['center-square-lg']);

    var node = this.add(this.largeCenterModifier);
    
    node.add(this.largeSquare);
    node.add(this.options.content);
  }

  function _createTriangle(key, type, options) {
    var size = options.size;
    var origin = options.origin;
    var transform = options.translate;

    var surface = new Surface({
      content: '<div><div style="'+options.borderWidth+'" class="'+options.classes.join(' ')+'"></div></div>',
      properties: options.properties || {}
    });

    var modifier = new StateModifier({
      size: size,
      origin: origin,
      transform: transform
    });

    // save modifier
    surface._mod = modifier;

    // Deprecated
    this._triangleModifers[key] = this._triangleModifers[key] || {};
    this._triangleModifers[key][type] = modifier;
    
    this._triangles[key] = this._triangles[key] || {};
    this._triangles[key][type] = surface;

    this.node.add(modifier).add(surface);
  }

  function _createTriangles() {
    for (var key in this._triangleSpecs) {
      var innerOptions = this._triangleSpecs[key].inner;
      var outerOptions = this._triangleSpecs[key].outer;

      _createTriangle.call(this, key, 'inner', innerOptions);
      _createTriangle.call(this, key, 'outer', outerOptions);
    }
  }

  function _updateTriangle(options, surface) {
    var mod = surface._mod;
    var size = options.size;
    var origin = options.origin;
    var transform = options.translate;

    mod.setSize(size);
    mod.setTransform(transform);

    surface.setContent('<div><div style="'+options.borderWidth+'" class="'+options.classes.join(' ')+'"></div></div>');
    surface.setProperties(options.properties || {});
  }

  function _updateTriangles() {
    for(var key in this._triangles) {
      var inner = this._triangles[key].inner;
      var outer = this._triangles[key].outer;

      var innerOptions = this._triangleSpecs[key].inner;
      var outerOptions = this._triangleSpecs[key].outer;

      _updateTriangle.call(this, innerOptions, inner);
      _updateTriangle.call(this, outerOptions, outer);
    }
  }

  function _doPiecesAnimation() {
    var dur = this._tDur;

    var transition = {
      curve: Easing.inQuad,
      duration: this._tDur
    };

    function _transform(innerMod, outerMod, transform) {

      var innerTransform = Transform.multiply(
        innerMod.getTransform(),
        transform
      );

      var outerTransform = Transform.multiply(
        outerMod.getTransform(),
        transform
      );

      outerMod.setTransform(innerTransform, transition);
      innerMod.setTransform(outerTransform, transition);
    }

    for (var i = 0; i < animationSequence.length; i++) {
      var transform;
      var triangle = animationSequence[i];
      var outerMod = this._triangleModifers[triangle].outer;
      var innerMod = this._triangleModifers[triangle].inner;

      // Set rotation
      if (triangle === 'topTriangle') {
        transform = Transform.rotateX(Math.PI);
      } else if (triangle === 'bottomTriangle') {
        transform = Transform.rotateX(-Math.PI);
      } else if (triangle === 'rightTriangle') {
        transform = Transform.rotateY(Math.PI);
      } else if (triangle === 'leftTriangle') {
        transform = Transform.rotateY(-Math.PI);
      }

      Timer.setTimeout(
        _transform.bind(this, innerMod, outerMod, transform),
        i * this.options.delay
      );
    }
  }

  function _doWholeThingAnimation() {
    var transform = Transform.multiply(Transform.scale(1, 1, 1), Transform.rotateZ(Math.PI/4));

    this.rotationMod.setTransform(transform, {
      curve: Easing.outElastic,
      duration: this.options.duration
    });

    Timer.setTimeout(function() {
      this.largeCenterModifier.setTransform(Transform.translate(0, 0, 100));
      this.largeCenterModifier.setOpacity(0.999, {
        curve: 'linear',
        duration: 200
      });
    }.bind(this), this.options.duration / 2);
  }

  function _getTriangleHeight() {
    var diagonal = this.options.endDimen / 2;
    var height = Math.pow(Math.pow(diagonal, 2) / 2, 1/2);

    return height;
  }

  module.exports = OrigamiView;
});