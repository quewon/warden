class scene {
  constructor(p) {
    this.name = p.name;
    this.aliens = p.aliens || [];
    this.static = p.static || [];
    this.camera = {};
    this.init(p.src);

    this.ambientLight = p.ambientLight || 0.001; //max: 0.99, min: 0.01 | 0.2, 0.6

    this.danger = p.danger || null;
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
    let bg = sceneBGs[Config.bgTexture](img.width, img.height);
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
    this.doormanspawns = [];

    for (let y=0; y<img.height/8; y++) {
      this.colmap[y] = [];
      this.shadowmap[y] = [];
      for (let x=0; x<img.width/8; x++) {
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

            switch (k) {
              case "alienspawn":
                this.alienspawns.push([x*8, y*8]);
                break;
              case "playerspawn":
                this.playerSpawn = { x: x*8, y: y*8 };
                break;
              case "doormanv":
                this.doormanspawns.push([x*8, y*8, 0])
                break;
              case "doormanh":
                this.doormanspawns.push([x*8, y*8, 1]);
                break;
              case "lightswitch":
                this.lightswitchSpawn = { x: x*8, y: y*8 };
                break;
            }

            break searchkey
          }
        }

        this.shadowmap[y][x] = 0;

      }
    }

    // find wall vertices

    // first, get the edges of walls in lines
    let lines = [];
    let overlaps = function(l) {
      for (let i in lines) {
        let line = lines[i];

        if (
          line.a.x == l.a.x &&
          line.a.y == l.a.y &&
          line.b.x == l.b.x &&
          line.b.y == l.b.y
        ) {
          return true
        }
      }
      return false
    };
    let lineAngle = function(cx, cy, ex, ey) {
      var dy = ey - cy;
      var dx = ex - cx;
      var theta = Math.atan2(dy, dx);
      theta *= 180 / Math.PI;
      return theta;
    };
    for (let y=0; y<this.colmap.length; y++) {
      for (let x=0; x<this.colmap[y].length; x++) {
        if (this.colmap[y][x] != "wall") continue;

        let tx = x*8;
        let ty = y*8;

        let line;

        // 4 lines
        // top
        if (y > 0 && this.colmap[y-1][x] != "wall") {
          line = {
            a: { x: tx, y: ty },
            b: { x: tx+8, y: ty },
            angle: lineAngle(tx, ty, tx+8, ty)
          };
          if (!overlaps(line)) lines.push(line);
        }
        // right
        if (x+1 < this.colmap[y].length && this.colmap[y][x+1] != "wall") {
          line = {
            a: { x: tx+8, y: ty },
            b: { x: tx+8, y: ty+8 },
            angle: lineAngle(tx+8, ty, tx+8, ty+8)
          };
          if (!overlaps(line)) lines.push(line);
        }
        // bottom
        if (
          x+1 < this.colmap[y].length &&
          y+1 < this.colmap.length &&
          this.colmap[y+1][x] != "wall"
        ) {
          line = {
            a: { x: tx, y: ty+8 },
            b: { x: tx+8, y: ty+8 },
            angle: lineAngle(tx, ty+8, tx+8, ty+8)
          };
          if (!overlaps(line)) lines.push(line);
        }
        // left
        if (x > 0 && this.colmap[y][x-1] != "wall") {
          line = {
            a: { x: tx, y: ty },
            b: { x: tx, y: ty+8 },
            angle: lineAngle(tx, ty, tx, ty+8)
          };
          if (!overlaps(line)) lines.push(line);
        }
      }
    }

    // second, consolidate lines that connect and have the same angle
    for (let i=lines.length-1; i>0; i--) {
      let l = lines[i];
      for (let x in lines) {
        let n = lines[x];

        if (
          l.a.x == n.b.x &&
          l.a.y == n.b.y &&
          l.angle == n.angle
        ) {
          n.b = { x: l.b.x, y: l.b.y };
          lines.splice(i, 1);
        } 
      }
    }

    this.lines = lines;

    // lastly, generate vertices from the lines!
    let verts = [];
    overlaps = function(v) {
      for (let i in verts) {
        let n = verts[i];
        if (v.x == n.x && v.y == n.y) {
          return true
        }
        return false
      }
    };
    for (let i in lines) {
      let l = lines[i];
      let v = { x: l.a.x, y: l.a.y };
      if (!overlaps(v)) verts.push(v);
      v = { x: l.b.x, y: l.b.y };
      if (!overlaps(v)) verts.push(v);
    }

    this.vertices = verts;

    // camera things

    let cm = this.colmap;
    let vpwidth = cm[0].length < Config.viewportWidth ? cm[0].length : Config.viewportWidth;
    let vpheight = cm.length < Config.viewportHeight ? cm.length : Config.viewportHeight;
    this.camera.dx = Math.round((Config.viewportWidth - vpwidth)/2)*8;
    this.camera.dy = Math.round((Config.viewportHeight - vpheight)/2)*8;
    this.camera.width = vpwidth*8;
    this.camera.height = vpheight*8;
  }

  spawnAliens() {
    let danger;
    if (this.danger) {
      danger = Math.random() * this.alienspawns.length | 0;
    }

    for (let c in this.alienspawns) {
      let coord = this.alienspawns[c];
      let a;
      if (c == danger) {
        a = new dangers[this.danger[0]]({
              scene: this.name,
            });
        console.log(c);
      } else {
        a = new alien({
              scene: this.name,
            });
      }
      let newx = coord[0] + 1.5*8 - a.colmap[0].length*4;
      let newy = coord[1] + 1.5*8 - a.colmap.length*4;
      let rx = newx >= this.colmap[0].length ? "ceil" : "floor";
      let ry = newy >= this.colmap.length ? "ceil" : "floor";
      a.setPosition(
        Math[rx]((newx)/8)*8,
        Math[ry]((newy)/8)*8
      );
    }

    for (let c in this.doormanspawns) {
      let p = this.doormanspawns[c];
      let a = new doorman({
        scene: this.name,
        orientation: p[2]
      });
      a.setPosition(
        Math.round(p[0]/8)*8,
        Math.round(p[1]/8)*8
      );
      a.setInstruction(
        Math.round(p[0]/8)*8,
        Math.round(p[1]/8)*8
      );
      if (Math.random() >= 0.5) {
        a.close()
      } else {
        a.open()
      }
    }

    if (this.lightswitchSpawn) {
      let lightswitch = new togglebox(bank.lightswitch);
      lightswitch.moveScene(this.name);
      lightswitch.setPosition(this.lightswitchSpawn.x, this.lightswitchSpawn.y);
    }
  }

  draw() {
    // camera
    let camera = player.animation.camera;
    let dx = this.camera.dx;
    let dy = this.camera.dy;
    let vx = camera.x;
    let vy = camera.y;
    let vw = this.camera.width;
    let vh = this.camera.height;
    let vmx = camera.mx;
    let vmy = camera.my;

    setColor(_c, 175);
    _c.fillRect(dx, dy, vw, vh);
    _c.drawImage(this.img, vx, vy, vw, vh, dx, dy, vw, vh);

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.update();
    }

    // highlight interactable

    if (player.interactable) {
      let alien = ref[player.interactable.id];
      let a = alien.animation.position;

      for (let y=0; y<alien.colmap.length; y++) {
        for (let x=0; x<alien.colmap[y].length; x++) {
          if (alien.colmap[y][x] == 0) continue;

          // setColor(_c, G.arrayRandom([237,226,201]));
          setColor(_c, alien.animation.highlight);
          _c.fillRect(
            a.x-1-vx+dx + x*8,
            a.y-1-vy+dy + y*8,
            10,
            10
          );
        }
      }
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
      alien.draw(vx-dx, vy-dy);
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
        opacity -= this.ambientLight;
        setColor(_c, 52, opacity);
        _c.fillRect(x*8-vx+dx, y*8-vy+dy, 8, 8);
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

    // for (let i in this.lines) {
    //   let line = this.lines[i];
    //   _c.lineWidth = 1;
    //   _c.strokeStyle = "rgba(0,255,0,0.5)";
    //   _c.beginPath();
    //   _c.moveTo(line.a.x-vx, line.a.y-vy);
    //   _c.lineTo(line.b.x-vx, line.b.y-vy);
    //   _c.closePath();
    //   _c.stroke();
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

        setColor(_e, 201, opacity);

        let xo = 1 + Math.round(((Math.random()*2)-1));
        let yo = 1 + Math.round(((Math.random()*2)-1));
        _e.fillRect(x*8+xo, y*8+yo, 6, 6);
      }
    }

    let image = new Image();
    image.src = _extra.toDataURL();

    return image
  },
  carpet: function(w, h) {
    for (let y=0; y<w; y++) {
      for (let x=0; x<w; x++) {
        let opacity = Math.random();

        setColor(_e, 201, opacity-0.5);
        _e.fillRect(x*8+1, y*8+1, 6, 6);
        _e.fillRect(x*8, y*8, 8, 8);
      }
    }

    let image = new Image();
    image.src = _extra.toDataURL();

    return image
  },
  ground: function(w, h) {
    for (let y=0; y<w; y++) {
      for (let x=0; x<w; x++) {
        if (Math.random() > 0.1) continue;

        let opacity = Math.random() - 0.2;

        setColor(_e, 132, opacity);

        let xo = 1 + Math.round(((Math.random()*2)-1));
        let yo = 1 + Math.round(((Math.random()*2)-1));
        _e.fillRect(x*8+xo, y*8+yo, 3+xo, 1);
      }
    }

    let image = new Image();
    image.src = _extra.toDataURL();

    return image
  },
}