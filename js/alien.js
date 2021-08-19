class alien {
  constructor(p) {
    p = p || {};
    this.id = ref.length;
    this.name = p.name || alienName();
    this.age = p.age || alienAge();
    if (p.img) {
      let image = imgs[p.img];
      this.img = spriteFilter(image);
    } else {
      this.img = alienImage();
    }
    this.type = p.type || "rando";

    this.state = "idle";
    this.moveScene(p.scene || "hub");
    
    this.colmap = p.colmap || this.img.colmap;
    this.position = p.position || this.randomPlacement();
    this.animation = {
      position: { x: this.position.x, y: this.position.y },
      flip: false,
      time: 0,
      width: this.img.width,
      height: this.img.height,
    };
    this.buffer = [];
    this.speed = 0.06;

    ref.push(this);
  }

  randomPlacement() {
    let roomw = scenes[this.scene].width;
    let roomh = scenes[this.scene].height;

    let w = this.colmap[0].length;
    let h = this.colmap.length;

    let x = Math.floor(Math.random() * (roomw-w)) * 8;
    let y = Math.floor(Math.random() * (roomh-h)) * 8;

    return { x:x, y:y }
  }

  step() {
    switch (this.type) {

      case "player":
        break;

      case "rando":
        break;

    }

    if (this.type=="player") {
      if (this.buffer.length > 0) {
        if (this.buffer[0][0] < 0) {
          this.animation.flip = true;
        } else if (this.buffer[0][0] > 0) {
          this.animation.flip = false;
        }
      }

      playsound("step");
    }
  }

  update() {
    if (this.animation.time >= 0.5) {
      if (this.buffer[0][1] == 0) {
        this.squash();
      } else {
        this.stretch();
      }
    } else {
      this.proportional();
    }

    if (this.animation.time < 1 && this.buffer.length > 0) {
      let speed = this.speed + (Math.pow(this.buffer.length, 1.5) * this.speed);
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
    } else if (this.buffer.length > 0) {
      this.position = {
        x: this.animation.position.x,
        y: this.animation.position.y
      };
      this.buffer.shift();
      this.animation.time = 0;
    }

    this.colignore = null;
  }

  squash() {
    this.animation.width = this.img.width + 1;
    this.animation.height = this.img.height - 1;
  }

  stretch() {
    this.animation.width = this.img.width - 1;
    this.animation.height = this.img.height + 1;
  }

  squastretch() {
    this.animation.width = this.img.width + 1;
    this.animation.height = this.img.height + 1;
  }
 
  proportional() {
    this.animation.width = this.img.width;
    this.animation.height = this.img.height;
  }

  draw() {
    let xoffset = 0;
    let yoffset = 0;

    if (this.buffer.length > 0) {
      xoffset = this.buffer[0][0];
      yoffset = this.buffer[0][1];
    }

    drawImage({
      img: this.img,
      x: this.animation.position.x - xoffset,
      y: this.animation.position.y - yoffset,
      flip: this.animation.flip,
      width: this.animation.width,
      height: this.animation.height,
    });
  }

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

    if (this.colliding(dx, dy, input, t).length == 0) {
      this.animation.position.x = newx;
      this.animation.position.y = newy;

      return true
    } else {
      return false
    }
  }

  colliding(x, y, input, t) {
    let w = this.img.width;
    let h = this.img.height;

    let aliens = scenes[this.scene].aliens;

    let col = [];

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
      }
    }

    var allcols = [];

    for (let a in col) {
      var alien = col[a];

      for (let ty in this.colmap) {
        for (let tx in this.colmap[ty]) {
          if (this.colmap[ty][tx] == 0) continue;

          colmapsearch: for (let ay in alien.colmap) {

            for (let ax=0; ax<alien.colmap[ay].length; ax++) {
              if (alien.colmap[ay][ax] == 0) continue;

              let apx = alien.position.x;
              let apy = alien.position.y;

              if (
                x + (tx*8) == apx + (ax*8) &&
                y + (ty*8) == apy + (ay*8)
              ) {
                if (input && t) {
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
              }
            }
          }

        }
      }

    }

    return allcols
  }

  moveScene(s) {
    scenes[s].aliens.push(this.id);
    this.scene = s;
  }
}

