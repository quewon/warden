class scene {
  constructor(p) {
    this.aliens = p.aliens || [];
    this.static = p.static || [];
    this.width = Config.viewportWidth;
    this.height = Config.viewportHeight;

    this.init(p.src || "testscene");
  }

  init(src) {
    // create bg

    let img = imgs["scenes/"+src+".png"];

    _extra.width = img.width;
    _extra.height = img.height;

    _e.drawImage(img, 0, 0);
    let filtered = dataFilter(_e.getImageData(0, 0, _extra.width, _extra.height));
    _e.putImageData(filtered, 0, 0);

    _e.globalCompositeOperation = "destination-over";
    let bg = sceneBGs.mosaic(img.width, img.height);
    _e.drawImage(bg, 0, 0);
    _e.globalCompositeOperation = "source-over";

    this.img = new Image();
    this.img.src = _extra.toDataURL();

    // colmap & shadowmap

    _e.clearRect(0, 0, _extra.width, _extra.height);
    _e.drawImage(imgs["scenes/"+src+"_cm.png"], 0, 0);
    var coldata = _e.getImageData(0, 0, _extra.width, _extra.height).data;

    let image = new Image();
    image.src = _extra.toDataURL();

    this.colmap = [];
    this.shadowmap = [];

    this.alienspawns = [];

    for (let y=0; y<img.height/8; y++) {
      this.colmap[y] = [];
      this.shadowmap[y] = [];
      for (let x=0; x<img.height/8; x++) {
        this.colmap[y][x] = 0;

        let i = ((y*8 * _extra.width) + (x*8)) * 4;

        searchkey: for (let k in Config.colKey) {
          let key = Config.colKey[k];
          if (
            coldata[i] == key[0] &&
            coldata[i+1] == key[1] &&
            coldata[i+2] == key[2]
          ) {
            this.colmap[y][x] = k;

            if (k=="alienspawn") {
              this.alienspawns.push([x*8, y*8]);
            }

            break searchkey
          }
        }

        this.shadowmap[y][x] = 0;

      }
    }
  }

  spawnAliens() {
    for (let c in this.alienspawns) {
      let coord = this.alienspawns[c];
      new alien({
        scene: this.name,
        position: { x: coord[0], y: coord[1] }
      });
    }
  }

  draw() {
    setColor(_c, 175);
    _c.fillRect(0, 0, _canvas.width, _canvas.height);
    _c.drawImage(this.img, 0, 0);

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.update();
    }

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.draw();
    }

    // update shadowmap

    for (let y in this.shadowmap) {
      for (let x in this.shadowmap[y]) {
        let l = this.shadowmap[y][x];
        l -= 0.025;
        if (l < 0) l = 0;
        this.shadowmap[y][x] = l;
      }
    }

    // draw shadows

    _e.globalCompositeOperation = "screen";

    for (let y in this.shadowmap) {
      for (let x in this.shadowmap[y]) {
        let opacity = (Math.round((1-this.shadowmap[y][x])*4)/4).toFixed(1);
        setColor(_c, 52, opacity - 0.05);
        _c.fillRect(x*8, y*8, 8, 8);
      }
    }

    // for (let i in player.animation.triangles) {
    //   let triangle = player.animation.triangles[i];
    //   _c.fillStyle = "rgba(255,255,255,0.5)";
    //   _c.beginPath();
    //   _c.moveTo(triangle.a.x, triangle.a.y);
    //   _c.lineTo(triangle.b.x, triangle.b.y);
    //   _c.lineTo(triangle.c.x, triangle.c.y);
    //   _c.closePath();
    //   _c.fill();
    // }

    _e.globalCompositeOperation = "source-over";

    // for (let i in player.animation.vertices) {
    //   let v = player.animation.vertices[i];
    //   _c.fillStyle = "rgba(0,255,0,0.5)";
    //   _c.fillRect(v.x, v.y, 1, 1);
    // }
  }

  step() {
    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.step();
    }
  }
}

var sceneBGs = {
  mosaic: function(w, h) {
    for (let y=0; y<w; y++) {
      for (let x=0; x<w; x++) {
        let opacity = Math.random();

        setColor(_e, 226, opacity);

        let xo = 1 + Math.round(((Math.random()*2)-1));
        let yo = 1 + Math.round(((Math.random()*2)-1));
        _e.fillRect(x*8+xo, y*8+yo, 6, 6);
      }
    }

    let image = new Image();
    image.src = _extra.toDataURL();

    return image
  },
}