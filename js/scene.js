class scene {
  constructor(p) {
    this.name = p.name;
    this.aliens = p.aliens || [];
    this.static = p.static || [];
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

    // find wall vertices

    let verts = [];
    for (let y=0; y<this.colmap.length; y++) {
      for (let x=0; x<this.colmap[y].length; x++) {
        if (this.colmap[y][x] != "wall") continue;

        var sx = 0, sy = 0;
        if (x==0) sx = 1;
        if (y==0) sy = 1;

        // check 4 corners
        for (let i=sy; i<2; i++) {
          for (let ii=sx; ii<2; ii++) {
            let vx = (x + ii) * 8;
            let vy = (y + i) * 8;

            let overlaps = false;
            for (let c in verts) {
              let coord = verts[c];
              if (coord.x == vx && coord.y == vy) {
                overlaps = true;
              }
            }

            if (
              vx >= this.colmap[0].length*8 ||
              vy >= this.colmap.length*8
            ) {
              overlaps = true;
            }

            if (!overlaps) verts.push({ x:vx, y:vy })
          }
        }
      }
    }

    this.vertices = verts;
  }

  spawnAliens() {
    for (let c in this.alienspawns) {
      let coord = this.alienspawns[c];
      let a = new alien({
        scene: this.name,
      });
      let newx = coord[0] + 1.5*8 - a.colmap[0].length*4;
      let newy = coord[1] + 1.5*8 - a.colmap.length*4;
      let rx = newx >= this.colmap[0].length ? "ceil" : "floor";
      let ry = newy >= this.colmap.length ? "ceil" : "floor";
      a.setPosition(
        Math[rx]((newx)/8)*8,
        Math[ry]((newy)/8)*8
      );
    }
  }

  draw() {
    // camera
    let camera = player.animation.camera;
    let vx = camera.x;
    let vy = camera.y;
    let vw = camera.width;
    let vh = camera.height;
    let vmx = camera.mx;
    let vmy = camera.my;

    setColor(_c, 175);
    _c.fillRect(0, 0, vw, vh);
    _c.drawImage(this.img, vx, vy, vw, vh, 0, 0, vw, vh);

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.update();
    }

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      let x = alien.position.x;
      let y = alien.position.y;
      let w = alien.colmap[0].length*8;
      let h = alien.colmap.length*8;
      if (
        (x > vmx || x+w < vx) &&
        (y > vmy || y+h < vy)
      ) {
        continue;
      }
      alien.draw(vx, vy);
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

    for (let y=0; y<this.shadowmap.length; y++) {
      for (let x=0; x<this.shadowmap[y].length; x++) {
        if (
          (x*8 > vmx || x*8+8 < vx) &&
          (y*8 > vmy || y*8+8 < vy)
        ) {
          continue;
        }

        let opacity = (Math.round((1-this.shadowmap[y][x])*4)/4).toFixed(1);
        opacity -= Config.ambientLight;
        setColor(_c, 52, opacity);
        _c.fillRect(x*8-vx, y*8-vy, 8, 8);
      }
    }

    _e.globalCompositeOperation = "source-over";

    // lighting debug

    // for (let i in player.animation.triangles) {
    //   let triangle = player.animation.triangles[i];
    //   _c.fillStyle = "rgba(255,255,255,0.5)";
    //   _c.beginPath();
    //   _c.moveTo(triangle.a.x-vx, triangle.a.y-vy);
    //   _c.lineTo(triangle.b.x-vx, triangle.b.y-vy);
    //   _c.lineTo(triangle.c.x-vx, triangle.c.y-vy);
    //   _c.closePath();
    //   _c.fill();
    // }

    // for (let i in this.vertices) {
    //   let v = this.vertices[i];
    //   _c.fillStyle = "rgba(0,255,0,0.5)";
    //   _c.fillRect(v.x-vx, v.y-vy, 1, 1);
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