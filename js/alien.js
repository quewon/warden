class alien {
  constructor(p) {
    p = p || {};
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

    this.position = p.position ||
      {
        x: Math.floor(Math.random() * scenes[this.scene].width-this.img.width)*8,
        y: Math.floor(Math.random() * scenes[this.scene].height-this.img.height)*8
      };
    this.animation = {
      goal: {
        x: this.position.x,
        y: this.position.y
      },
      position: {
        x: this.position.x,
        y: this.position.y
      },
      direction: undefined,
      prevDirection: undefined,
      flip: false,
    };
    this.speed = 1;
  }

  update() {
    switch (this.type) {

      case "player":
        break;

      case "rando":

        let rand = Math.random() * 4 | 0;

        switch (rand) {
          case 0:
            this.move("Up");
            break;
          case 1:
            this.move("Down");
            break;
          case 2:
            this.move("Left");
            break;
          case 3:
            this.move("Right");
            break;
        }      

        break;

    }
  }

  draw() {
    // animate
    let ax = this.animation.position.x;
    let gx = this.animation.goal.x;
    let ay = this.animation.position.y;
    let gy = this.animation.goal.y;
    let s = this.speed;

    if (ax>gx) ax -= s;
    else if (ax<gx) ax += s;
    if (ay>gy) ay -= s;
    else if (ay<gy) ay += s;

    if (ax == gx && ay == gy) {
      this.position.x = ax;
      this.position.y = ay;
    }

    this.animation.position.x = ax;
    this.animation.position.y = ay;

    // draw

    drawImage(this.img, ax, ay, this.animation.flip);
  }

  move(direction) {
    if (this.type == "player") {

      // if just started moving
      // or direction has changed

      if (
        (
          this.animation.position.y == this.position.y &&
          this.animation.position.x == this.position.x
        ) ||
        direction != this.animation.prevDirection
      ) {
        scenes[this.scene].update();
      }
    }

    this.animation.prevDirection = this.animation.direction;
    this.animation.direction = direction;

    switch (direction) {
      case "Up":

        this.animation.goal.y = this.position.y-8;

        break;
      case "Down":

        this.animation.goal.y = this.position.y+8;

        break;
      case "Left":

        this.animation.goal.x = this.position.x-8;
        this.animation.flip = true;

        break;
      case "Right":

        this.animation.goal.x = this.position.x+8;
        this.animation.flip = false;

        break;
    }
  }

  moveScene(s) {
    scenes[s].aliens.push(this);
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

  let flip = false;
  if (headspot[0] < _extra.width/16) {
    // console.log(headspot[0], _extra.width/8);
    flip = true;
  }

  if (flip) {
    _e.translate(_extra.width, 0);
    _e.scale(-1, 1);

    _e.clearRect(0, 0, _extra.width, _extra.height);
    _e.drawImage(image, 0, 0);

    _e.setTransform(1, 0, 0, 1, 0, 0);

    image.src = _extra.toDataURL();
  }

  return image
}

function alienName() {
  return "lol"
}

function alienAge() {
  return 10
}