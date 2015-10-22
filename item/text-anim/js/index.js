"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

console.clear();

//
// DEMO
// ===========================================================================
function demo() {

  var container = new Container($(".container"));

  var blocks = $$(".block");

  for (var i = 0; i < blocks.length; i++) {

    var split = new SplitText(blocks[i], { type: "words" });

    split.words.forEach(function (word) {
      return container.addChild(new Box(word));
    });
  }

  var render = container.render.bind(container);
  var resize = container.resize.bind(container);
  var update = container.update.bind(container);

  Draggable.create(createElement("div"), {
    trigger: document,
    onPress: resize,
    onDrag: resize
  });

  window.addEventListener("resize", update);

  TweenLite.ticker.addEventListener("tick", render);

  TweenLite.set(container.node, { autoAlpha: 1 });
}

//
// CUSTOM EASE
// ===========================================================================

var CustomEase = (function (_Ease) {
  _inherits(CustomEase, _Ease);

  function CustomEase() {
    var omega = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];
    var zeta = arguments.length <= 1 || arguments[1] === undefined ? 0.75 : arguments[1];

    _classCallCheck(this, CustomEase);

    _Ease.call(this);
    this.omega = omega;
    this.zeta = zeta;
  }

  //                          
  // CONTAINER
  // ===========================================================================

  CustomEase.prototype.getRatio = function getRatio(progress) {

    var omega = this.omega;
    var zeta = this.zeta;
    var beta = Math.sqrt(1.0 - zeta * zeta);

    progress = 1 - Math.cos(progress * Math.PI / 2);
    progress = 1 / beta * Math.exp(-zeta * omega * progress) * Math.sin(beta * omega * progress + Math.atan(beta / zeta));

    return 1 - progress;
  };

  return CustomEase;
})(Ease);

var Container = (function () {
  function Container(node) {
    _classCallCheck(this, Container);

    this.node = node;
    this.ratio = 0.8553971486761711;
    this.width = body.offsetWidth * this.ratio;

    this.children = new LinkedList();
  }

  //
  // TWEEN
  // ===========================================================================

  Container.prototype.addChild = function addChild(child) {
    this.children.add(child);
    return this;
  };

  Container.prototype.layout = function layout() {

    var size = this.children.size;
    var child = this.children.first;

    while (size--) {
      child.layout();
      child = child.next;
    }
  };

  Container.prototype.resize = function resize(event) {

    var w = body.offsetWidth;
    var x = event.clientX;

    this.width = clamp(x, 1, w);
    this.ratio = x / w;
    this.layout();
  };

  Container.prototype.render = function render() {
    var size = this.children.size;
    var child = this.children.first;

    while (size--) {
      child.render();
      child = child.next;
    }
  };

  Container.prototype.update = function update(event) {
    this.width = body.offsetWidth * this.ratio;
    this.layout();
  };

  _createClass(Container, [{
    key: "width",
    set: function set(w) {
      this.node.style.width = w + "px";
    }
  }]);

  return Container;
})();

var Tween = function Tween(duration, config) {
  _classCallCheck(this, Tween);

  this.x = 0;
  this.y = 0;

  this.tween = TweenLite.from(this, duration, config);
}

//
// BOX
// ===========================================================================
;

var Box = (function () {
  function Box(node) {
    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Box);

    this.node = node;

    TweenLite.set(node, config);

    this.x = this.node.offsetLeft;
    this.y = this.node.offsetTop;

    this.tweens = new LinkedList();
  }

  //
  // LINKED LIST
  // ===========================================================================

  Box.prototype.layout = function layout() {
    var _this = this;

    var x = this.x;
    var y = this.y;

    this.x = this.node.offsetLeft;
    this.y = this.node.offsetTop;

    if (x === this.x && y === this.y) return this;

    var dx = x - this.x;
    var dy = y - this.y;

    var tween = new Tween(duration, {
      x: dx,
      y: dy,
      ease: ease,
      onComplete: function onComplete() {
        return _this.removeTween(tween);
      }
    });

    if (!this.tweens.size) {
      TweenLite.set(this.node, { x: dx, y: dy });
    }

    this.tweens.add(tween);

    return this;
  };

  Box.prototype.removeTween = function removeTween(tween) {
    this.tweens.remove(tween);
    return this;
  };

  Box.prototype.render = function render() {

    var size = this.tweens.size;

    if (!size) return;

    var tween = this.tweens.first;

    var x = 0;
    var y = 0;

    while (size--) {
      x += tween.x;
      y += tween.y;
      tween = tween.next;
    }

    TweenLite.set(this.node, { x: x, y: y });
    return this;
  };

  return Box;
})();

