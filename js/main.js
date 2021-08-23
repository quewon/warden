var _canvas, _extra, _debug;
var _c, _e, _d;

var player;
var scenes;
var alienParts;

load();

// var clock;
var imgs, sounds;

var ref = [];

function load() {
  load_imgs();
}

function load_imgs() {
  console.log('loading images...');

  var toload = [
    "player.png",

    "parts/right shoulders.png",
    "parts/heads.png",
    "parts/legs.png",
    "parts/left shoulders.png",
    "parts/horns.png",

    "scenes/testscene.png",
    "scenes/testscene_cm.png",
    "scenes/hub.png",
    "scenes/hub_cm.png",

    "scenes/parts/control.png",
    "scenes/parts/control_cm.png",
  ];

  imgs = {};

  var checklist = 0;

  for (let i in toload) {
    checklist++;
    let img = new Image();
    img.src = "img/"+toload[i];
    img.onload = function() {
      checklist--;
      if (checklist == 0) {
        load_sounds();
      }
    };
    imgs[toload[i]] = img;
  }
}

function load_sounds() {
  console.log('loading sounds...');

  sounds = {
    step: [
      new Howl({src: "sound/steps/0.wav"}),
      new Howl({src: "sound/steps/1.wav"}),
      new Howl({src: "sound/steps/2.wav"}),
      new Howl({src: "sound/steps/3.wav"}),
      new Howl({src: "sound/steps/4.wav"}),
      new Howl({src: "sound/steps/5.wav"}),
      new Howl({src: "sound/steps/6.wav"}),
      new Howl({src: "sound/steps/7.wav"}),
      new Howl({src: "sound/steps/8.wav"}),
      new Howl({src: "sound/steps/9.wav"}),
    ],
  };

  var checklist = 0;

  for (let i in sounds) {
    for (let s in sounds[i]) {
      checklist++;
    }
  }

  let check = setInterval(function() {
    for (let i in sounds) {
      for (let s in sounds[i]) {
        if (sounds[i][s].state() == "loaded") {
          checklist--;
        }
      }
    }
    if (checklist == 0) {
      console.log("all assets loaded.");
      init();
      clearInterval(check);
    }
  }, 100);
}

function init() {
  init_controls();

  console.log('initializing game...');

  clock = {
    prev: Date.now(),
    now: Date.now(),
  };

  document.documentElement.style.setProperty("--bg", "rgb("+Config.filter[52][0]+","+Config.filter[52][1]+","+Config.filter[52][2]+")");

  _canvas = document.getElementById("canvas");
  _extra = document.getElementById("extra");
  _debug = document.getElementById("debug");
  _c = _canvas.getContext("2d");
  _e = _extra.getContext("2d");
  _d = _debug.getContext("2d");

  _canvas.width = Config.viewportWidth * 8;
  _canvas.height = Config.viewportHeight * 8;
  _canvas.style.width = _canvas.width * Config.viewportScale + "px";
  _canvas.style.height = _canvas.height * Config.viewportScale + "px";
  _debug.width = Config.viewportWidth * 8;
  _debug.height = Config.viewportHeight * 8;
  _debug.style.width = _canvas.width * Config.viewportScale + "px";
  _debug.style.height = _canvas.height * Config.viewportScale + "px";

  _c.imageSmoothingEnabled = Config.imageSmoothingEnabled;

  //

  _extra.width = 8;
  _extra.height = 8;

  alienParts = {
    heads: {},
    "right shoulders": {},
    "left shoulders": {},
    horns: {},
    legs: {},
  };

  for (let key in alienParts) {
    alienParts[key].img = imgs["parts/"+key+".png"];
  }

  for (let key in alienParts) {
    let tiles = [];
    let x = 0;

    let img = alienParts[key].img;
    while (x < img.width) {
      _e.clearRect(0, 0, 8, 8);
      _e.drawImage(img, x, 0, 8, 8, 0, 0, 8, 8);
      tiles.push(dataFilter(_e.getImageData(0, 0, 8, 8)));
      x += 9;
    }

    alienParts[key].tiles = tiles;
  }

  //

  scenes = {};
  scenes.hub = new scene(bank.hub);
  scenes.test = new scene({
    name: "test",
    src: "testscene",
  });
  scenes.control = new scene({
    name: "control",
    src: "parts/control",
  });

  scenes.hub.spawnAliens();
  scenes.test.spawnAliens();
  scenes.control.spawnAliens();

  player = new alien(bank.player);

  //

  animate();
}

