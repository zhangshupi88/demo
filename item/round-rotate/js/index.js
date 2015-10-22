const TWO_PI = Math.PI * 2;

var satellites = 6; // how many satellites
var spinSpeed = 2; // how fast they spin

//general
var canvas = document.getElementById('canvas'),
    ctx,
    timeStep = (1/60),
    time = 0;
satelliteArray = [],
     colorArray = [],
     m = new Point(),
     r = 0,
     mousePosition = new Point();

function initCanvas() { 
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;

     m.x = canvas.width / 2;
     m.y = canvas.height / 2; 
     
     mousePosition = new Point(m.x + 50, m.y + 50);

     ctx = canvas.getContext('2d');
}

function createSatelliteArray() {
     var child;

     for (var i = 0; i < satellites; i++) {
          child = new Satellite(
               new Point(m.x, m.y),
               100,
               spinSpeed,
               10,
               '#fff',
               360 / satellites * i
          );
          satelliteArray.push(child);
     }
}


function draw() {
     ctx.globalAlpha = 1;
     ctx.shadowBlur = 0;
     ctx.globalCompositeOperation = "multiply";
     ctx.fillStyle = '#000';
     ctx.clearRect(0, 0, canvas.width, canvas.height);

     satelliteArray.forEach(function(o) {
          o.draw();
     });
}

function update() {
     var o;

     for (var i = 0; i < satelliteArray.length; i++) {
          o = satelliteArray[i];
          o.update();
     }

}

window.requestAnimFrame = (function(){ 
     return  window.requestAnimationFrame   ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback){
          window.setTimeout(callback, 1000 / 60);
     };
})();

window.onload = function() {
     initCanvas();
     createSatelliteArray();
     requestAnimFrame(loop);

     window.addEventListener( 'resize', initCanvas );

     canvas.addEventListener('mousemove', function(e) {
          var r = canvas.getBoundingClientRect();
          TweenMax.to(mousePosition, 1.4, {ease: Elastic.easeOut, x:e.clientX - r.left, y:e.clientY - r.top});
     });

     canvas.addEventListener('mouseout', function(e) {
          TweenMax.to(mousePosition, 2, {ease: Elastic.easeOut, x:m.x + 50, y:m.y + 50});
     });
};

function loop() {
     update();
     draw();
     time += timeStep;
     requestAnimFrame(loop);
}

function Satellite(center, orbit, speed, radius, color, startAngle) {
     this.center = center;
     this.orbit = orbit;
     this.speed = speed;
     this.radius = radius;
     this.color = color;

     this.angle = startAngle || 0;
     this.position = new Point();
     this.visible = true;
     this.positions = [];
     this.colorCounter = 0;
}
Satellite.prototype = {
     update:function() {
          this.angle += this.speed; 

          this.color = "hsla("+time * 65+", 80%, 50%, 1)";

          this.orbit = (m.y + m.x) - (mousePosition.x + mousePosition.y); 
          
          this.position.x = this.orbit * Math.cos(this.angle * Math.PI / 180) + this.center.x;
          this.position.y = this.orbit * Math.sin(this.angle * Math.PI / 180) + this.center.y;

          this.positions.unshift(this.position.x, this.position.y);
          if (this.positions.length > 60) this.positions.length = 60;
     },
     draw:function() {
          if (this.visible === false) return;

          ctx.globalAlpha = 1;
          ctx.strokeStyle = this.color;
          ctx.fillStyle = this.color;

          //ctx.lineWidth = this.radius * 0.25;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();

          for (var i = this.positions.length - 1; i >= 0; i -= 4) {
               ctx.lineTo(this.positions[i - 1], this.positions[i]);
               ctx.lineWidth = (this.radius * 2) - ((this.positions.length / i)); 
          }
          
          ctx.stroke();

          fillCircle(this.position.x, this.position.y, this.radius);
     }
};

function fillCircle(x, y, r) {
     ctx.beginPath();
     ctx.arc(x, y, r, 0, Math.PI * 2);
     ctx.fill();
}

function Point(x, y) {
     this.x = x || null;
     this.y = y || null;
}