var LinkedList = (function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);

    // Alias
    this.add = this.append;
    this.clear();
  }

  LinkedList.fromArray = function fromArray(array) {

    var list = new LinkedList();
    var size = array.length;

    while (size--) list.prepend(array[size]);
    return list;
  };

  LinkedList.prototype.clear = function clear() {

    this.size = 0;
    this.first = null;
    this.last = null;
    this.next = null;
    this.prev = null;

    return this;
  };

  LinkedList.prototype.get = function get(i) {

    if (this.isEmpty) return null;

    var node = this.first;
    var size = i % this.size;

    while (size--) node = node.next;
    return node;
  };

  LinkedList.prototype.random = function random() {

    var n = Math.random() * this.size >> 0;
    return this.get(n);
  };

  LinkedList.prototype.toArray = function toArray() {

    var array = [];
    var node = this.first;
    var size = this.size;

    while (size--) {
      array.push(node);
      node = node.next;
    }

    return array;
  };

  LinkedList.prototype.forEach = function forEach(callback, scope) {

    var node = this.first;
    var size = this.size;

    for (var i = 0; i < size; i++) {
      callback.call(scope, node, i);
      node = node.next;
    }
  };

  LinkedList.prototype.append = function append(node) {

    if (this.first === null) {

      node.prev = node;
      node.next = node;

      this.first = node;
      this.last = node;
      this.next = node;
    } else {

      node.prev = this.last;
      node.next = this.first;

      this.last.next = node;
      this.last = node;
    }

    this.size++;
    return node;
  };

  LinkedList.prototype.prepend = function prepend(node) {

    if (this.first === null) {

      return this.append(node);
    } else {

      node.prev = this.last;
      node.next = this.first;

      this.first.prev = node;
      this.last.next = node;
      this.first = node;
    }

    this.size++;
    return node;
  };

  LinkedList.prototype.remove = function remove(node) {

    if (this.size > 1) {

      node.prev.next = node.next;
      node.next.prev = node.prev;

      if (node === this.first) this.first = node.next;
      if (node === this.last) this.last = node.prev;
    } else {

      this.first = null;
      this.last = null;
    }

    node.prev = null;
    node.next = null;

    this.size--;
    return node;
  };

  LinkedList.prototype.insertBefore = function insertBefore(node, newNode) {

    newNode.prev = node.prev;
    newNode.next = node;

    node.prev.next = newNode;
    node.prev = newNode;

    if (newNode.next === this.first) this.first = newNode;

    this.size++;
    return newNode;
  };

  LinkedList.prototype.insertAfter = function insertAfter(node, newNode) {

    newNode.prev = node;
    newNode.next = node.next;

    node.next.prev = newNode;
    node.next = newNode;

    if (newNode.prev === this.last) this.last = newNode;

    this.size++;
    return newNode;
  };

  _createClass(LinkedList, [{
    key: "isEmpty",
    get: function get() {
      return !this.size && !this.first && !this.last;
    }
  }]);

  return LinkedList;
})();

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function createElement(type, parent) {
  var node = document.createElement(type);
  parent && parent.appendChild(node);
  return node;
}

// ===========================================================================
var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
var log = console.log.bind(console);

var body = document.body;
var ease = new CustomEase(10, 0.9);
var size = 256;

var duration = 1;

demo();