function animate() {
  _c.clearRect(0, 0, _canvas.width, _canvas.height);

  scenes[player.scene].draw();

  update();
  requestAnimationFrame(animate);
}

function update() {
  // clock.now = Date.now();
  // clock.delta = clock.now - clock.prev;
  // clock.prev = clock.now;

  Controls.key.update();
}

//

function spriteFilter(image) {
  _extra.width = image.width;
  _extra.height = image.height;
  _e.drawImage(image, 0, 0);
  let imgdata = dataFilter(_e.getImageData(0, 0, _extra.width, _extra.height));
  _e.putImageData(imgdata, 0, 0);

  alienTextures[Config.alienTexture]();

  image.src = _extra.toDataURL();

  return image
}

function dataFilter(imgdata) {
  let data = imgdata.data;

  for (let i=0; i<data.length; i+=4) {
    for (let c in Config.filter) {
      if (
        data[i] == c &&
        data[i+1] == c &&
        data[i+2] == c
      ) {
        let rgb = Config.filter[c];
        data[i] = rgb[0];
        data[i+1] = rgb[1];
        data[i+2] = rgb[2];
      }
    }
  }

  return imgdata
}

function drawImage(P) {
  _c.save();

  let img = P.img;
  let x = P.x;
  let y = P.y;
  let width = P.width || img.width;
  let height = P.height || img.height;
  let center = P.center || false;
  let flip = P.flip || false;
  let flop = P.flop || false;
  let deg = P.deg || null;

  // Set rotation point to center of image, instead of top/left
  if(center) {
      x -= width/2;
      y -= height/2;
  }

  // Set the origin to the center of the image
  _c.translate(x + width/2, y + height/2);

  // Rotate the canvas around the origin
  var rad = 2 * Math.PI - deg * Math.PI / 180;    
  _c.rotate(rad);

  // Flip/flop the canvas
  if(flip) flipScale = -1; else flipScale = 1;
  if(flop) flopScale = -1; else flopScale = 1;
  _c.scale(flipScale, flopScale);

  // Draw the image    
  _c.drawImage(img, -width/2, -height/2, width, height);

  _c.restore();
}

function lerp(start, end, t) {
  return start * (1-t) + end * t
}

function playsound(name) {
  G.arrayRandom(sounds[name]).play();
}

function setColor(context, value, opacity) {
  opacity = opacity || 1;

  context.fillStyle =
    "rgba("+
    Config.filter[value][0]+","+
    Config.filter[value][1]+","+
    Config.filter[value][2]+","+
    opacity
    ")";
}

function circle(r) {
  var arr = [];
  
  for (let x=-r; x<r; x++) {
    let height = Math.sqrt(r * r - x * x);

    for (let y =-height; y<height; y++) {
      arr.push([x, Math.round(y)])
    }
  }

  return arr
}

function pointInTriangle(p, p0, p1, p2) {
  var A = 1/2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
  var sign = A < 0 ? -1 : 1;
  var s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
  var t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
  
  return s >= 0 && t >= 0 && (s + t) < 2 * A * sign;
}

// function that returns line intersecting with box
//https://gist.github.com/w8r/7b701519a7c5b4840bec4609ceab3171
function liangBarsky (x0, y0, x1, y1, bbox) {
  var [xmin, xmax, ymin, ymax] = bbox;
  var t0 = 0, t1 = 1;
  var dx = x1 - x0, dy = y1 - y0;
  var p, q, r;

  for(var edge = 0; edge < 4; edge++) {   // Traverse through left, right, bottom, top edges.
    if (edge === 0) { p = -dx; q = -(xmin - x0); }
    if (edge === 1) { p =  dx; q =  (xmax - x0); }
    if (edge === 2) { p = -dy; q = -(ymin - y0); }
    if (edge === 3) { p =  dy; q =  (ymax - y0); }

    r = q / p;

    if (p === 0 && q <= 0) return null;   // Don't draw line at all. (parallel line outside)

    if(p < 0) {
      if (r >= t1) return null;     // Don't draw line at all.
      else if (r >= t0) t0 = r;     // Line is clipped!
    } else if (p >= 0) {
      if(r <= t0) return null;      // Don't draw line at all.
      else if (r <= t1) t1 = r;     // Line is clipped!
    }
  }

  return [
    [x0 + t0 * dx, y0 + t0 * dy],
    [x0 + t1 * dx, y0 + t1 * dy]
  ];
}