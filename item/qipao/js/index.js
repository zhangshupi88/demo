(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var exports = {
  getRandomInt: function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getDegree: function(radian) {
    return radian / Math.PI * 180;
  },
  getRadian: function(degrees) {
    return degrees * Math.PI / 180;
  },
  getSpherical: function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return [x, y, z];
  }
};

module.exports = exports;

},{}],2:[function(require,module,exports){
var Util = require('./util');

var exports = function(){
  var Camera = function() {
    this.rad1 = Util.getRadian(30);
    this.rad2 = Util.getRadian(30);
    this.range = 600;
    this.obj;
  };
  
  Camera.prototype = {
    init: function(width, height) {
      this.obj = new THREE.PerspectiveCamera(35, width / height, 1, 1000);
      this.obj.up.set(-1, 1, 0);
      this.setPosition();
      this.lookAtCenter();
    },
    reset: function() {
      this.setPosition();
      this.lookAtCenter();
    },
    resize: function(width, height) {
      this.obj.aspect = width / height;
      this.obj.updateProjectionMatrix();
    },
    setPosition: function() {
      var points = Util.getSpherical(this.rad1, this.rad2, this.range);
      this.obj.position.set(points[0], points[1], points[2]);
    },
    lookAtCenter: function() {
      this.obj.lookAt({
        x: 1,
        y: 0,
        z: 0
      });
    }
  };

  return Camera;
};

module.exports = exports();

},{"./util":8}],3:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],4:[function(require,module,exports){
var exports = {
  friction: function(acceleration, mu, normal, mass) {
    var force = acceleration.clone();
    if (!normal) normal = 1;
    if (!mass) mass = 1;
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(mu);
    return force;
  },
  drag: function(acceleration, value) {
    var force = acceleration.clone();
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(acceleration.length() * value);
    return force;
  },
  hook: function(velocity, anchor, rest_length, k) {
    var force = velocity.clone().sub(anchor);
    var distance = force.length() - rest_length;
    force.normalize();
    force.multiplyScalar(-1 * k * distance);
    return force;
  }
};

module.exports = exports;

},{}],5:[function(require,module,exports){
var Util = require('./util');

var exports = function(){
  var HemiLight = function() {
    this.rad1 = Util.getRadian(60);
    this.rad2 = Util.getRadian(30);
    this.range = 0;
    this.obj;
  };
  
  HemiLight.prototype = {
    init: function(scene, rad1, rad2, range, hex1, hex2, intensity) {
      this.range = range;
      this.obj = new THREE.HemisphereLight(hex1, hex2, intensity);
      this.setPosition();
      scene.add(this.obj);
    },
    setPosition: function() {
      var points = Util.getSpherical(this.rad1, this.rad2, this.range);
      this.obj.position.set(points[0], points[1], points[2]);
    }
  };
  
  return HemiLight;
};

module.exports = exports();

},{"./util":8}],6:[function(require,module,exports){
var Util = require('./Util');
var debounce = require('./debounce');
var Camera = require('./camera');
var HemiLight = require('./hemiLight');
var Mover = require('./mover');

var body_width = document.body.clientWidth;
var body_height = document.body.clientHeight;
var fps = 60;
var last_time_render = Date.now();

var canvas = null;
var renderer = null;
var scene = null;
var camera = null;
var light = null;

var movers = [];
var points_geometry = null;
var points_material = null;
var points = null;

var antigravity = new THREE.Vector3(0, 1, 0);

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(body_width, body_height);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x111111, 1.0);
  
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 800, 1600);
  
  camera = new Camera();
  camera.init(body_width, body_height);
  
  light = new HemiLight();
  light.init(scene, Util.getRadian(30), Util.getRadian(60), 1000, 0xccffee, 0x003311, 1);
};

var init = function() {
  initThree();
  buildPoints();
  renderloop();
  setEvent();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var buildPoints = function() {
  points_geometry = new THREE.Geometry();
  points_material = new THREE.PointsMaterial({
    color: 0xfff966,
    size: 10,
    transparent: true,
    opacity: 1
  });
  for (var i = 0; i < 10000; i++) {
    var mover = new Mover();
    var range = Math.log(Util.getRandomInt(2, 256)) / Math.log(256) * 600;
    var rad = Util.getRadian(Util.getRandomInt(0, 360));
    var x = Math.cos(rad) * range;
    var z = Math.sin(rad) * range;
    mover.init(new THREE.Vector3(x, -100, z));
    mover.mass = Util.getRandomInt(100, 200) / 100;
    movers.push(mover);
    points_geometry.vertices.push(mover.position);
  }
  points = new THREE.Points(points_geometry, points_material);
  scene.add(points);
};

var updatePoints = function() {
  var points_vertices = [];
  for (var i = 0; i < movers.length; i++) {
    var mover = movers[i];
    mover.applyForce(antigravity);
    mover.updateVelocity();
    mover.updatePosition();
    if (mover.position.y > 100) {
      var range = Math.log(Util.getRandomInt(2, 256)) / Math.log(256) * 600;
      var rad = Util.getRadian(Util.getRandomInt(0, 360));
      var x = Math.cos(rad) * range;
      var z = Math.sin(rad) * range;
      mover.init(new THREE.Vector3(x, -100, z));
      mover.mass = Util.getRandomInt(100, 200) / 100;
    }
    points_vertices[i] = mover.position;
  }
  points.geometry.vertices = points_vertices;
  points.geometry.verticesNeedUpdate = true;
};

var render = function() {
  renderer.clear();
  updatePoints();
  renderer.render(scene, camera.obj);
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);

  if (now - last_time_render > 1000 / fps) {
    render();
    last_time_render = Date.now();
  }
};

var resizeRenderer = function() {
  body_width  = document.body.clientWidth;
  body_height = document.body.clientHeight;
  renderer.setSize(body_width, body_height);
  camera.resize(body_width, body_height);
};

init();

},{"./Util":1,"./camera":2,"./debounce":3,"./hemiLight":5,"./mover":7}],7:[function(require,module,exports){
var Util = require('./util');
var Force = require('./force');

var exports = function(){
  var Mover = function() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.anchor = new THREE.Vector3();
    this.mass = 1;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
    this.time = 0;
  };
  
  Mover.prototype = {
    init: function(vector) {
      this.position = vector.clone();
      this.velocity = vector.clone();
      this.anchor = vector.clone();
      this.acceleration.set(0, 0, 0);
      this.a = 1;
      this.time = 0;
    },
    updatePosition: function() {
      this.position.copy(this.velocity);
    },
    updateVelocity: function() {
      this.acceleration.divideScalar(this.mass);
      this.velocity.add(this.acceleration);
      // if (this.velocity.distanceTo(this.position) >= 1) {
      //   this.direct(this.velocity);
      // }
    },
    applyForce: function(vector) {
      this.acceleration.add(vector);
    },
    applyFriction: function() {
      var friction = Force.friction(this.acceleration, 0.1);
      this.applyForce(friction);
    },
    applyDragForce: function(value) {
      var drag = Force.drag(this.acceleration, value);
      this.applyForce(drag);
    },
    hook: function(rest_length, k) {
      var force = Force.hook(this.velocity, this.anchor, rest_length, k);
      this.applyForce(force);
    },
  };

  return Mover;
};

module.exports = exports();

},{"./force":4,"./util":8}],8:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}]},{},[6])