class scene {
  constructor(p) {
    this.aliens = p.aliens || [];
  }

  draw() {
    for (let a in this.aliens) {
      let alien = this.aliens[a];
      _c.putImageData(alien.img, alien.position.x, alien.position.y);
    }
  }
}