function alienImage() {
  let m = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  let erase = {
    bottom: [],
    top: [],
    left: [],
    right: [],
    bottomLeft: [],
    bottomRight: [],
    topLeft: [],
    topRight: []
  };

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

  for (let y in m) {
    for (let x in m[y]) {
      switch (m[y][x]) {
        case "head":
          _e.putImageData(
            G.arrayRandom(alienParts.heads.tiles),
            x * 8, y * 8
          );
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
          _e.fillStyle =
            "rgba("+
            Config.filter[20][0]+","+
            Config.filter[20][1]+","+
            Config.filter[20][2]+","+
            "255)";
          _e.fillRect(x*8, y*8, 8, 8);
          _e.fillStyle =
            "rgba("+
            Config.filter[235][0]+","+
            Config.filter[235][1]+","+
            Config.filter[235][2]+","+
            "255)";
          _e.fillRect(x*8+1, y*8+1, 6, 6);
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

  for (let y in m) {
    for (let x in m[y]) {
      if (m[y][x] == 0) continue;

      y = parseInt(y);
      x = parseInt(x);

      if (minX === null) minX = x;
      if (minY === null) minY = y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;

      maxX = x;
      maxY = y;

      // check diagonal and adjacent tiles

      if (y > 0) {
        if (m[y-1][x] != 0) {
          let imgdata = _e.getImageData(x*8-1, y*8-2, 10, 4);
          let data = imgdata.data;
          for (let i=0; i<data.length; i+=4) {
            // if pixel is black and is adjacent to white px
            // then change it to a white px

            let down = i + imgdata.width*4;
            let up = i - imgdata.width*4;
            let left = i - 4;
            let right = i + 4;
            let upleft = i - imgdata.width*4 - 4;
            let upright = i - imgdata.width*4 + 4;
            let downleft = i + imgdata.width*4 - 4;
            let downright = i + imgdata.width*4 + 4;

            if (
              data[i] == Config.filter[20][0] &&
              data[i+1] == Config.filter[20][1] &&
              data[i+2] == Config.filter[20][2] &&

              (
                data[down+3] != 0 &&
                data[up+3] != 0 &&
                data[left+3] != 0 &&
                data[right+3] != 0 &&
                data[upleft+3] != 0 &&
                data[upright+3] != 0 &&
                data[downleft+3] != 0 &&
                data[downright+3] != 0
              )
            ) {
              data[i] = Config.filter[235][0];
              data[i+1] = Config.filter[235][1];
              data[i+2] = Config.filter[235][2];
            }
          }
          _e.putImageData(imgdata, x*8-1, y*8-2);
        }
      }
      if (x+1 < w) {
        if (m[y][x+1] != 0) {
          let imgdata = _e.getImageData(x*8+6, y*8-1, 4, 10);
          let data = imgdata.data;
          for (let i=0; i<data.length; i+=4) {
            // if pixel is black and is adjacent to white px
            // then change it to a white px

            let down = i + imgdata.width*4;
            let up = i - imgdata.width*4;
            let left = i - 4;
            let right = i + 4;
            let upleft = i - imgdata.width*4 - 4;
            let upright = i - imgdata.width*4 + 4;
            let downleft = i + imgdata.width*4 - 4;
            let downright = i + imgdata.width*4 + 4;

            if (
              data[i] == Config.filter[20][0] &&
              data[i+1] == Config.filter[20][1] &&
              data[i+2] == Config.filter[20][2] &&

              (
                data[down+3] != 0 &&
                data[up+3] != 0 &&
                data[left+3] != 0 &&
                data[right+3] != 0 &&
                data[upleft+3] != 0 &&
                data[upright+3] != 0 &&
                data[downleft+3] != 0 &&
                data[downright+3] != 0
              )
            ) {
              data[i] = Config.filter[235][0];
              data[i+1] = Config.filter[235][1];
              data[i+2] = Config.filter[235][2];
            }
          }
          _e.putImageData(imgdata, x*8+6, y*8-1);
        }
      }
    }
  }

  imgdata = _e.getImageData(minX*8, minY*8, (maxX-minX+1)*8, (maxY-minY+1)*8);

  _extra.width = (maxX-minX+1)*8;
  _extra.height = (maxY-minY+1)*8;

  _e.putImageData(imgdata, 0, 0);

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

  image.colmap = map;

  return image
}

function alienName() {
  return "lol"
}

function alienAge() {
  return 10
}