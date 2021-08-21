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

    Controls.key.press();
  });

  document.addEventListener("keyup", function(e) {
    let k = e.key;

    Controls.key.handler[k] = e.type == "keydown";

    let i = Controls.key.history.indexOf(k);
    Controls.key.history.splice(i, 1);
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
    if (i != history[0]) continue;

    if (handler[i]) {
      switch (i) {
        case map.up:
          player.move(0, -1);
          break;
        case map.down:
          player.move(0, 1);
          break;
        case map.right:
          player.move(1, 0);
          break;
        case map.left:
          player.move(-1, 0);
          break;
      }
    }
  }
};

Controls.key.press = function() {
  const map = Config.keyMap;

  let handler = Controls.key.handler;
  let history = Controls.key.history;

  for (let i in handler) {
    if (i != history[0]) continue;

    if (handler[i]) {
      switch (i) {
        case map.up:
          player.pushbuffer([0, -1]);
          break;
        case map.down:
          player.pushbuffer([0, 1]);
          break;
        case map.right:
          player.pushbuffer([1, 0]);
          break;
        case map.left:
          player.pushbuffer([-1, 0]);
          break;
        case map.interact:
          player.interact();
          break;
      }
    }
  }
}