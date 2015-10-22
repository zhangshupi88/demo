var c = document.getElementById("c");
var ctx = c.getContext("2d");

var cw = c.width = window.innerWidth,
  cx = cw / 2;
var ch = c.height = window.innerHeight,
  cy = ch / 2;

var rad = (Math.PI / 180);

var a = 0;
var R = ch/3;
var speed = .02;
var D = 2 * R,
  d;
var y = cy + R,
  i = 0;
var phi = 0;
var num = 10;

function Draw() {

  a++;
  if (phi >= 1) {
    phi = 0;
  } else {
    phi += speed;
  }

  ctx.clearRect(0, 0, cw, ch);
  for (var i = -num; i < num; i++) {

    d = 2 * Math.sqrt(R * R - (R / num) * (i + phi) * (R / num) * (i + phi));
    y = cy - (i + phi) * (R *.9 / num);

    drawElipse(cx, y, d, d / 2, a)
  }
  requestId = window.requestAnimationFrame(Draw);
}
requestId = window.requestAnimationFrame(Draw);

function drawElipse(cx, cy, W, H, a) {
  var rx = W / 2;
  var ry = H / 2;
  for (var i = 0; i < 360; i += 10) {
    ctx.fillStyle = "hsl(180,100%," + ((Math.cos((i + a - 90) * rad) * 50) + 50) + "%)";
    var xp = cx + rx * Math.cos((i + a) * rad);
    var yp = cy + ry * Math.sin((i + a) * rad);
    ctx.beginPath();
    ctx.arc(xp, yp, d / 100, 0, 2 * Math.PI);
    ctx.fill();
  }
}