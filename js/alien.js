class alien {
  constructor(p) {
    p = p || {};
    this.id = ref.length;
    this.type = p.type || "wanderer";

    if (p.src && this.type != "doorman") {
      if (p.src in imgs_filtered) {
        this.img = imgs_filtered[p.src];
      } else {
        this.img = spriteFilter(imgs[p.src], this.type);
        imgs_filtered[p.src] = this.img;
      }
    } else {
      this.createImage();
    }

    this.state = "idle";

    if (!this.colmap) this.colmap = p.colmap;
    this.colnum = 0;
    for (let y in this.colmap) {
      for (let x in this.colmap[y]) {
        if (this.colmap[y][x] != 0) {
          this.colnum++;
        }
      }
    }
    if (this.type=="player") {
      this.position = scenes[p.scene].playerSpawn
    } else {
      this.position = p.position || { x:0, y:0 };
    }
    this.phys = { power: 1, weight: 1 };
    this.animation = {
      position: { x: this.position.x, y: this.position.y },
      flip: false,
      time: 0,
      distortion: [0, 0],
      distortionTime: 0,
      color: { value: 52, on: false, blendmode: null },
      colorTime: 0,
      duds: [],
      highlight: 94,
      danceTime: 0,
    };
    this.buffer = [];
    this.speed = 0.06;

    this.reach = 1;
    this.activated = false;
    this.sfx;

    // element
    if (this.type in bank.dialog) {
      this.dialog = G.arrayRandom(bank.dialog[this.type]);
    } else {
      this.dialog = "";
    }
    this.el = document.createElement("div");
    this.el.style.width = this.colmap[0].length*8*Config.viewportScale+"px";
    this.el.style.height = 8*Config.viewportScale+"px";
    this.el.className = "dialog invisible";
    let nt = document.createElement("div");
    this.el.appendChild(nt);
    _dialog.appendChild(this.el);

    this.moveScene(p.scene || "hub");

    ref.push(this);
  }

  createImage() {
    let m = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    let w = m[0].length;
    let h = m.length;

    _extra.width = w * 8;
    _extra.height = h * 8;

    // place head on random tile

    let x = Math.random() * w | 0;
    let y = Math.random() * h | 0;

    const headY = y;

    m[y][x] = "body";

    if (y < h-1) {
      y = headY;
      if (x+1 < w && Math.round(Math.random()) == 0) {
        m[y][x+1] = "right shoulder";
        y = headY+1;
        while (y < h) {
          m[y][x+1] = "body";

          y++;
        }
      }
      y = headY;
      if (x-1 >= 0 && Math.round(Math.random()) == 0) {
        m[y][x-1] = "left shoulder";
        y = headY+1;
        while (y < h) {
          m[y][x-1] = "body";

          y++;
        }
      }

      // fill out tiles in rows below head

      // start from right under the head
      // and add a body tile when its not connected to any other tile

      y = headY+1;
      while (y < h) {
        m[y][x] = "body";

        y++;
      }

      for (let x in m[h-1]) {
        if (m[h-1][x] == "body") m[h-1][x] = "leg";
      }

      if (
        m[h-1][0] == "leg" &&
        m[h-1][w-1] == "leg" &&
        Math.round(Math.random()) == 0
      ) {
        for (let x=1; x<w-1; x++) {
          if (Math.round(Math.random()) == 0) {
            m[h-1][x] = 0;
          } else {
            m[h-1][x] = "body";
          }
        }
      }

    } else { //head is on bottom row
      if (x+1 < w && Math.round(Math.random()) == 0) {
        m[y][x+1] = "leg";
      }
      if (x-1 >= 0 && Math.round(Math.random()) == 0) {
        m[y][x-1] = "leg";
      }
    }

    let headspots = [];
    for (let y in m) {
      for (let x in m[y]) {
        if (m[y][x] == "body") headspots.push([x, y])
      }
    }

    let headspot = G.arrayRandom(headspots);
    m[headspot[1]][headspot[0]] = "head";

    // DRAW IT!!

    for (let y=0; y<m.length; y++) {
      for (let x=0; x<m[y].length; x++) {
        switch (m[y][x]) {
          case "head":
            _e.putImageData(
              G.arrayRandom(alienParts.heads.tiles),
              x * 8, y * 8
            );
            if (y>0) {
              if (m[y-1][x] != 0) {
                _e.fillRect(x*8, y*8, 8, 1);
              }
            }
            if (x>0) {
              if (m[y][x-1] != 0) {
                setColor(_e, 237, 1);
                _e.fillRect(x*8, y*8, 1, 1);
              }
            }
            if (x<m[0].length-1) {
              if (m[y][x+1] != 0) {
                setColor(_e, 237, 1);
                _e.fillRect(x*8+7, y*8, 1, 1);
              }
            }
            break;
          case "right shoulder":
            _e.putImageData(
              G.arrayRandom(alienParts["right shoulders"].tiles),
              x * 8, y * 8
            );
            break;
          case "left shoulder":
            _e.putImageData(
              G.arrayRandom(alienParts["left shoulders"].tiles),
              x * 8, y * 8
            );
            break;
          case "body":
            // setColor(_e, 94, 1);
            setColor(_e, 237, 1);
            _e.fillRect(x*8, y*8, 8, 8);
            // setColor(_e, 237, 1);
            // _e.fillRect(x*8+1, y*8+1, 6, 6);
            break;
          case "leg":
            _e.putImageData(
              G.arrayRandom(alienParts.legs.tiles),
              x * 8, y * 8
            );
            break;
        }
      }
    }

    y = headY;

    if (y > 0) { // there is space above head... for horns!
      for (let x in m[y]) {
        if (m[y][x] == 0) continue;
        if (Math.round(Math.random()) == 0) continue;

        // there is a tile here

        // get bottom px of horn img
        // if x coords of bottom px that is not transparent
        // and x coords of top px of tile is also not transparent
        // then horn can be placed

        let horndata = G.arrayRandom(alienParts.horns.tiles);
        let data = horndata.data;

        let opaque = [];

        for (
          let i=horndata.width*4*(horndata.height-1);
          i<data.length;
          i+=4
        ) {
          if (data[i+3] != 0) opaque.push(i/4 % horndata.width);
        }

        let tiledata = _e.getImageData(x*8, y*8, 8, 1);
        data = tiledata.data;

        let matchcounter = 0;

        for (let i=0; i<opaque.length; i++) {
          let x = opaque[i]*4;
          if (data[x+3] != 0) matchcounter++;
        }

        if (matchcounter == opaque.length) {
          _e.putImageData(horndata, x*8, (y-1)*8);
          m[y-1][x] = "horn";
        }
      }
    }

    let minX = null, minY = null;
    let maxX = 0;
    let maxY = 0;

    for (let y=0; y<m.length; y++) {
      for (let x=0; x<m[y].length; x++) {
        if (m[y][x] == 0) continue;

        if (minX === null) minX = x;
        if (minY === null) minY = y;
        if (x < minX) minX = x;
        if (y < minY) minY = y;

        maxX = x;
        maxY = y;
      }
    }

    let imgdata = _e.getImageData(minX*8, minY*8, (maxX-minX+1)*8, (maxY-minY+1)*8);

    _extra.width = (maxX-minX+1)*8;
    _extra.height = (maxY-minY+1)*8;

    _e.putImageData(imgdata, 0, 0);

    // apply texture
    alienTextures[Config.alienTexture]();

    let image = new Image();
    image.src = _extra.toDataURL();

    let map = [];
    let i = 0;
    for (let y=minY; y<=maxY; y++) {
      map[i] = [];
      for (let x=minX; x<=maxX; x++) {
        if (m[y][x] != 0) {
          map[i].push(1)
        } else {
          map[i].push(0)
        }
      }
      i++;
    }

    this.colmap = map;
    this.img = image;
  }

  setPosition(x, y) {
    this.position = { x:x, y:y };
    if ('animation' in this) {
      this.animation.position = { x:x, y:y };
    }
  }

  moveScene(s) {
    if ('scene' in this) {
      const aliens = scenes[this.scene].aliens;
      scenes[this.scene].aliens.splice(aliens.indexOf(this.id), 1);

      if (this.type=="player") {
        scenes[this.scene].clearDialog();
      }
    }
    scenes[s].aliens.push(this.id)
    this.scene = s;
    if (this.type=="player") {
      const spawn = scenes[s].playerSpawn;
      this.setPosition(spawn.x, spawn.y);
      this.getCamera();
      this.findDuds();
      scenes[s].unclearDialog();
    } else {
      this.clearDialog();
      this.endStep();
    }
    if (this.sfx) this.sfx.stop();
  }

  sound(name) {
    if (name in sounds) {
      this.sfx = G.arrayRandom(sounds[name]);
      this.updateSound();
      this.sfx.play();
    }
  }

  updateSound() {
    if (!this.sfx) return;

    let volume = 1;
    let pan = 0;
    if (this.type != "player") {
      if (!player) {
        volume = 0;
      } else if (player.scene == this.scene) {
        // get distance to player

        let a = (this.animation.position.x + this.img.width/2) - (player.animation.position.x + 4);
        let b = (this.animation.position.y + this.img.height/2) - (player.animation.position.y + 4);
        let dist = Math.sqrt( a*a + b*b );

        volume = 1 - dist/100;
        if (volume < 0) volume = 0;

        if (a < 0) {
          pan = -1;
        } else if (a > 0) {
          pan = 1;
        }
        pan *= 1 - volume;
      }
    }

    this.sfx.stereo(pan);
    this.sfx.volume(volume);
  }

  // turn/step/move

  step() {
    let move;
    switch (this.type) {

      case "player":
        break;

      case "wanderer":
        move = [0, 0];

        for (let i in scenes[this.scene].aliens) {
          switch (Math.random() * 4 | 0) {
            case 0:
              move = [0, 1];
              break;
            case 1:
              move = [0, -1];
              break;
            case 2:
              move = [1, 0];
              break;
            case 3:
              move = [-1, 0];
              break;
          }
        }

        if (this.colliding(this.position.x+move[0]*8, this.position.y+move[1]*8).length == 0) {
          this.move(move[0], move[1]);
        }
        break;

      case "medusa":
        move = [0, 0];

        for (let i in scenes[this.scene].aliens) {
          switch (Math.random() * 4 | 0) {
            case 0:
              move = [0, 1];
              break;
            case 1:
              move = [0, -1];
              break;
            case 2:
              move = [1, 0];
              break;
            case 3:
              move = [-1, 0];
              break;
          }
        }

        this.move(move[0], move[1]);
        break;

      case "doorman":
        if (!this.activated) break;

        let goal = this.instruction.origin[this.instruction.index];

        let xdiff = goal.x - this.position.x;
        let ydiff = goal.y - this.position.y;

        if (xdiff > 0) xdiff = 1;
        else if (xdiff < 0) xdiff = -1;
        if (xdiff == 0) {
          if (ydiff > 0) ydiff = 1;
          else if (ydiff < 0) ydiff = -1;
        } else {
          ydiff = 0;
        }

        this.pushbuffer([xdiff, ydiff]);
        break;
    }

    if (this.type=="player") {
      this.sound("step");
    }
  }

  endStep() {
    switch (this.type) {
      case "player":
        this.findDuds();
        break;
      case "doorman":
        let goal = this.instruction.origin[this.instruction.index];
        if (this.position.x == goal.x && this.position.y == goal.y) {
          this.deactivate();
        }
        break;
      case "stone":
        break;
      default:
        this.deactivate();
        break;
    }
  }

  // lighting

  findDuds() {
    let colmap = scenes[this.scene].colmap;
    let verts = [];

    // copy vertices
    for (let i in scenes[this.scene].vertices) {
      let v = scenes[this.scene].vertices[i];
      verts.push({
        x: v.x,
        y: v.y
      })
    }

    // sort vertices by angle
    let px = this.position.x+4;
    let py = this.position.y+4;

    for (let i in verts) {
      let c = verts[i];

      // change vertices that are behind a wall
      let ray = this.rayBlocked(
            {x:px, y:py},
            {x:c.x, y:c.y}
          );

      if (ray) {
        c.x = ray.x;
        c.y = ray.y;
      }

      c.angle = Math.atan2(c.y-py, c.x-px);
    }

    verts = verts.sort((a, b) => a.angle - b.angle);

    // cast triangles
    var triangles = [];

    for (let i=0; i<verts.length; i++) {
      let c = verts[i];
      let nc;

      if (i+1 > verts.length-1) {
        nc = verts[0];
      } else {
        nc = verts[i+1];
      }

      triangles.push({
        a: { x: px, y: py },
        b: { x: c.x, y: c.y },
        c: { x: nc.x, y: nc.y }
      });
    };

    this.animation.triangles = triangles;

    let camera = this.animation.camera;
    let cx = camera.x/8;
    let cy = camera.y/8;
    let cmx = camera.mx/8;
    let cmy = camera.my/8;

    // check if point in the center of tile is within triangle
    let isdud = [];
    for (let y=cy; y<cmy; y++) {
      isdud[y] = [];
      dudsearch: for (let x=cx; x<cmx; x++) {
        isdud[y][x] = true;

        if (colmap[y][x] == "wall") {
          isdud[y][x] = false;
          continue;
        }

        let tx = x*8 + 4;
        let ty = y*8 + 4;

        // if triangle intersects with tile, tile is false

        triangle: for (let t in triangles) {
          let tr = triangles[t];

          if (pointInTriangle({x: tx, y: ty}, tr.a, tr.b, tr.c)) {
            isdud[y][x] = false;
            break triangle;
          }
        }

      }
    }

    this.animation.duds = isdud;
  }

  rayBlocked(a, b) {
    let camera = this.animation.camera;
    let cx = camera.x/8;
    let cy = camera.y/8;
    let cmx = camera.mx/8;
    let cmy = camera.my/8;

    // draw a line segment starting at a and ending at b
    // get the first point where the line segment intersects a wall
    // if the point is equal to b, then return false
    // else : true

    // go through walls in order of how far away it is from a

    let colmap = scenes[this.scene].colmap;
    let distanced = [];

    for (let y=cy; y<cmy; y++) {
      for (let x=cx; x<cmx; x++) {
        if (colmap[y][x] != "wall") continue;

        distanced.push({
          x: x*8,
          y: y*8,
          dist: Math.sqrt((a.x-x*8)*(a.x-x*8), (a.y-y*8)*(a.y-y*8)),
        });
      }
    }

    distanced = distanced.sort((a,b) => a.dist - b.dist);

    for (let i in distanced) {
      let d = distanced[i];
      let cx = d.x;
      let cy = d.y;

      let lb = liangBarsky(a.x, a.y, b.x, b.y, [cx, cx+8, cy, cy+8]);

      if (lb) {
        return { x: lb[0][0], y: lb[0][1] }
      }
    }

    return false
  }

  light() {
    let array = circle(Config.softLightRadius);
    let map = scenes[this.scene].shadowmap;
    let isdud = this.animation.duds;

    let px = Math.round(this.position.x/8);
    let py = Math.round(this.position.y/8);

    // light tiles
    for (let c in array) {
      let coord = array[c];
      let x = px + array[c][0];
      let y = py + array[c][1];

      if (
        x >= 0 && x < map[0].length &&
        y >= 0 && y < map.length
      ) {
        if (!isdud[y][x])
          map[y][x] = 0.3;
      }
    }

    array = circle(Config.softLightRadius-1);

    for (let c in array) {
      let coord = array[c];
      let x = px + array[c][0];
      let y = py + array[c][1];

      if (
        x >= 0 && x < map[0].length &&
        y >= 0 && y < map.length
      ) {
        if (!isdud[y][x])
          map[y][x] = 0.75;
      }
    }

    array = circle(Config.hardLightRadius);

    for (let c in array) {
      let coord = array[c];
      let x = px + array[c][0];
      let y = py + array[c][1];

      if (
        x >= 0 && x < map[0].length &&
        y >= 0 && y < map.length
      ) {
        if (!isdud[y][x])
          map[y][x] = 1;
      }
    }
  }

  // drawing

  getCamera() {
    let camera = scenes[this.scene].camera;
    let vx=0;
    let vy=0;
    let x = this.animation.position.x;
    let y = this.animation.position.y;
    let vw = camera.width;
    let vh = camera.height;
    let vwh = camera.width/2;
    let vhh = camera.height/2;
    let sw = scenes[this.scene].colmap[0].length*8;
    let sh = scenes[this.scene].colmap.length*8;
    if (x >= sw-vwh) {
      vx = sw-vw
    } else if (x >= vwh) {
      vx = x - vwh
    }
    if (y >= sh-vhh) {
      vy = sh-vh;
    } else if (y >= vhh) {
      vy = y - vhh
    }

    this.animation.camera = {
      x: vx,
      y: vy,
      mx: vx+vw,
      my: vy+vh
    };
  }

  update() {
    if (this.type=="player") {
      this.light();
      this.getCamera();
    }

    if (this.activated && this.animation.color.on) {
      this.animation.distortionTime++;
      this.animation.colorTime++;
    } else {
      this.animation.distortionTime = 0;
      this.animation.colorTime = 0;
    }

    if (this.animation.time >= 0.5 && this.buffer.length > 0) {
      if (this.buffer[0][1] == 0) {
        this.squash();
      } else {
        this.stretch();
      }
    } else {
      this.proportional();
    }

    if (this.hears().includes("jukebox")) {
      this.animation.danceTime++;
    } else {
      this.animation.danceTime = 0;
    }

    if ('toggle' in this) {
      if (this.activated) {
        this.toggle.time--;
        if (this.toggle.time >= 8) this.bonk();
        else if (this.toggle.time <= 0) this.deactivate();
      }
    }

    if (this.animation.time < 1 && this.buffer.length > 0) {
      let speed = this.speed;

      if (this.buffer.length > 2) {
        speed += Math.pow(this.buffer.length-1, 1.5) * this.speed;
      } else {
        speed += this.speed;
      }

      let t = this.animation.time + speed;
      if (t > 1) t = 1;

      let nudge = this.nudge(this.buffer[0], t);

      if (nudge) {
        if (this.animation.time == 0) {
          if (this.type=="player") scenes[this.scene].step();
        }

        this.animation.time = t;
      } else {
        this.buffer.shift();
      }
    } 
    else if (this.buffer.length > 0) {
      this.position = {
        x: this.animation.position.x,
        y: this.animation.position.y
      };
      this.buffer.shift();
      this.animation.time = 0;

      if (this.type=="player") {
        // aliens don't get stuck with their
        // dialog elements on when they're not moving

        scenes[this.scene].endStep();
      } else {
        this.endStep();
      }
    }

    this.findInteractable();
    this.colignore = null;
    this.updateSound();
  }

  squash() {
    this.animation.distortion = [1, -1];
  }

  stretch() {
    this.animation.distortion = [-1, 1];
  }

  bonk() {
    this.animation.distortion = [0, -1];
  }
 
  proportional() {
    this.animation.distortion = [0, 0];
  }

  draw(xo, yo) {
    let offset = [0, 0];

    if (this.buffer.length > 0) {
      offset[0] += this.animation.distortion[0] + this.buffer[0][0];
      offset[1] += this.animation.distortion[1] + this.buffer[0][1];
    } else if (this.animation.distortionTime <= 0) {
      offset[0] += this.colmap[0].length * this.animation.distortion[0];
      offset[1] += this.colmap.length * this.animation.distortion[1];
    } else {
      offset[0] += this.animation.distortion[0]/2;
      offset[1] += this.animation.distortion[1]/2;
    }

    if (this.activated && this.animation.distortionTime > 0) {
      let o = Math.sin(this.animation.distortionTime * 0.5);
      offset[this.orientation] += o;
    } else if (this.animation.danceTime > 0) {
      offset[0] += Math.round(Math.sin(this.animation.danceTime/10)/1.5);
      offset[1] += Math.round(Math.cos(this.animation.danceTime/10)/1.5);
    }

    offset[0] += xo;
    offset[1] += yo;

    let x = this.animation.position.x - offset[0];
    let y = this.animation.position.y - offset[1];
    let width = this.img.width + this.animation.distortion[0];
    let height = this.img.height + this.animation.distortion[1];

    drawImage({
      img: this.img,
      x: x,
      y: y,
      flip: this.animation.flip,
      width: width,
      height: height
    });

    if (this.animation.colorTime > 0 && this.animation.color.on) {
      let v = this.animation.color.value;
      _c.globalCompositeOperation = this.animation.color.blendmode;
      let opacity = Math.sin(this.animation.colorTime * 0.05) + 0.5;
      setColor(_c, v, opacity);
      _c.fillRect(x, y, width, height);
      _c.globalCompositeOperation = "source-over";
    }

    // dialogue

    x *= Config.viewportScale;
    y *= Config.viewportScale;

    this.el.style.left = x+"px";
    this.el.style.top = y+"px";
  }

  // movement

  move(x, y) {
    if (this.buffer.length == 0) {
      this.buffer.push([x, y]);
    }
  }

  pushbuffer(array) {
    this.buffer.push(array);
  }

  nudge(input, t) {
    let x = this.position.x;
    let y = this.position.y;
    let dx = x + (input[0] * 8);
    let dy = y + (input[1] * 8);

    let newx = Math.round(lerp(x, dx, t));
    let newy = Math.round(lerp(y, dy, t));

    if (this.type=="player") {
      if (input[0] < 0) {
        this.animation.flip = true;
      } else if (input[0] > 0) {
        this.animation.flip = false;
      }
    }

    let stuck = false;

    if (this.colliding(dx, dy, input, t).length == 0 && !stuck) {
      this.animation.position.x = newx;
      this.animation.position.y = newy;

      return true
    } else {
      return false
    }
  }

  // collision

  colliding(x, y, input, t) {
    let w = this.img.width;
    let h = this.img.height;

    // aliens

    let aliens = scenes[this.scene].aliens;

    let col = [];

    // walls

    let colmap = scenes[this.scene].colmap;

    wallsearch: for (let ty=0; ty<this.colmap.length; ty++) {
      for (let tx=0; tx<this.colmap[ty].length; tx++) {
        let cy = y/8 + ty;
        let cx = x/8 + tx;

        if (
          cy < 0 || cx < 0 ||
          cy >= colmap.length || cx >= colmap[0].length
          ) {
          col.push({
            id: -1,
            position: {
              x: cx*8,
              y: cy*8,
            },
            colmap: [[1]],
            animation: { time: 0 },
            buffer: [],
            wall: true,
          });
        } else if (colmap[cy][cx] == "wall") {
          col.push({
            id: -1,
            position: {
              x: cx*8,
              y: cy*8,
            },
            colmap: [[1]],
            animation: { time: 0 },
            buffer: [],
            wall: true,
          });
        } else if (colmap[cy][cx] == "portal") {
          col.push({
            id: -1,
            position: {
              x: cx*8,
              y: cy*8,
            },
            colmap: [[1]],
            animation: { time: 0 },
            buffer: [],
            portal: true,
          });
        }
      }
    }

    for (let a in aliens) {
      let alien = ref[aliens[a]];
      if (this.id == alien.id) continue;
      if (alien.id == this.colignore) continue;

      let ax = alien.position.x;
      let ay = alien.position.y;
      let aw = alien.img.width;
      let ah = alien.img.height;

      if (
        x < ax + aw &&
        x + w > ax &&
        y < ay + ah &&
        y + h > ay
      ) {
        col.push(alien);

      } else if (
        input && 
        alien.animation.time != 0 &&
        alien.buffer.length > 0
      ) {
        let adx = ax+alien.buffer[0][0]*8;
        let ady = ay+alien.buffer[0][1]*8;

        if (
          x < adx + aw &&
          x + w > adx &&
          y < ady + ah &&
          y + h > ady
        ) {
          col.push(alien)
        }
      }
    }

    var allcols = [];
    let portalcount = this.colnum;

    for (let a in col) {
      var alien = col[a];

      for (let ty in this.colmap) {
        for (let tx in this.colmap[ty]) {
          if (this.colmap[ty][tx] == 0) continue;

          if ('wall' in alien) {
            if (
              x + (tx*8) == alien.position.x &&
              y + (ty*8) == alien.position.y
            ) {
              return ['wall']
            }
          } else if ('portal' in alien) {
            if (
              x + (tx*8) == alien.position.x &&
              y + (ty*8) == alien.position.y
            ) {
              portalcount--;
              if (portalcount <= 0) {
                if (input && t) {
                  playsound("portal");
                  this.moveScene(scenes[this.scene].portal);
                }
                return ['portal']
              }
            }
          } else {
            colmapsearch: for (let ay in alien.colmap) {

              for (let ax=0; ax<alien.colmap[ay].length; ax++) {
                if (alien.colmap[ay][ax] == 0) continue;

                let apx = alien.position.x;
                let apy = alien.position.y;

                // if (alien.animation.time != 0 && alien.buffer.length > 0) {
                //   apx += alien.buffer[0][0]*8;
                //   apy += apy+alien.buffer[0][1]*8;
                // }

                if (
                  x + (tx*8) == apx + (ax*8) &&
                  y + (ty*8) == apy + (ay*8)
                ) {
                  if (input && t) {
                    // if alien is moving
                    // and is headed to a different tile, then that
                    // should be accounted for

                    // alien is moving
                    if (
                      alien.animation.time != 0 &&
                      alien.buffer.length > 0
                    ) {
                      let adx = apx+alien.buffer[0][0]*8;
                      let ady = apy+alien.buffer[0][1]*8;

                      if ( // headed to the different tiles
                        x + (tx*8) != adx + (ax*8) ||
                        y + (ty*8) != ady + (ay*8)
                      ) {
                        continue;
                      }
                    }

                    if (!alien.activated) {
                      alien.activate(this);
                      if ('affect' in this) {
                        this.affect(alien);
                      }
                    }

                    if (alien.phys.weight > this.phys.power) {
                      allcols.push(alien);
                      break colmapsearch
                    }
                    alien.colignore = this.id;
                    let nudge = alien.nudge(input, t);
                    if (nudge) {
                      alien.animation.time = t;
                      alien.move(input[0], input[1]);
                    } else {
                      allcols.push(alien);
                      break colmapsearch
                    }
                  } else {
                    allcols.push(alien);
                    break colmapsearch
                  }
                } else if ( //this and alien is moving
                  alien.animation.time != 0 &&
                  alien.buffer.length > 0 &&
                  input && t
                ) {
                  let adx = apx+alien.buffer[0][0]*8;
                  let ady = apy+alien.buffer[0][1]*8;

                  if ( // headed to the same tile
                    x + (tx*8) == adx + (ax*8) &&
                    y + (ty*8) == ady + (ay*8)
                  ) {
                    this.setPosition(this.position.x, this.position.y);
                    allcols.push(alien);
                    break colmapsearch
                  }
                }
              }
            }
          }
        }
      }

    }

    return allcols
  }

  hears() {
    let hearing = [];

    const aliens = scenes[this.scene].aliens;
    for (let a of aliens) {
      let alien = ref[a];
      if (!alien.sfx) continue;
      else if (!alien.sfx.playing()) continue;

      let x = (this.animation.position.x + this.img.width/2) - (alien.animation.position.x + alien.img.width/2);
      let y = (this.animation.position.y + this.img.height/2) - (alien.animation.position.y + alien.img.height/2);
      let dist = Math.sqrt( x*x + y*y );

      let volume = 1 - dist/100;
      if (volume > 0) {
        hearing.push(alien.type);
      }
    }

    return hearing
  }

  // interaction

  findInteractable() {
    this.interactable = null;

    search: for (let y=-1*this.reach; y<=this.reach; y++) {
      let sx = y==-1*this.reach || y==this.reach ? 1 : 0;
      let smx = y==-1*this.reach || y==this.reach ? 1 : 0;
      for (let x=-1*this.reach+sx; x<=this.reach-smx; x++) {
        let cols = this.colliding(this.position.x+x*8, this.position.y+y*8);
        if (cols.length > 0) {
          if (typeof cols[0] === "string") continue;
          this.interactable = cols[0];
          break search;
        }
      }
    }
  }

  activate(activator) {
    this.activated = true;
    if ('toggle' in this) this.toggle.time = this.toggle.buffer;
    if(this.type in bank.dialog) {
      this.el.querySelector("div").textContent = G.arrayRandom(bank.dialog[this.type]);
      this.el.classList.remove("invisible");
    }

    switch (this.type) {
      case "doorman":
        this.instruction.index++;
        if (this.instruction.index >= this.instruction.origin.length) this.instruction.index = 0;

        this.animation.color.value = 94;
        this.animation.color.blendmode = "screen";
        this.animation.color.on = true;
        activator.sound("doorman");
        break;
      case "lightswitch":
        let light = scenes[this.scene].ambientLight;
        switch (light) {
          case 0.001:
            light = 0.2;
            break;
          case 0.2:
            light = 0.6;
            break;
          case 0.6:
            light = 0.99;
            break;
          case 0.99:
            light = 0.001;
            break;
        }
        scenes[this.scene].ambientLight = light;
        activator.sound("switch");
        break;
      case "jukebox":
        activator.sound("scratch");
        if (this.sfx.playing()) {
          this.sfx.pause();
        } else {
          this.sound(this.music);
        }
        break;
      default:
        this.sound(this.type);
        break;
    }
  }

  deactivate() {
    this.activated = false;
    this.animation.color.on = false;
    this.clearDialog();
  }

  clearDialog() {
    if (this.el) this.el.classList.add("invisible");
  }

  unclearDialog() {
    if(this.el && this.activated) {
      this.el.querySelector("div").textContent = G.arrayRandom(bank.dialog[this.type]);
      this.el.classList.remove("invisible");
    }
  }
}

