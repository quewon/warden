var _canvas, _extra;
var _c, _e; // canvas, extra canvas (used for generating/editing images)

var bank, player;
var scenes;
var alienParts;

load();

function load() {
  alienParts = {
    heads: {},
    "right shoulders": {},
    "left shoulders": {},
    horns: {},
    legs: {},
  };

  var checklist = 0;

  for (let key in alienParts) {
    checklist++;
    let img = new Image();
    img.src = "img/parts/"+key+".png";
    img.onload = function() {
      checklist--;
      if (checklist == 0) {
        init();
      }
    };
    alienParts[key].img = img;
  }
}

function init() {
  init_controls();

  _canvas = document.getElementById("canvas");
  _extra = document.getElementById("extra");
  _c = _canvas.getContext("2d");
  _e = _extra.getContext("2d");

  _canvas.width = 128;
  _canvas.height = 128;
  _canvas.style.width = 128 * 4 + "px";
  _canvas.style.height = 128 * 4 + "px";

  //

  _extra.width = 8;
  _extra.height = 8;

  for (let key in alienParts) {
    let tiles = [];
    let x = 0;

    let img = alienParts[key].img;
    while (x < img.width) {
      _e.clearRect(0, 0, 8, 8);
      _e.drawImage(img, x, 0, 8, 8, 0, 0, 8, 8);
      tiles.push(_e.getImageData(0, 0, 8, 8));
      x += 9;
    }

    alienParts[key].tiles = tiles;
  }

  //

  bank = {
    player: {
      name: "you",
      img: "player.png",
      scene: "hub"
    },
    hub: {
      aliens: []
    }
  };

  scenes = {};
  scenes.hub = new scene(bank.hub);

  let a = new alien({scene:"hub"});

  scenes.current = "hub";

  // player = new alien(bank.player);

  //

  animate();
}

function animate() {
  let s = scenes[scenes.current];
  _c.clearRect(0, 0, _canvas.width, _canvas.height);

  s.draw();

  update();
  requestAnimationFrame(animate);
}

function update() {
  Controls.key.update();
}