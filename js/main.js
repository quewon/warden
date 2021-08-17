var _canvas, _extra;
var _c, _e; // canvas, extra canvas (used for generating/editing images)

var player;
var scenes;
var alienParts;

load();

var clock;
var imgs;

function tick() {
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;

    update(dt);
    render(dt);
}

function load() {
  var toload = [
    "player.png",

    "parts/right shoulders.png",
    "parts/heads.png",
    "parts/legs.png",
    "parts/left shoulders.png",
    "parts/horns.png"
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
        init();
      }
    };
    imgs[toload[i]] = img;
  }
}

function init() {
  init_controls();

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

  for (let i=0; i<20; i++) {
    new alien({scene:"hub"})
  }

  scenes.current = "hub";

  player = new alien(bank.player);

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

  // scenes[scenes.current].update();

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