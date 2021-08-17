class scene {
  constructor(p) {
    this.aliens = p.aliens || [];
    this.width = Config.viewportWidth;
    this.height = Config.viewportHeight;
  }

  draw() {
    _c.fillStyle = Config.bg;
    _c.fillRect(0, 0, _canvas.width, _canvas.height);

    for (let a in this.aliens) {
      let alien = this.aliens[a];
      alien.draw();
    }
  }

  update() {
    for (let a in this.aliens) {
      let alien = this.aliens[a];
      alien.update();
    }
  }
}