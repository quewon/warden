var bank = {
  player: {
    src: "player.png",
    scene: "hub",
    type: "player",
    colmap: [[1]],
  },
  hub: {
    name: "hub",
    src: "hub",
    ambientLight: 0.99,
  },
  glasseye: {
    name: "glasseye",
    src: "glasseye",
    danger: ["medusa"],
  },
  lightswitch: {
    src: "lightswitch.png",
    type: "lightswitch",
    colmap: [[1]],
  },
  jukebox: {
    src: "lightswitch.png",
    type: "jukebox",
    music: "piano",
    colmap: [[1]],
  },

  dialog: {
    doorman: ["❤️", "💖", "💕", "💓", "💘", "💗", "🤍"],
    lightswitch: ["💡"],
    jukebox: ["🎵"],
    stone: ["🪨"],
    medusa: ["🐍👊"]
  }
};