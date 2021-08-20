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

    let bg = sceneBGs.mosaic(img.width, img.height);
    _e.drawImage(bg, 0, 0);
    _e.putImageData(filtered, 0, 0);

    this.img = new Image();
    this.img.src = _extra.toDataURL();

    // colmap & shadowmap

    _e.clearRect(0, 0, _extra.width, _extra.height);
    _e.drawImage(imgs["scenes/"+src+"_cm.png"], 0, 0);
    var coldata = _e.getImageData(0, 0, _extra.width, _extra.height).data;

    this.colmap = [];
    this.shadowmap = [];

    var alienspawn;
    for (let y=0; y<img.height/8; y++) {
      this.colmap[y] = [];
      this.shadowmap[y] = [];
      for (let x=0; x<img.height/8; x++) {

        console.log(alienspawn, y);

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

            if (k != "alienspawn") {
              alienspawn = null;
            } else {
              if (!alienspawn) {
                alienspawn = x;
                this.colmap[y][alienspawn] = [1, 1];
              } else {
                this.colmap[y][x] = 0;
                let a = this.colmap[y][alienspawn];
                a[0]++;
                a[1]++;
              }
            }
          break searchkey
          }
        }

        this.shadowmap[y][x] = 0;

      }
    }

    console.log(this.colmap);

    // new alien({scene:"hub"})

  }

  draw() {
    setColor(_c, 92);
    _c.fillRect(0, 0, _canvas.width, _canvas.height);
    _c.drawImage(this.img, 0, 0);

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.update();
    }

    // update shadowmap

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.draw();
    }
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
    _extra.width = w*8;
    _extra.height = h*8;
    _e.clearRect(0, 0, _extra.width, _extra.height);

    for (let y=0; y<w; y++) {
      for (let x=0; x<w; x++) {
        let opacity = Math.random();

        setColor(_e, 164, opacity);

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