class doorman extends alien {
  constructor(P) {
    super(P);
    this.type = "doorman";
    this.orientation = P.orientation;
    this.phys.weight = 2;
    this.changeImage(this.orientation);
    this.animation.highlight = 52;

    this.dialog = G.arrayRandom(bank.dialog.doorman);
    this.el.style.width = this.colmap[0].length*8*Config.viewportScale+"px";
  }

  setPosition(x, y) {
    this.position = { x:x, y:y };
    if ('animation' in this) {
      this.animation.position = { x:x, y:y };
    }
  }

  setInstruction(x, y) {
    let origin2 = [x, y];
    origin2[this.orientation] += 24;
    this.instruction = {
      origin: [
        {
          x: x,
          y: y,
        },
        {
          x: origin2[0],
          y: origin2[1],
        }
      ],
      index: 0,
    }
  }

  changeImage(orientation) {
    let m;
    switch (orientation) {
      case 0:
        m = [
          [0, 0, 0]
        ];
        break;

      case 1:
        m = [
          [0],
          [0],
          [0]
        ];
        break;
    }

    let w = m[0].length;
    let h = m.length;

    _extra.width = w * 8;
    _extra.height = h * 8;

    let x = 0;
    let y = 0;

    if (orientation == 0) x = 1;

    const headY = y;

    m[y][x] = "body";

    if (y < h-1) {
      y = headY;

      // fill out tiles in rows below head

      // start from right under the head
      // and add a body tile when its not connected to any other tile

      y = headY+1;
      while (y < h) {
        m[y][x] = "body";

        y++;
      }

      for (let x in m[h-1]) {
        if (m[h-1][x] == "body") m[h-1][x] = "leg";
      }

      if (
        m[h-1][0] == "leg" &&
        m[h-1][w-1] == "leg" &&
        Math.round(Math.random()) == 0
      ) {
        for (let x=1; x<w-1; x++) {
          if (Math.round(Math.random()) == 0) {
            m[h-1][x] = 0;
          } else {
            m[h-1][x] = "body";
          }
        }
      }

    } else { //head is on bottom row
      if (x+1 < w) {
        m[y][x+1] = "leg";
      }
      if (x-1 >= 0) {
        m[y][x-1] = "leg";
      }
    }

    let headspots = [];
    for (let y in m) {
      for (let x in m[y]) {
        if (m[y][x] == "body") headspots.push([x, y])
      }
    }

    let headspot = G.arrayRandom(headspots);
    m[headspot[1]][headspot[0]] = "head";

    // DRAW IT!!

    for (let y=0; y<m.length; y++) {
      for (let x=0; x<m[y].length; x++) {
        switch (m[y][x]) {
          case "head":
            _e.putImageData(
              G.arrayRandom(alienParts.heads.tiles),
              x * 8, y * 8
            );
            if (y>0) {
              if (m[y-1][x] != 0) {
                _e.fillRect(x*8, y*8, 8, 1);
              }
            }
            if (x>0) {
              if (m[y][x-1] != 0) {
                setColor(_e, 237, 1);
                _e.fillRect(x*8, y*8, 1, 1);
              }
            }
            if (x<m[0].length-1) {
              if (m[y][x+1] != 0) {
                setColor(_e, 237, 1);
                _e.fillRect(x*8+7, y*8, 1, 1);
              }
            }
            break;
          case "right shoulder":
            _e.putImageData(
              G.arrayRandom(alienParts["right shoulders"].tiles),
              x * 8, y * 8
            );
            break;
          case "left shoulder":
            _e.putImageData(
              G.arrayRandom(alienParts["left shoulders"].tiles),
              x * 8, y * 8
            );
            break;
          case "body":
            // setColor(_e, 94, 1);
            setColor(_e, 237, 1);
            _e.fillRect(x*8, y*8, 8, 8);
            // setColor(_e, 237, 1);
            // _e.fillRect(x*8+1, y*8+1, 6, 6);
            break;
          case "leg":
            _e.putImageData(
              G.arrayRandom(alienParts.legs.tiles),
              x * 8, y * 8
            );
            break;
        }
      }
    }

    let minX = null, minY = null;
    let maxX = 0;
    let maxY = 0;

    for (let y=0; y<m.length; y++) {
      for (let x=0; x<m[y].length; x++) {
        if (m[y][x] == 0) continue;

        if (minX === null) minX = x;
        if (minY === null) minY = y;
        if (x < minX) minX = x;
        if (y < minY) minY = y;

        maxX = x;
        maxY = y;
      }
    }

    let imgdata = _e.getImageData(minX*8, minY*8, (maxX-minX+1)*8, (maxY-minY+1)*8);

    let oc = Config.filter[237];
    let nc = Config.filter[201];
    let ooc = Config.filter[94];
    let noc = Config.filter[52];
    let data = imgdata.data;
    for (let i=0; i<data.length; i+=4) {
      if (
        data[i]   == oc[0] &&
        data[i+1] == oc[1] &&
        data[i+2] == oc[2]
      ) {
        data[i]   = nc[0];
        data[i+1] = nc[1];
        data[i+2] = nc[2];
      } else if (
        data[i]   == ooc[0] &&
        data[i+1] == ooc[1] &&
        data[i+2] == ooc[2]
      ) {
        data[i]   = noc[0];
        data[i+1] = noc[1];
        data[i+2] = noc[2];
      }
    }

    _extra.width = (maxX-minX+1)*8;
    _extra.height = (maxY-minY+1)*8;

    _e.putImageData(imgdata, 0, 0);

    // apply texture
    alienTextures[Config.alienTexture](52);

    let image = new Image();
    image.src = _extra.toDataURL();

    let map = [];
    let i = 0;
    for (let y=minY; y<=maxY; y++) {
      map[i] = [];
      for (let x=minX; x<=maxX; x++) {
        if (m[y][x] != 0) {
          map[i].push(1)
        } else {
          map[i].push(0)
        }
      }
      i++;
    }

    this.colmap = map;
    this.img = image;
  }

