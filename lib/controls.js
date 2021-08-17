var Controls = {
  key: {
    handler: {},
    history: [],
    update: undefined,
    timer: undefined,
  },
};

function init_controls() {
  // key

  document.addEventListener("keydown", function(e) {
    if (e.repeat) return;

    let k = e.key;

    Controls.key.handler[k] = e.type == "keydown";
    Controls.key.history.unshift(k);
  });

  document.addEventListener("keyup", function(e) {
    let k = e.key;

    Controls.key.handler[k] = e.type == "keydown";
    if (k == Controls.key.history[0]) {
      Controls.key.history.shift();
    };
  });

  window.addEventListener("blur", function(e) {
    for (let key in Controls.key.handler) {
      Controls.key.handler[key] = false;
    }
  });
}

Controls.key.update = function() {
  const map = Config.keyMap;

  let handler = Controls.key.handler;
  let history = Controls.key.history;

  for (let i in handler) {
    if (handler[i]) {
      switch (i) {
        case map.up:
          if (history[0] == map.down) break;
          player.move("Up");
          break;
        case map.down:
          if (history[0] == map.up) break;
          player.move("Down");
          break;
        case map.right:
          if (history[0] == map.left) break;
          player.move("Right");
          break;
        case map.left:
          if (history[0] == map.right) break;
          player.move("Left");
          break;
      }
    }
  }
}