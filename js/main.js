var _canvas, _extra;
var _c, _e; // canvas, extra canvas (used for generating/editing images)

var player;
var scenes;
var alienParts;

load();

var clock;
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
    "scenes/testscene_cm.png"
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
      init();
      clearInterval(check);
    }
  }, 100);
}

function init() {
  init_controls();

  console.log('initializing...');

  clock = {
    prev: Date.now(),
    now: Date.now(),
  };

  _canvas = document.getElementById("canvas");
  _extra = document.getElementById("extra");
  _c = _canvas.getContext("2d");
  _e = _extra.getContext("2d");

  _canvas.width = Config.viewportWidth * 8;
  _canvas.height = Config.viewportHeight * 8;
  _canvas.style.width = _canvas.width * Config.viewportScale + "px";
  _canvas.style.height = _canvas.height * Config.viewportScale + "px";

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
  scenes.current = "hub";

  player = new alien(bank.player);

  scenes.hub.spawnAliens();

  //

  animate();
}

function animate() {
  _c.clearRect(0, 0, _canvas.width, _canvas.height);

  scenes[scenes.current].draw();

  update();
  requestAnimationFrame(animate);
}

function update() {
  clock.now = Date.now();
  clock.delta = clock.now - clock.prev;
  clock.prev = clock.now;

  Controls.key.update(clock.delta);
}

//

function spriteFilter(image) {
  _extra.width = image.width;
  _extra.height = image.height;
  _e.drawImage(image, 0, 0);
  let imgdata = dataFilter(_e.getImageData(0, 0, _extra.width, _extra.height));
  _e.putImageData(imgdata, 0, 0);

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