  close() {
    let p = this.instruction.origin[1];
    this.setPosition(p.x, p.y);
    this.instruction.index = 1;
  }

  open() {
    let p = this.instruction.origin[0];
    this.setPosition(p.x, p.y);
    this.instruction.index = 0;
  }
}

class togglebox extends alien {
  constructor(P) {
    super(P);
    this.toggle = {
      time: 0,
      buffer: 10,
    };
    this.animation.highlight = 52;

    if (this.type=="jukebox") {
      this.music = P.music || null;
      this.sound(this.music);
    }
  }
}

var dangers = {
  medusa: class extends alien {
    constructor(P) {
      super(P);
      this.type = "medusa";
    }

    affect(alien) {
      alien.type = "stone";
      alien.activate();
    }
  }
};

var alienTextures = {
  mosaic: function() {
    let details = _e.getImageData(0, 0, _extra.width, _extra.height);

    _e.globalCompositeOperation = "source-atop";

    for (let y=0; y<_extra.height; y++) {
      for (let x=0; x<_extra.width; x++) {
        let opacity = Math.random()*0.2;

        setColor(_e, 226, opacity);

        _e.fillRect(x, y, 1, 1);
      }
    }

    _e.globalCompositeOperation = "source-over";

    for (let i=0; i<details.data.length; i+=4) {
      if (
        details.data[i] == Config.filter[94][0] &&
        details.data[i+1] == Config.filter[94][1] &&
        details.data[i+2] == Config.filter[94][2]
      ) {
        setColor(_e, 94);
        _e.fillRect(
          (i/4)%details.width,
          Math.floor((i/4)/details.width),
          1, 1
        );
      }
    }
  },
  flowers: function() {
    let details = _e.getImageData(0, 0, _extra.width, _extra.height);

    _e.globalCompositeOperation = "source-atop";

    for (let y=0; y<_extra.height; y+=5) {
      for (let x=0; x<_extra.width; x+=5) {
        let opacity = Math.random()*0.3;

        let xo = Math.round(Math.random()*2 - 1);
        let yo = Math.round(Math.random()*2 - 1);

        setColor(_e, 226, opacity);

        _e.fillRect(x+xo+1, y+yo-1, 1, 1);
        _e.fillRect(x+xo, y+yo, 3, 1);
        _e.fillRect(x+xo+1, y+yo+1, 1, 1);
      }
    }

    _e.globalCompositeOperation = "source-over";

    for (let i=0; i<details.data.length; i+=4) {
      if (
        details.data[i] == Config.filter[94][0] &&
        details.data[i+1] == Config.filter[94][1] &&
        details.data[i+2] == Config.filter[94][2]
      ) {
        setColor(_e, 94);
        _e.fillRect(
          (i/4)%details.width,
          Math.floor((i/4)/details.width),
          1, 1
        );
      }
    }
  },
  x: function() {
    let details = _e.getImageData(0, 0, _extra.width, _extra.height);

    _e.globalCompositeOperation = "source-atop";

    for (let y=0; y<_extra.height; y+=6) {
      for (let x=0; x<_extra.width; x+=6) {
        let opacity = Math.random()*0.3;

        let xo = Math.round(Math.random()*2 - 1);
        let yo = Math.round(Math.random()*2 - 1);

        setColor(_e, 226, opacity);

        _e.fillRect(x+xo, y+yo-1, 1, 1);
        _e.fillRect(x+xo+2, y+yo-1, 1, 1);
        _e.fillRect(x+xo+1, y+yo, 1, 1);
        _e.fillRect(x+xo, y+yo+1, 1, 1);
        _e.fillRect(x+xo+2, y+yo+1, 1, 1);
      }
    }

    _e.globalCompositeOperation = "source-over";

    for (let i=0; i<details.data.length; i+=4) {
      if (
        details.data[i] == Config.filter[94][0] &&
        details.data[i+1] == Config.filter[94][1] &&
        details.data[i+2] == Config.filter[94][2]
      ) {
        setColor(_e, 94);
        _e.fillRect(
          (i/4)%details.width,
          Math.floor((i/4)/details.width),
          1, 1
        );
      }
    }
  },
  wavy: function(outline) {
    outline = outline || 94;
    let oc = Config.filter[outline];

    let details = _e.getImageData(0, 0, _extra.width, _extra.height);

    _e.globalCompositeOperation = "source-atop";

    for (let y=0; y<_extra.height; y+=3) {
      let opacity = Math.random()*0.4;
      setColor(_e, 226, opacity);
      for (let x=0; x<_extra.width; x++) {
        _e.fillRect(x, y+(x%2), 1, 1);
      }
    }

    _e.globalCompositeOperation = "source-over";

    for (let i=0; i<details.data.length; i+=4) {
      if (
        details.data[i] == oc[0] &&
        details.data[i+1] == oc[1] &&
        details.data[i+2] == oc[2]
      ) {
        setColor(_e, outline);
        _e.fillRect(
          (i/4)%details.width,
          Math.floor((i/4)/details.width),
          1, 1
        );
      }
    }
  },
};