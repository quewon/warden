var bank = {
  player: {
    src: "player.png",
    scene: "glasseye",
    type: "player",
    colmap: [[1]],
  },
  hub: {
    name: "hub",
    src: "hub",
    ambientLight: 0.99,
    portal: "glasseye",
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
    src: "jukebox.png",
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