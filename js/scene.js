class scene {
  constructor(p) {
    this.aliens = p.aliens || [];
    this.static = p.static || [];
    this.width = Config.viewportWidth;
    this.height = Config.viewportHeight;
  }

  draw() {
    _c.fillStyle = Config.bg;
    _c.fillRect(0, 0, _canvas.width, _canvas.height);

    for (let a in this.aliens) {
      let alien = ref[this.aliens[a]];
      alien.update();
    }

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